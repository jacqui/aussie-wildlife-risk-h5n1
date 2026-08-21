CREATE TABLE "homepage_news_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"url" text NOT NULL,
	"display_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_official_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "flu_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "flu_status" SET DEFAULT 'at_risk'::text;--> statement-breakpoint
DROP TYPE "public"."flu_status";--> statement-breakpoint
CREATE TYPE "public"."flu_status" AS ENUM('confirmed_infected', 'at_risk');--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "flu_status" SET DEFAULT 'at_risk'::"public"."flu_status";--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "flu_status" SET DATA TYPE "public"."flu_status" USING "flu_status"::"public"."flu_status";