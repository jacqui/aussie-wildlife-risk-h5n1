CREATE TABLE "species_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"species_id" integer NOT NULL,
	"url" text NOT NULL,
	"attribution" text,
	"alt_text" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "species_images" ADD CONSTRAINT "species_images_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;