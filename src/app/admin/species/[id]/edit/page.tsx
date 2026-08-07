import { db } from "@/db";
import Link from "next/link";
import { species, sources } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SpeciesForm } from "@/components/species/species-form";
import { updateSpeciesAction } from "@/app/admin/species/actions";
import { deleteSourceAction } from "@/app/admin/sources/actions";

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

  const speciesSources = await db
    .select()
    .from(sources)
    .where(eq(sources.speciesId, speciesId))
    .orderBy(desc(sources.accessedAt));

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

      <div className="max-w-2xl mx-auto space-y-4 p-6 border rounded-lg shadow-sm bg-white">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold">Sources</h2>
          <Link
            href={`/admin/sources/new?speciesId=${speciesId}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
          >
            + Add Source
          </Link>
        </div>

        {speciesSources.length === 0 ? (
          <p className="text-sm text-gray-500">No sources recorded yet.</p>
        ) : (
          <ul className="divide-y">
            {speciesSources.map((source) => (
              <li
                key={source.id}
                className="py-3 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:underline break-words"
                  >
                    {source.title || source.url}
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {source.publisher ? `${source.publisher} · ` : ""}
                    {source.sourceType}
                    {source.supportsField
                      ? ` · supports: ${source.supportsField}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <Link
                    href={`/admin/species/${speciesId}/sources/${source.id}/edit`}
                    className="font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteSourceAction(source.id, speciesId);
                    }}
                  >
                    <button
                      type="submit"
                      className="font-medium text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
