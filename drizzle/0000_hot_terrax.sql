CREATE TYPE "public"."conservation_status" AS ENUM('least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered', 'extinct_in_wild');--> statement-breakpoint
CREATE TYPE "public"."flu_risk" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."flu_status" AS ENUM('confirmed_infected', 'at_risk', 'historically_affected', 'no_known_risk');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('government', 'ngo', 'academic', 'news', 'other');--> statement-breakpoint
CREATE TYPE "public"."taxon_group" AS ENUM('bird', 'mammal', 'seal_sea_lion', 'other');--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"species_id" integer NOT NULL,
	"url" text NOT NULL,
	"publisher" text,
	"title" text,
	"source_type" "source_type" NOT NULL,
	"supports_field" text,
	"accessed_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"common_name" text NOT NULL,
	"scientific_name" text NOT NULL,
	"taxon_group" "taxon_group" NOT NULL,
	"endemic" boolean DEFAULT false NOT NULL,
	"conservation_status" "conservation_status",
	"flu_risk" "flu_risk" DEFAULT 'low' NOT NULL,
	"flu_status" "flu_status" DEFAULT 'no_known_risk' NOT NULL,
	"flu_status_updated_at" timestamp,
	"regions" text[],
	"bio" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "species_slug_unique" UNIQUE("slug"),
	CONSTRAINT "species_scientific_name_unique" UNIQUE("scientific_name")
);
--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;