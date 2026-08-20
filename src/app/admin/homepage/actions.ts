"use server";

import { db } from "@/db";
import { homepageNewsItems, homepageOfficialSources } from "@/db/schema";
import {
  insertHomepageNewsItemSchema,
  type HomepageNewsItemFormData,
} from "@/lib/schemas/homepage-news-item";
import {
  insertHomepageOfficialSourceSchema,
  type HomepageOfficialSourceFormData,
} from "@/lib/schemas/homepage-official-source";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNewsItemAction(data: HomepageNewsItemFormData) {
  const validated = insertHomepageNewsItemSchema.parse(data);
  await db.insert(homepageNewsItems).values(validated);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage");
}

export async function updateNewsItemAction(
  id: number,
  data: HomepageNewsItemFormData,
) {
  const validated = insertHomepageNewsItemSchema.parse(data);
  await db
    .update(homepageNewsItems)
    .set(validated)
    .where(eq(homepageNewsItems.id, id));
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage");
}

export async function deleteNewsItemAction(id: number) {
  await db.delete(homepageNewsItems).where(eq(homepageNewsItems.id, id));
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function createOfficialSourceAction(
  data: HomepageOfficialSourceFormData,
) {
  const validated = insertHomepageOfficialSourceSchema.parse(data);
  await db.insert(homepageOfficialSources).values(validated);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage");
}

export async function updateOfficialSourceAction(
  id: number,
  data: HomepageOfficialSourceFormData,
) {
  const validated = insertHomepageOfficialSourceSchema.parse(data);
  await db
    .update(homepageOfficialSources)
    .set(validated)
    .where(eq(homepageOfficialSources.id, id));
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage");
}

export async function deleteOfficialSourceAction(id: number) {
  await db
    .delete(homepageOfficialSources)
    .where(eq(homepageOfficialSources.id, id));
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}
