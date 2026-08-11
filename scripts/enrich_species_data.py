
import csv
import json
import time
from pathlib import Path
from urllib.parse import quote

import requests

parent_dir = Path(__file__).resolve().parent.parent

INPUT_CSV = parent_dir / "data" / "species_master.csv"
OUTPUT_CSV = parent_dir / "data" / "species_master_enriched.csv"
DEBUG_LOG = "ala_debug_responses.jsonl" 

ALA_SEARCH_URL = "https://bie.ala.org.au/ws/search.json"
ALA_SPECIES_URL = "https://bie.ala.org.au/ws/species/{guid}.json"

HEADERS = {"User-Agent": "aussie-wildlife-h5n1-tracker research script (contact: lough.jacqui@gmail.com)"}
RATE_LIMIT_SECONDS = 1.0

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


def extract_bio_candidate(profile: dict) -> str:
    # GUESS — verify against DEBUG_LOG and adjust. ALA profiles commonly nest
    # description text under something like "taxonConcept"/"descriptions".
    descriptions = profile.get("descriptions", [])
    for d in descriptions:
        text = d.get("description", "").strip()
        if text:
            return text
    return ""


def extract_image_candidate(profile: dict) -> tuple[str, str]:
    # GUESS — same caveat.
    images = profile.get("images", [])
    if images:
        img = images[0]
        url = img.get("largeImageUrl") or img.get("imageUrl", "")
        attribution = img.get("rightsHolder") or img.get("creator", "")
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
    "bioCandidate",
    "imageUrlCandidate", "imageAttributionCandidate",
    "fluStatusCandidate",
    "scriptStatus", "scriptError",
]

def main():
    with open(INPUT_CSV) as f:
        master_rows = list(csv.DictReader(f))
        base_fieldnames = list(master_rows[0].keys())

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

                    profile = ala_species_profile(match["guid"], log_raw=log_raw)
                    time.sleep(RATE_LIMIT_SECONDS)

                    row["bioCandidate"] = extract_bio_candidate(profile)
                    img_url, img_attr = extract_image_candidate(profile)
                    row["imageUrlCandidate"] = img_url
                    row["imageAttributionCandidate"] = img_attr

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