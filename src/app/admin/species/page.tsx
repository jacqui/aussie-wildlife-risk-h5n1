import Link from "next/link";
import { db } from "@/db";
import { species } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function AdminSpeciesPage() {
  // Fetch all species ordered alphabetically by common_name
  const speciesList = await db
    .select()
    .from(species)
    .orderBy(asc(species.commonName));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans min-h-screen">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Australian Species at Risk from H5N1 Bird Flu
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage species entries, risk profiles, and regional distributions.
            </p>
          </div>
          <Link
            href="/admin/species/new"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            + Add a Species
          </Link>
        </div>

        {/* Species Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-100/75 text-xs uppercase font-semibold text-zinc-500 border-b border-zinc-200">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Common Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Scientific Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Taxon
                </th>
                <th scope="col" className="px-6 py-3">
                  Conservation
                </th>
                <th scope="col" className="px-6 py-3">
                  Flu Risk
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {speciesList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    No species found in database.
                  </td>
                </tr>
              ) : (
                speciesList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      {item.commonName}
                    </td>
                    <td className="px-6 py-4 italic text-zinc-500">
                      {item.scientificName}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {item.taxonGroup.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {item.conservationStatus?.replace(/_/g, " ") ?? "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize ${
                          item.fluRisk === "high"
                            ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
                            : item.fluRisk === "medium"
                              ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10"
                              : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                        }`}
                      >
                        {item.fluRisk}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <Link
                          href={`/species/${item.slug}`}
                          className="font-medium text-zinc-600 hover:text-zinc-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/species/${item.id}/edit`}
                          className="font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          Edit
                        </Link>
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
