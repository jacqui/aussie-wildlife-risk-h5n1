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

        {/* existing status filter bar goes here, unchanged — just make sure
            its links also reset page: `/admin/species?status=${s}` with no
            page param, since switching filters should always land on page 1 */}

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          {/* ...existing table, unchanged... */}
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
