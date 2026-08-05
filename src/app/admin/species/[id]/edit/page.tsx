import { db } from "@/db";
import { species } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { SpeciesForm } from "@/components/species/species-form";
import { updateSpeciesAction } from "../../actions";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSpeciesPage({ params }: EditPageProps) {
  const { id } = await params;
  const speciesId = Number(id);

  const results = await db
    .select()
    .from(species)
    .where(eq(species.id, speciesId))
    .limit(1);

  const existingSpecies = results[0];

  if (!existingSpecies) {
    notFound();
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <SpeciesForm
          initialData={existingSpecies}
          onSubmit={async (data) => {
            "use server";
            await updateSpeciesAction(speciesId, data);
          }}
        />
      </div>
    </main>
  );
}
