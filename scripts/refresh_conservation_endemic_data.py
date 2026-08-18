# refresh_conservation_and_endemic.py
import csv
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ENRICHED_CSV = DATA_DIR / "species_master_enriched.csv"
PROFILE_CACHE_DIR = DATA_DIR / "profile_cache"


def load_cached_profile(guid: str) -> dict | None:
    cache_key = guid.replace("https://", "").replace("/", "_").replace(":", "_")
    cache_path = PROFILE_CACHE_DIR / f"{cache_key}.json"
    if not cache_path.exists():
        return None
    return json.loads(cache_path.read_text())

CONSERVATION_STATUS_MAP = {
    "critically endangered": "critically_endangered",
    "endangered": "endangered",
    "vulnerable": "vulnerable",
    "extinct in the wild": "extinct_in_wild",
    # Deliberately NOT mapped: "extinct" (no exact enum equivalent — only
    # extinct_in_wild exists) and "conservation dependent" (not in your
    # enum at all). These fall through to "unmapped" below rather than
    # getting force-fit into the wrong category.
}

def extract_conservation_status_candidate(profile: dict) -> tuple[str, str, str]:
    """Returns (candidate_value, raw_aus_status, notes). Only reads the
    federal "AUS" entry -- state/treaty listings use different category
    systems and would need separate handling, not a blind fallback."""
    statuses = profile.get("conservationStatuses", {})
    aus = statuses.get("AUS")

    if not aus:
        if statuses:
            return "", "", f"No federal listing, but found: {list(statuses.keys())} -- these use different category systems, check manually."
        return "", "", "No EPBC/federal listing found. NOT the same as confirmed 'least concern' -- just means not nationally threatened."

    raw_status = aus.get("status", "")
    mapped = CONSERVATION_STATUS_MAP.get(raw_status.lower(), "")

    if not mapped:
        return "", raw_status, f"AUS status '{raw_status}' has no match in your schema enum -- needs a manual decision."

    return mapped, raw_status, ""

ENDEMIC_PHRASES = ["endemic to australia", "found only in australia", "native only to australia"]

def infer_endemic_candidate(bio_text: str) -> tuple[str, str]:
    """A hit is a decent signal (Wikipedia's fairly consistent with this
    phrasing) -- but no hit does NOT mean not-endemic, just unconfirmed
    by this method. Always a candidate, never treat as verified."""
    text_lower = (bio_text or "").lower()
    for phrase in ENDEMIC_PHRASES:
        if phrase in text_lower:
            return "TRUE", f'Wikipedia summary states "{phrase}" -- worth a quick confirm.'
    return "", "No explicit endemism statement in the Wikipedia summary. Check ALA/SPRAT range info manually."

def main():
    with open(ENRICHED_CSV) as f:
        rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys())

    for row in rows:
        if not row.get("alaGuid"):
            continue

        profile = load_cached_profile(row["alaGuid"])
        if profile:
            cons_val, cons_raw, cons_notes = extract_conservation_status_candidate(profile)
            row["conservationStatusCandidate"] = cons_val
            row["conservationStatusCandidateRaw"] = cons_raw
            # piggyback the notes into the existing Raw column if unmapped, so nothing's silently lost
            if cons_notes:
                row["conservationStatusCandidateRaw"] = f"{cons_raw} ({cons_notes})" if cons_raw else cons_notes

        endemic_val, endemic_notes = infer_endemic_candidate(row.get("bioCandidate", ""))
        row["endemicCandidate"] = endemic_val
        row["endemicCandidateNotes"] = endemic_notes

    with open(ENRICHED_CSV, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Refreshed conservation status + endemic candidates for {len(rows)} rows.")


if __name__ == "__main__":
    main()