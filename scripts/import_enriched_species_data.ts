import { parse } from "csv-parse/sync";
import fs from "node:fs";
import { db } from "../src/db";
import { species, sources, speciesImages } from "../src/db/schema";
import { eq } from "drizzle-orm";

const ENRICHED_CSV = "data/species_master_enriched.csv";
const rows = parse(fs.readFileSync(ENRICHED_CSV), { columns: true });

async function run() {
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.scriptStatus !== "done" || !row.alaGuid) {
      skipped++;
      continue;
    }

    const existing = await db
      .select()
      .from(species)
      .where(eq(species.slug, row.slug))
      .limit(1);
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const [inserted] = await db
      .insert(species)
      .values({
        slug: row.slug,
        commonName: row.commonName,
        scientificName: row.scientificName,
        taxonGroup: row.taxonGroup,
        // DRAFT — inferred from a Wikipedia phrase match, not confirmed against
        // ALA/SPRAT range data. Defaults to false when unconfirmed, which is safe
        // here since the public page only ever shows a positive "Endemic" badge —
        // it never asserts "not endemic" — so an unconfirmed species just shows no badge.
        endemic: row.endemicCandidate === "TRUE",
        // DRAFT — from ALA's federal (AUS) listing only. null means either
        // "no EPBC listing" or "status uses a category your enum doesn't have"
        // (see conservationStatusCandidateRaw in the CSV for which).
        conservationStatus: row.conservationStatusCandidate || null,
        fluRisk: row.fluRisk,
        fluStatus: "at_risk",
        bio: row.bioCandidate || null, // DRAFT — Wikipedia-sourced, unverified
        researchStatus: row.researchStatus || "not_started",
      })
      .returning();

    const sourcesToInsert = [];

    if (row.fluRiskVerified === "TRUE" && row.fluRiskSourceUrl) {
      sourcesToInsert.push({
        speciesId: inserted.id,
        url: row.fluRiskSourceUrl,
        publisher: "DCCEEW",
        title:
          "National risk scores for H5 bird flu for native birds and mammals",
        sourceType: "government" as const,
        supportsFields: ["flu_risk"],
        accessedAt: new Date(),
      });
    }

    if (row.bioCandidate && row.bioAttributionCandidate) {
      const supportsFields = ["bio"];
      // The endemic inference was read out of this same Wikipedia summary —
      // same source backs both facts, so one row, not two.
      if (row.endemicCandidate === "TRUE") supportsFields.push("endemic");

      sourcesToInsert.push({
        speciesId: inserted.id,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(row.scientificName.replace(/ /g, "_"))}`,
        publisher: "Wikipedia",
        title: row.scientificName,
        sourceType: "other" as const,
        supportsFields,
        accessedAt: new Date(),
      });
    }

    if (row.conservationStatusCandidate) {
      sourcesToInsert.push({
        speciesId: inserted.id,
        url: `https://bie.ala.org.au/species/${encodeURIComponent(row.alaGuid)}`,
        publisher: "Atlas of Living Australia (ALA)",
        title: `${row.commonName} species profile`,
        sourceType: "government" as const,
        supportsFields: ["conservation_status"],
        accessedAt: new Date(),
      });
    }

    if (sourcesToInsert.length > 0) {
      await db.insert(sources).values(sourcesToInsert);
    }

    if (row.imageUrlCandidate) {
      await db.insert(speciesImages).values({
        speciesId: inserted.id,
        url: row.imageUrlCandidate,
        attribution: row.imageAttributionCandidate || null,
        isPrimary: true,
      });
    }

    imported++;
  }

  console.log(`Imported: ${imported}, Skipped: ${skipped}`);
}

run();
