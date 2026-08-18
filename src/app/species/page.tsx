// src/app/species/page.tsx
import Link from "next/link";
import { db } from "@/db";
import { species, speciesImages } from "@/db/schema";
import { asc, count, eq, inArray } from "drizzle-orm";
import { SpeciesCard } from "@/components/species/species-card";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 24; // divisible by 2/3/4 columns at each breakpoint

interface SpeciesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function SpeciesPage({ searchParams }: SpeciesPageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(species);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const speciesList = await db
    .select()
    .from(species)
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

  const buildHref = (page: number) =>
    page > 1 ? `/species?page=${page}` : "/species";

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Australian Species at Risk from H5N1 Bird Flu
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {totalCount} species tracked
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {speciesList.map((s) => (
            <Link key={s.id} href={`/species/${s.slug}`} className="block">
              <SpeciesCard species={s} image={imageBySpeciesId.get(s.id)} />
            </Link>
          ))}
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
