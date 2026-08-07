import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { speciesImages } from "@/db/schema";
import { z } from "zod";

export const insertSpeciesImageSchema = createInsertSchema(speciesImages);
export const selectSpeciesImageSchema = createSelectSchema(speciesImages);

export type SpeciesImageFormData = z.infer<typeof insertSpeciesImageSchema>;
