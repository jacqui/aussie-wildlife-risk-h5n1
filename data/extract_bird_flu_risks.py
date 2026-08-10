#!/usr/bin/env python3

"""
Extract Table 1 from the DCCEEW National Risk Scores PDF and
convert it to the schema used by the species spreadsheet.

Requires:
    pip install requests pdfplumber pandas

Output:
    bird_flu_risk_scores.csv
"""

from pathlib import Path
import re

import pandas as pd
import pdfplumber
import requests


PDF_URL = (
    "https://www.dcceew.gov.au/sites/default/files/documents/"
    "national-risk-scores-h5-bird-flu-native-birds-mammals.pdf"
)

PDF_PATH = Path("national-risk-scores-h5-bird-flu-native-birds-mammals.pdf")
OUTPUT_PATH = Path("bird_flu_risk_scores.csv")


# These are the approximate x-coordinates where each column begins
# in the PDF. They are stable because the PDF was exported from Excel.
COLUMN_STARTS = {
    "taxonGroup": 40,
    "familyGroup": 76,
    "commonName": 208,
    "scientificName": 385,
    "susceptibilityScore": 585,
    "conservationStatus": 643,
    "fluRisk": 713,
}


OUTPUT_COLUMNS = [
    "id",
    "slug",
    "commonName",
    "scientificName",
    "taxonGroup",
    "endemic",
    "conservationStatus",
    "fluRisk",
    "fluStatus",
    "fluStatusUpdatedAt",
    "regions",
    "bio",
    "endemicVerified",
    "endemicSourceUrl",
    "conservationStatusVerified",
    "conservationStatusSourceUrl",
    "fluRiskVerified",
    "fluRiskSourceUrl",
    "researchStatus",
]


def download_pdf():
    """Download the source PDF if it isn't already present."""

    if PDF_PATH.exists():
        print(f"Using existing PDF: {PDF_PATH}")
        return

    print("Downloading PDF...")

    response = requests.get(PDF_URL, timeout=60)
    response.raise_for_status()

    PDF_PATH.write_bytes(response.content)

    print(f"Saved PDF to {PDF_PATH}")


def column_for_x(x):
    """
    Determine which output column a word belongs to based on
    its horizontal position on the page.
    """

    starts = list(COLUMN_STARTS.items())

    for i, (column, start) in enumerate(starts):
        if i == len(starts) - 1:
            return column

        next_start = starts[i + 1][1]

        if start <= x < (start + next_start) / 2:
            return column

    return starts[-1][0]


def extract_rows():
    """
    Extract species rows from Table 1.

    Pages 2-34 contain the table. Page 2 contains the header;
    subsequent pages contain continuation rows.
    """

    rows = []

    with pdfplumber.open(PDF_PATH) as pdf:

        # Table 1 begins on PDF page 2.
        # The first page has explanatory material before the table.
        for page_number, page in enumerate(pdf.pages[1:], start=2):

            words = page.extract_words(
                x_tolerance=1,
                y_tolerance=1,
                keep_blank_chars=False,
            )

            # Group words by their vertical position.
            grouped = {}

            for word in words:
                text = word["text"].strip()

                if not text:
                    continue

                # Ignore page-number marker.
                if text == "#":
                    continue

                # Round enough to absorb tiny PDF positioning differences.
                y = round(word["top"], 1)

                # Find an existing row at essentially the same y position.
                matching_y = None

                for existing_y in grouped:
                    if abs(existing_y - y) <= 0.5:
                        matching_y = existing_y
                        break

                if matching_y is None:
                    matching_y = y
                    grouped[matching_y] = []

                grouped[matching_y].append(word)

            for y in sorted(grouped):
                words_in_row = grouped[y]

                row = {column: [] for column in COLUMN_STARTS}

                for word in sorted(words_in_row, key=lambda w: w["x0"]):
                    column = column_for_x(word["x0"])
                    row[column].append(word["text"])

                # Join words within each column.
                row = {
                    column: " ".join(values).strip()
                    for column, values in row.items()
                }

                # Only retain actual species rows.
                if row["taxonGroup"] not in {"Birds", "Mammals"}:
                    continue

                # A valid row must have at least common + scientific name.
                if not row["commonName"] or not row["scientificName"]:
                    continue

                # Only track "extreme, very high, high" susceptibility scored species for now
                if row["susceptibilityScore"].lower().strip() not in {"extreme", "very high", "high"}:
                    print(f"Skipping {row['scientificName']} with susceptibility score {row['susceptibilityScore']}")
                    continue

                rows.append(row)

    return rows


def slugify(value):
    """Create a URL-friendly slug."""

    value = value.lower().strip()
    value = value.replace("'", "")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def build_output(rows):
    """Convert extracted rows into the user's spreadsheet schema."""

    records = []

    for row in rows:

        scientific_name = row["scientificName"]
        slug = slugify(scientific_name)

        records.append(
            {
                "id": None,
                "slug": slug,

                "commonName": row["commonName"],
                "scientificName": scientific_name,
                "taxonGroup": row["taxonGroup"],

                # Do not infer endemic status from this table.
                "endemic": None,

                "conservationStatus": (
                    row["conservationStatus"]
                    if row["conservationStatus"]
                    else None
                ),

                "fluRisk": (
                    row["susceptibilityScore"]
                    if row["susceptibilityScore"]
                    else None
                ),

                # This PDF is a risk assessment, not a
                # surveillance/status dataset.
                "fluStatus": None,
                "fluStatusUpdatedAt": None,

                # These aren't supplied by Table 1.
                "regions": None,
                "bio": None,

                "endemicVerified": None,
                "endemicSourceUrl": None,

                # Conservation status comes directly from the table.
                "conservationStatusVerified": True,
                "conservationStatusSourceUrl": PDF_URL,

                # Flu risk comes directly from the table.
                "fluRiskVerified": True,
                "fluRiskSourceUrl": PDF_URL,

                "researchStatus": None,
            }
        )

    df = pd.DataFrame(records, columns=OUTPUT_COLUMNS)

    # Remove duplicate rows. Some pages in the PDF are represented
    # twice by PDF table extraction because of duplicated table objects.
    df = df.drop_duplicates(
        subset=[
            "taxonGroup",
            "commonName",
            "scientificName",
            "conservationStatus",
            "fluRisk",
        ]
    )

    return df


def main():
    download_pdf()

    print("Extracting Table 1...")
    rows = extract_rows()

    print(f"Raw rows extracted: {len(rows)}")

    df = build_output(rows)

    print(f"Unique species rows: {len(df)}")

    # Helpful sanity checks.
    print("\nTaxon groups:")
    print(df["taxonGroup"].value_counts())

    print("\nFlu risk:")
    print(df["fluRisk"].value_counts(dropna=False))

    print("\nConservation status:")
    print(df["conservationStatus"].value_counts(dropna=False))

    df.to_csv(
        OUTPUT_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    print(f"\nWrote: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
