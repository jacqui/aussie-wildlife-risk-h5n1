-- 1. fewer choices in enum
CREATE TYPE "flu_status_new" AS ENUM ('confirmed_infected', 'at_risk');

-- 2. New column on that type, defaulting to at_risk
ALTER TABLE "species" ADD COLUMN "flu_status_new" "flu_status_new" NOT NULL DEFAULT 'at_risk';

-- 3. Backfill: confirmed_infected stays confirmed_infected, everything else
--    (at_risk, historically_affected, no_known_risk) collapses to at_risk
UPDATE "species" SET "flu_status_new" =
  CASE
    WHEN "flu_status"::text = 'confirmed_infected' THEN 'confirmed_infected'::"flu_status_new"
    ELSE 'at_risk'::"flu_status_new"
  END;

-- 4. Drop the old column and its now-unused type
ALTER TABLE "species" DROP COLUMN "flu_status";
DROP TYPE "flu_status";

-- 5. Rename the new ones into place
ALTER TABLE "species" RENAME COLUMN "flu_status_new" TO "flu_status";
ALTER TYPE "flu_status_new" RENAME TO "flu_status";