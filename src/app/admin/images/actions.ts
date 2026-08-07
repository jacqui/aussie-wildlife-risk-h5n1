"use server";

import { db } from "@/db";
import { speciesImages } from "@/db/schema";
import {
  insertSpeciesImageSchema,
  type SpeciesImageFormData,
} from "@/lib/schemas/species-image";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function clearExistingPrimary(speciesId: number, exceptImageId?: number) {
  const condition = exceptImageId
    ? and(
        eq(speciesImages.speciesId, speciesId),
        ne(speciesImages.id, exceptImageId),
      )
    : eq(speciesImages.speciesId, speciesId);

  await db.update(speciesImages).set({ isPrimary: false }).where(condition);
}

export async function createSpeciesImageAction(data: SpeciesImageFormData) {
  const validatedData = insertSpeciesImageSchema.parse(data);
  if (validatedData.isPrimary)
    await clearExistingPrimary(validatedData.speciesId);
  await db.insert(speciesImages).values(validatedData);
  revalidatePath("/admin/images");
  revalidatePath(`/admin/species/${validatedData.speciesId}/edit`);
  redirect("/admin/images");
}

export async function updateSpeciesImageAction(
  imageId: number,
  data: SpeciesImageFormData,
) {
  const validatedData = insertSpeciesImageSchema.parse(data);
  if (validatedData.isPrimary) {
    await clearExistingPrimary(validatedData.speciesId, imageId);
  }
  await db
    .update(speciesImages)
    .set(validatedData)
    .where(eq(speciesImages.id, imageId));
  revalidatePath("/admin/images");
  revalidatePath(`/admin/species/${validatedData.speciesId}/edit`);
  redirect("/admin/images");
}

export async function deleteSpeciesImageAction(
  imageId: number,
  speciesId: number,
) {
  await db.delete(speciesImages).where(eq(speciesImages.id, imageId));
  revalidatePath("/admin/images");
  revalidatePath(`/admin/species/${speciesId}/edit`);
}
