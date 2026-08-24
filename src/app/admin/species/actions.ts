"use server";

import { db } from "@/db"; // Path to your drizzle db instance
import { species, sources, speciesImages } from "@/db/schema";

import {
  insertSpeciesSchema,
  type SpeciesFormData,
} from "@/lib/schemas/species";
import { eq } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Only ever redirect back into the admin area — never follow an
// arbitrary/external "returnTo" value (open-redirect protection).
function resolveReturnTo(returnTo?: string) {
  if (returnTo && returnTo.startsWith("/admin")) return returnTo;
  return "/admin/species";
}

export async function createSpeciesAction(data: SpeciesFormData) {
  // 1. Server-side validation check
  const validatedData = insertSpeciesSchema.parse(data);

  // 2. Insert into PostgreSQL
  await db.insert(species).values(validatedData);

  // 3. Revalidate the cache for species listing pages
  revalidatePath("/admin/species");

  // 4. Redirect back to the species admin dashboard
  redirect("/admin/species");
}

export async function updateSpeciesAction(
  id: number,
  data: SpeciesFormData,
  returnTo?: string,
) {
  // 1. Validate incoming data against the Zod schema
  const validatedData = insertSpeciesSchema.parse(data);

  // 2. Update the existing record targeting species.id
  await db
    .update(species)
    .set({
      ...validatedData,
      // Automatically update timestamp if you track edits
      fluStatusUpdatedAt: new Date(),
    })
    .where(eq(species.id, id));

  // 3. Revalidate cache for the admin table and detail pages
  revalidatePath("/admin/species");
  revalidatePath(`/admin/species/${id}/edit`);

  // 4. Redirect back to wherever the editor came from (list w/ filters,
  // search results, etc), falling back to the plain species list.
  redirect(resolveReturnTo(returnTo));
}

export async function deleteSpeciesAction(id: number) {
  // No FK cascade is defined on sources/speciesImages, and the neon-http
  // driver doesn't support transactions — so delete children first,
  // sequentially, before the parent row.
  await db.delete(speciesImages).where(eq(speciesImages.speciesId, id));
  await db.delete(sources).where(eq(sources.speciesId, id));
  await db.delete(species).where(eq(species.id, id));

  revalidatePath("/admin/species");
  revalidatePath("/admin/images");
  revalidatePath("/admin/sources");
}
