CREATE TYPE "public"."research_status" AS ENUM('not_started', 'in_progress', 'needs_review', 'verified');--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "flu_risk" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "flu_risk" SET DEFAULT 'low'::text;--> statement-breakpoint
DROP TYPE "public"."flu_risk";--> statement-breakpoint
CREATE TYPE "public"."flu_risk" AS ENUM('low', 'moderate', 'high', 'very_high', 'extreme');--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "flu_risk" SET DEFAULT 'low'::"public"."flu_risk";--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "flu_risk" SET DATA TYPE "public"."flu_risk" USING "flu_risk"::"public"."flu_risk";--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "research_status" "research_status" DEFAULT 'not_started' NOT NULL;