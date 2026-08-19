// src/app/admin/species/page.tsx
import Link from "next/link";
import { db } from "@/db";
import { species } from "@/db/schema";
import { asc, count, eq } from "drizzle-orm";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 25;

interface AdminSpeciesPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminSpeciesPage({
  searchParams,
}: AdminSpeciesPageProps) {
  const { status, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const whereClause = status
    ? eq(species.researchStatus, status as any)
    : undefined;

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(species)
    .where(whereClause);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const speciesList = await db
    .select()
    .from(species)
    .where(whereClause)
    .orderBy(asc(species.commonName))
    .limit(PAGE_SIZE)
    .offset((currentPage - 1) * PAGE_SIZE);

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/admin/species${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans min-h-screen">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Australian Species at Risk from H5N1 Bird Flu
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {totalCount} species · page {currentPage} of {totalPages}
            </p>
          </div>
          <Link
            href="/admin/species/new"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Add a Species
          </Link>
        </div>

        <div className="flex gap-2 text-sm">
          {[
            "all",
            "not_started",
            "in_progress",
            "needs_review",
            "verified",
          ].map((s) => (
            <Link
              key={s}
              href={
                s === "all" ? "/admin/species" : `/admin/species?status=${s}`
              }
              className={`px-3 py-1 rounded-full capitalize ${
                (status ?? "all") === s
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {s.replace(/_/g, " ")}
            </Link>
          ))}
        </div>

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
                <th scope="col" className="px-6 py-3">
                  Research Status
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
                          item.fluRisk === "extreme"
                            ? "bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20"
                            : item.fluRisk === "very_high"
                              ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
                              : item.fluRisk === "high"
                                ? "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/10"
                                : item.fluRisk === "moderate"
                                  ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10"
                                  : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                        }`}
                      >
                        {item.fluRisk.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize ${
                          item.researchStatus === "verified"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                            : item.researchStatus === "needs_review"
                              ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
                              : item.researchStatus === "in_progress"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10"
                                : "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/10"
                        }`}
                      >
                        {item.researchStatus.replace(/_/g, " ")}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildHref={buildHref}
        />
      </main>
    </div>
  );
}
