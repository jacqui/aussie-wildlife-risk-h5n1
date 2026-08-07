import { db } from "@/db";
import { species } from "@/db/schema";
import { asc } from "drizzle-orm";
import { SpeciesImageForm } from "@/components/species/species-image-form";
import { createSpeciesImageAction } from "../actions";

interface NewImagePageProps {
  searchParams: Promise<{ speciesId?: string }>;
}

export default async function NewImagePage({
  searchParams,
}: NewImagePageProps) {
  const { speciesId } = await searchParams;

  const speciesOptions = await db
    .select({ id: species.id, commonName: species.commonName })
    .from(species)
    .orderBy(asc(species.commonName));

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <SpeciesImageForm
          speciesOptions={speciesOptions}
          defaultSpeciesId={speciesId ? Number(speciesId) : undefined}
          onSubmit={async (data) => {
            "use server";
            await createSpeciesImageAction(data);
          }}
        />
      </div>
    </main>
  );
}
