import { db } from "@/db";
import { species, speciesImages, sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/species/status-badge";

interface SpeciesDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SpeciesDetailPage({
  params,
}: SpeciesDetailPageProps) {
  const { slug } = await params;

  const [s] = await db
    .select()
    .from(species)
    .where(eq(species.slug, slug))
    .limit(1);
  if (!s) notFound();

  const [images, speciesSources] = await Promise.all([
    db.select().from(speciesImages).where(eq(speciesImages.speciesId, s.id)),
    db.select().from(sources).where(eq(sources.speciesId, s.id)),
  ]);

  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        {primaryImage && (
          <div className="relative mb-6 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || s.commonName}
              className="h-64 w-full object-cover"
            />
            {primaryImage.attribution && (
              <span className="absolute bottom-0 right-0 bg-black/50 px-2 py-1 text-xs text-white">
                {primaryImage.attribution}
              </span>
            )}
          </div>
        )}

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {s.commonName}
        </h1>
        <p className="mt-1 text-lg italic text-zinc-500">{s.scientificName}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {s.endemic && (
            <span className="rounded-full bg-bush-green px-2 py-0.5 text-xs font-medium text-white">
              Endemic to Australia
            </span>
          )}
          <StatusBadge status={s.fluStatus} />
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-600">
            {s.fluRisk.replace(/_/g, " ")} flu risk
          </span>{" "}
        </div>

        {s.regions && s.regions.length > 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            <span className="font-medium text-zinc-700">Found in:</span>{" "}
            {s.regions.join(", ")}
          </p>
        )}

        {s.conservationStatus && (
          <p className="mt-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-700">
              Conservation status:
            </span>{" "}
            <span className="capitalize">
              {s.conservationStatus.replace(/_/g, " ")}
            </span>
          </p>
        )}

        {s.bio && <p className="mt-6 text-zinc-700 leading-relaxed">{s.bio}</p>}

        {speciesSources.length > 0 && (
          <section className="mt-10 border-t border-zinc-200 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              References
            </h2>
            <ol className="mt-3 space-y-2 text-sm text-zinc-600">
              {speciesSources.map((source) => (
                <li key={source.id}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                  {source.publisher && <span> — {source.publisher}</span>}
                  {source.publishedAt && (
                    <span className="text-zinc-400">
                      {" "}
                      ({new Date(source.publishedAt).getFullYear()})
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}
