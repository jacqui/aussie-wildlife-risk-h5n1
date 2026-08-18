// scripts/audit_enriched_csv.ts
import { parse } from "csv-parse/sync";
import fs from "node:fs";
import { species } from "../src/db/schema";

const rows = parse(fs.readFileSync("data/species_master_enriched.csv"), { columns: true });

const CHECKS = {
  fluRisk: { column: "fluRisk", valid: new Set(species.fluRisk.enumValues) },
  taxonGroup: { column: "taxonGroup", valid: new Set(species.taxonGroup.enumValues) },
  conservationStatusCandidate: { column: "conservationStatusCandidate", valid: new Set([...species.conservationStatus.enumValues, ""]) },
  researchStatus: { column: "researchStatus", valid: new Set(species.researchStatus.enumValues) },
};

for (const [label, { column, valid }] of Object.entries(CHECKS)) {
  const badValues = new Map<string, number>();
  for (const row of rows) {
    const val = row[column] ?? "";
    if (!valid.has(val)) {
      badValues.set(val, (badValues.get(val) ?? 0) + 1);
    }
  }
  if (badValues.size > 0) {
    console.log(`\n${label} — invalid values found:`);
    for (const [val, count] of badValues) {
      console.log(`  "${val}": ${count} row(s)`);
    }
  } else {
    console.log(`${label} — all values valid ✓`);
  }
}