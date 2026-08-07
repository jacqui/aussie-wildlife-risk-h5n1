"use server";

import { db } from "@/db";
import { sources } from "@/db/schema";
import { insertSourceSchema, type SourceFormData } from "@/lib/schemas/sources";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSourceAction(data: SourceFormData) {
  const validatedData = insertSourceSchema.parse(data);
  await db.insert(sources).values(validatedData);
  revalidatePath("/admin/sources");
  revalidatePath(`/admin/species/${validatedData.speciesId}/edit`);
  redirect("/admin/sources");
}

export async function updateSourceAction(
  sourceId: number,
  data: SourceFormData,
) {
  const validatedData = insertSourceSchema.parse(data);
  await db.update(sources).set(validatedData).where(eq(sources.id, sourceId));
  revalidatePath("/admin/sources");
  revalidatePath(`/admin/species/${validatedData.speciesId}/edit`);
  redirect("/admin/sources");
}

// No redirect on delete — called inline from the sources list/species edit
// list and should just refresh in place.
export async function deleteSourceAction(sourceId: number, speciesId: number) {
  await db.delete(sources).where(eq(sources.id, sourceId));
  revalidatePath("/admin/sources");
  revalidatePath(`/admin/species/${speciesId}/edit`);
}
