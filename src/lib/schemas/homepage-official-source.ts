import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { homepageOfficialSources } from "@/db/schema";
import { z } from "zod";

export const insertHomepageOfficialSourceSchema = createInsertSchema(
  homepageOfficialSources,
);
export const selectHomepageOfficialSourceSchema = createSelectSchema(
  homepageOfficialSources,
);
export type HomepageOfficialSourceFormData = z.infer<
  typeof insertHomepageOfficialSourceSchema
>;
