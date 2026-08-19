// src/app/species/page.tsx
import Link from "next/link";
import { db } from "@/db";
import { species, speciesImages } from "@/db/schema";
import { asc, ilike, inArray, or, count } from "drizzle-orm";
import { SpeciesCard } from "@/components/species/species-card";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 24; // divisible by 2/3/4 columns at each breakpoint

interface SpeciesPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

function buildHref(params: { q?: string; page?: number }) {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.page && params.page > 1) usp.set("page", String(params.page));
  const qs = usp.toString();
  return `/species${qs ? `?${qs}` : ""}`;
}

export default async function SpeciesPage({ searchParams }: SpeciesPageProps) {
  const { q, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const whereClause = q
    ? or(
        ilike(species.commonName, `%${q}%`),
        ilike(species.scientificName, `%${q}%`),
      )
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

  const speciesIds = speciesList.map((s) => s.id);
  const primaryImages = speciesIds.length
    ? await db
        .select()
        .from(speciesImages)
        .where(inArray(speciesImages.speciesId, speciesIds))
    : [];
  const imageBySpeciesId = new Map(
    primaryImages
      .filter((img) => img.isPrimary)
      .map((img) => [img.speciesId, img]),
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Australian Species at Risk from H5N1 Bird Flu
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {totalCount} species tracked
        </p>

        <form
          action="/species"
          method="GET"
          className="mt-4 flex gap-2 max-w-sm"
        >
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search species…"
            className="w-full rounded-md border border-zinc-300 p-2 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-bush-green rounded-md hover:opacity-90"
          >
            Search
          </button>
          {q && (
            <Link
              href="/species"
              className="px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
              Clear
            </Link>
          )}
        </form>

        {speciesList.length === 0 ? (
          <p className="mt-8 text-zinc-500">No species match "{q}".</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {speciesList.map((s) => (
              <Link key={s.id} href={`/species/${s.slug}`} className="block">
                <SpeciesCard species={s} image={imageBySpeciesId.get(s.id)} />
              </Link>
            ))}
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildHref={(page) => buildHref({ q, page })}
        />
      </main>
    </div>
  );
}
