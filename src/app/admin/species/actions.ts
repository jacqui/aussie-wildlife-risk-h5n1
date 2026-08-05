"use server";

import { db } from "@/db"; // Path to your drizzle db instance
import { species } from "@/db/schema";

import {
  insertSpeciesSchema,
  type SpeciesFormData,
} from "@/lib/schemas/species";
import { eq } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function updateSpeciesAction(id: number, data: SpeciesFormData) {
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

  // 4. Redirect back to the main species list
  redirect("/admin/species");
}
