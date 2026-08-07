import { db } from "@/db";
import { sources, species } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SourceForm } from "@/components/species/source-form";
import { updateSourceAction } from "@/app/admin/sources/actions";

interface EditSourcePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSourcePage({ params }: EditSourcePageProps) {
  const { id } = await params;

  const [existingSource, speciesOptions] = await Promise.all([
    db
      .select()
      .from(sources)
      .where(eq(sources.id, Number(id)))
      .limit(1)
      .then((r) => r[0]),
    db
      .select({ id: species.id, commonName: species.commonName })
      .from(species)
      .orderBy(asc(species.commonName)),
  ]);

  if (!existingSource) notFound();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <SourceForm
          speciesOptions={speciesOptions}
          initialData={existingSource}
          onSubmit={async (data) => {
            "use server";
            await updateSourceAction(existingSource.id, data);
          }}
        />
      </div>
    </main>
  );
}
