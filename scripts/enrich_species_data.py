
import csv
import json
import time
from pathlib import Path
from urllib.parse import quote

import requests
import wikipediaapi

parent_dir = Path(__file__).resolve().parent.parent

MASTER_CSV = parent_dir / "data" / "species_master.csv"
ENRICHED_CSV = parent_dir / "data" / "species_master_enriched.csv"

INPUT_CSV = ENRICHED_CSV if ENRICHED_CSV.exists() else MASTER_CSV
OUTPUT_CSV = ENRICHED_CSV

DEBUG_LOG = "ala_debug_responses.jsonl" 

ALA_SEARCH_URL = "https://bie.ala.org.au/ws/search.json"
ALA_SPECIES_URL = "https://bie.ala.org.au/ws/species/{guid}.json"

PROFILE_CACHE_DIR = parent_dir / "data" / "profile_cache"
PROFILE_CACHE_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "aussie-wildlife-h5n1-tracker research script (contact: lough.jacqui@gmail.com)"}
RATE_LIMIT_SECONDS = 1.0

wiki = wikipediaapi.Wikipedia(
    user_agent="AustralianWildlifeResearchProject/1.0 (lough.jacqui@gmail.com)",
    language="en",
    extract_format=wikipediaapi.ExtractFormat.WIKI
)

def ala_search(scientific_name: str, log_raw: bool = False) -> dict | None:
    """Search ALA's BIE for a scientific name; return the best species-rank match."""
    resp = requests.get(
        ALA_SEARCH_URL,
        params={"q": f'"{scientific_name}"', "fq": "idxtype:TAXON"},
        headers=HEADERS,
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()

    if log_raw:
        with open(DEBUG_LOG, "a") as f:
            f.write(json.dumps({"query": scientific_name, "response": data}) + "\n")

    results = data.get("searchResults", {}).get("results", [])
    for r in results:
        if r.get("scientificName", "").lower() == scientific_name.lower() and r.get("rank") == "species":
            return r
    return results[0] if results else None


def ala_species_profile(guid: str, log_raw: bool = False) -> dict:
    """Fetch the full species profile — description text, images, conservation statuses."""
    resp = requests.get(
        ALA_SPECIES_URL.format(guid=quote(guid, safe="")),
        headers=HEADERS,
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()

    if log_raw:
        with open(DEBUG_LOG, "a") as f:
            f.write(json.dumps({"guid": guid, "profile_response": data}) + "\n")

    return data

def get_cached_profile(guid: str, log_raw: bool = False) -> dict:
    """Fetch an ALA species profile once, then reuse from disk on every future run."""
    cache_key = guid.replace("https://", "").replace("/", "_").replace(":", "_")
    cache_path = PROFILE_CACHE_DIR / f"{cache_key}.json"

    if cache_path.exists():
        return json.loads(cache_path.read_text())

    profile = ala_species_profile(guid, log_raw=log_raw)
    cache_path.write_text(json.dumps(profile))
    return profile

def extract_bio_candidate(scientific_name: str) -> tuple[str, str]:
    attr = "Wikipedia (https://en.wikipedia.org/wiki/" + quote(scientific_name.replace(" ", "_")) + ")"
    try:
        page = wiki.page(scientific_name)
        if page.exists():
            return page.summary, attr
    except Exception as e:
        print(f"  Wikipedia lookup failed for {scientific_name}: {e}")
    return "No summary available on Wikipedia for this species.", attr

def get_ala_image_url(image_id: str, image_size: str = "thumbnail_large") -> str:
    clean_id = image_id.strip().strip('"').strip("'")
    path_fragment = "/".join(clean_id[:4])
    return f"https://images.ala.org.au/store/{path_fragment}/{clean_id}/{image_size}"


def extract_image_candidate(profile: dict) -> tuple[str, str]:
    image_id = profile.get("imageIdentifier", "")
    if image_id:
        url = get_ala_image_url(image_id)
        attribution = "Atlas of Living Australia (ALA) via https://bie.ala.org.au/species/" + profile.get("guid", "")
        return url, attribution
    return "", ""


def load_existing_output() -> dict[str, dict]:
    """Resume support: species already marked 'done' get skipped on re-run."""
    if not Path(OUTPUT_CSV).exists():
        return {}
    with open(OUTPUT_CSV) as f:
        return {row["scientificName"]: row for row in csv.DictReader(f)}
    
CANDIDATE_FIELDS = [
    "alaGuid",
    "endemicCandidate", "endemicCandidateNotes",
    "conservationStatusCandidate", "conservationStatusCandidateRaw",
    "bioCandidate", "bioAttributionCandidate",
    "imageUrlCandidate", "imageAttributionCandidate",
    "fluStatusCandidate",
    "scriptStatus", "scriptError",
]

def main():

    with open(INPUT_CSV) as f:
        master_rows = list(csv.DictReader(f))
        base_fieldnames = [f for f in master_rows[0].keys() if f not in CANDIDATE_FIELDS]

    output_fieldnames = base_fieldnames + CANDIDATE_FIELDS

    existing = load_existing_output()

    with open(OUTPUT_CSV, "w", newline="") as out_f:
        writer = csv.DictWriter(out_f, fieldnames=output_fieldnames)
        writer.writeheader()

        for i, row in enumerate(master_rows):
            sci_name = row["scientificName"]

            if sci_name in existing and existing[sci_name].get("scriptStatus") == "done":
                writer.writerow(existing[sci_name])
                out_f.flush()
                continue

            row = dict(row)
            row.update({k: "" for k in CANDIDATE_FIELDS})

            try:
                log_raw = i < 5  # debug the first 5 only — check these before letting it run unattended
                match = ala_search(sci_name, log_raw=log_raw)
                time.sleep(RATE_LIMIT_SECONDS)

                if match:
                    row["alaGuid"] = match.get("guid", "")
                    row["conservationStatusCandidateRaw"] = match.get("conservationStatus") or ""

                    cache_path = PROFILE_CACHE_DIR / f"{match['guid'].replace('https://', '').replace('/', '_').replace(':', '_')}.json"
                    was_cached = cache_path.exists()
                    profile = get_cached_profile(match["guid"], log_raw=log_raw)
                    if not was_cached:
                        time.sleep(RATE_LIMIT_SECONDS)

                    bio_text, bio_attr = extract_bio_candidate(sci_name)
                    row["bioCandidate"] = bio_text
                    row["bioAttributionCandidate"] = bio_attr

                    img_url, img_attr = extract_image_candidate(profile)
                    row["imageUrlCandidate"] = img_url
                    row["imageAttributionCandidate"] = img_attr

                    if row["researchStatus"] == "not_started":
                        row["researchStatus"] = "in_progress"

                row["scriptStatus"] = "done"

            except Exception as e:
                row["scriptStatus"] = "error"
                row["scriptError"] = str(e)
                print(f"[{i+1}/{len(master_rows)}] ERROR on {sci_name}: {e}")

            writer.writerow(row)
            out_f.flush()  # write incrementally — don't lose 300 species of work to one crash

            print(f"[{i+1}/{len(master_rows)}] {sci_name}: {row['scriptStatus']}")


if __name__ == "__main__":
    main()