// src/app/page.tsx
import Link from "next/link";
import { db } from "@/db";
import {
  species,
  speciesImages,
  homepageNewsItems,
  homepageOfficialSources,
} from "@/db/schema";
import { count, desc, eq, inArray } from "drizzle-orm";
import { SpeciesCard } from "@/components/species/species-card";

export default async function Home() {
  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(species);

  const confirmedInfected = await db
    .select()
    .from(species)
    .where(eq(species.fluStatus, "confirmed_infected"))
    .limit(6);

  const totalConfirmedCount = confirmedInfected.length;
  const confirmedIds = confirmedInfected.map((s) => s.id);
  const primaryImages = confirmedIds.length
    ? await db
        .select()
        .from(speciesImages)
        .where(inArray(speciesImages.speciesId, confirmedIds))
    : [];
  const imageBySpeciesId = new Map(
    primaryImages
      .filter((img) => img.isPrimary)
      .map((img) => [img.speciesId, img]),
  );

  const [recentNews, officialSources] = await Promise.all([
    db
      .select()
      .from(homepageNewsItems)
      .orderBy(desc(homepageNewsItems.createdAt)),
    db
      .select()
      .from(homepageOfficialSources)
      .orderBy(desc(homepageOfficialSources.createdAt)),
  ]);

  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 container mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Australian Wildlife at Risk from H5N1 Bird Flu
        </h1>

        <p className="mt-3 text-md leading-relaxed text-zinc-600">
          Australia's geographic isolation has long shielded its wildlife from
          many of the world's most destructive wildlife diseases. H5N1 avian
          influenza, responsible for mass mortality events in wild bird and
          mammal populations across Europe, North and South America, and
          Antarctica, has reached Australian shores. Because so much of
          Australia's wildlife exists nowhere else on Earth, an outbreak here
          carries a distinct risk: catastrophic population losses that can't be
          replenished from elsewhere.
        </p>
        <p className="mt-3 text-md leading-relaxed text-zinc-600">
          This site tracks the Australian species considered most at risk,
          combining official government risk assessments with sourced,
          citation-backed research on each species' conservation status,
          distribution, and current infection status.
        </p>

        <p className="mt-3 text-sm italic text-zinc-500">
          As of {today}, {totalCount} species are tracked, with{" "}
          {totalConfirmedCount} having confirmed H5N1 infections.
        </p>

        <div className="mt-4">
          <Link
            href="/species"
            className="inline-flex items-center rounded-md border border-bush-green px-4 py-2 text-sm font-semibold text-bush-green hover:bg-bush-green hover:text-white transition-colors"
          >
            View all tracked species
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">
            Species with confirmed H5N1 infections
          </h2>
          {confirmedInfected.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              No species in this dataset currently have a confirmed H5N1
              infection status.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {confirmedInfected.map((s) => (
                <Link key={s.id} href={`/species/${s.slug}`} className="block">
                  <SpeciesCard species={s} image={imageBySpeciesId.get(s.id)} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">
            Recent coverage
          </h2>
          {recentNews.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              No news items added yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentNews.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    {item.title}
                  </a>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {item.source}
                    {item.displayDate ? ` · ${item.displayDate}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10 mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Official data sources
          </h2>
          {officialSources.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No sources added yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {officialSources.map((src) => (
                <li
                  key={src.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    {src.name}
                  </a>
                  {src.description && (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {src.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
