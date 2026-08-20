import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { homepageNewsItems } from "@/db/schema";
import { z } from "zod";

export const insertHomepageNewsItemSchema =
  createInsertSchema(homepageNewsItems);
export const selectHomepageNewsItemSchema =
  createSelectSchema(homepageNewsItems);
export type HomepageNewsItemFormData = z.infer<
  typeof insertHomepageNewsItemSchema
>;
