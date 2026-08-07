import { db } from "@/db";
import { species } from "@/db/schema";
import { asc } from "drizzle-orm";
import { SourceForm } from "@/components/species/source-form";
import { createSourceAction } from "@/app/admin/sources/actions";

interface NewSourcePageProps {
  searchParams: Promise<{ speciesId?: string }>;
}

export default async function NewSourcePage({
  searchParams,
}: NewSourcePageProps) {
  const { speciesId } = await searchParams;

  const speciesOptions = await db
    .select({ id: species.id, commonName: species.commonName })
    .from(species)
    .orderBy(asc(species.commonName));

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <SourceForm
          speciesOptions={speciesOptions}
          defaultSpeciesId={speciesId ? Number(speciesId) : undefined}
          onSubmit={async (data) => {
            "use server";
            await createSourceAction(data);
          }}
        />
      </div>
    </main>
  );
}
