import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sources } from "@/db/schema";
import { z } from "zod";

export const insertSourceSchema = createInsertSchema(sources);
export const selectSourceSchema = createSelectSchema(sources);

export type SourceFormData = z.infer<typeof insertSourceSchema>;
