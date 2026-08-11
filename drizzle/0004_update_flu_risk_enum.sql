-- Custom SQL migration file, put your code below! --

ALTER TYPE "flu_risk" RENAME VALUE 'medium' TO 'moderate';
ALTER TYPE "flu_risk" ADD VALUE 'very_high' AFTER 'high';
ALTER TYPE "flu_risk" ADD VALUE 'extreme' AFTER 'very_high';