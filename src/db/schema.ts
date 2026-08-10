import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const taxonGroupEnum = pgEnum("taxon_group", [
  "bird",
  "mammal",
  "seal_sea_lion",
  "other",
]);

export const conservationStatusEnum = pgEnum("conservation_status", [
  "least_concern",
  "near_threatened",
  "vulnerable",
  "endangered",
  "critically_endangered",
  "extinct_in_wild",
]);

export const fluRiskEnum = pgEnum("flu_risk", [
  "low",
  "moderate",
  "high",
  "very_high",
  "extreme",
]);

export const fluStatusEnum = pgEnum("flu_status", [
  "confirmed_infected",
  "at_risk",
  "historically_affected",
  "no_known_risk",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "government",
  "ngo",
  "academic",
  "news",
  "other",
]);

export const species = pgTable("species", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name").notNull().unique(),
  taxonGroup: taxonGroupEnum("taxon_group").notNull(),
  endemic: boolean("endemic").notNull().default(false),
  conservationStatus: conservationStatusEnum("conservation_status"),
  fluRisk: fluRiskEnum("flu_risk").notNull().default("low"),
  fluStatus: fluStatusEnum("flu_status").notNull().default("no_known_risk"),
  fluStatusUpdatedAt: timestamp("flu_status_updated_at"),
  regions: text("regions").array(),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  speciesId: integer("species_id")
    .notNull()
    .references(() => species.id),
  url: text("url").notNull(),
  publisher: text("publisher"),
  title: text("title"),
  sourceType: sourceTypeEnum("source_type").notNull(),
  supportsFields: text("supports_fields").array(), // was: supportsField (singular text)
  accessedAt: timestamp("accessed_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const speciesImages = pgTable("species_images", {
  id: serial("id").primaryKey(),
  speciesId: integer("species_id")
    .notNull()
    .references(() => species.id),
  url: text("url").notNull(),
  attribution: text("attribution"),
  altText: text("alt_text"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
