import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { species } from "@/db/schema";
import { z } from "zod";

// Shared Zod Schemas
export const insertSpeciesSchema = createInsertSchema(species);
export const selectSpeciesSchema = createSelectSchema(species);

// Types
export type SpeciesFormData = z.infer<typeof insertSpeciesSchema>;
