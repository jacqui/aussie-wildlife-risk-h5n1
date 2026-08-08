import Link from "next/link";
import { db } from "@/db";
import { sources, species } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { deleteSourceAction } from "@/app/admin/sources/actions";

export default async function AdminSourcesPage() {
  const allSources = await db
    .select({
      id: sources.id,
      url: sources.url,
      title: sources.title,
      publisher: sources.publisher,
      sourceType: sources.sourceType,
      supportsFields: sources.supportsFields,
      accessedAt: sources.accessedAt,
      speciesId: sources.speciesId,
      speciesCommonName: species.commonName,
    })
    .from(sources)
    .innerJoin(species, eq(sources.speciesId, species.id))
    .orderBy(desc(sources.accessedAt));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans min-h-screen">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Sources
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Every citation across all species, in one place.
            </p>
          </div>
          <Link
            href="/admin/sources/new"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Add a Source
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-100/75 text-xs uppercase font-semibold text-zinc-500 border-b border-zinc-200">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Species
                </th>
                <th scope="col" className="px-6 py-3">
                  Source
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Supports
                </th>
                <th scope="col" className="px-6 py-3">
                  Accessed
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {allSources.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    No sources recorded yet.
                  </td>
                </tr>
              ) : (
                allSources.map((source) => (
                  <tr
                    key={source.id}
                    className="hover:bg-zinc-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      <Link
                        href={`/admin/species/${source.speciesId}/edit`}
                        className="hover:underline"
                      >
                        {source.speciesCommonName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {source.title || source.url}
                      </a>
                      {source.publisher && (
                        <p className="text-xs text-zinc-500">
                          {source.publisher}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {source.sourceType}
                    </td>
                    <td className="px-6 py-4">
                      {source.supportsFields ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(source.accessedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <Link
                          href={`/admin/sources/${source.id}/edit`}
                          className="font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteSourceAction(
                              source.id,
                              source.speciesId,
                            );
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
