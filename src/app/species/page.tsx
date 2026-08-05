import { db } from "@/db";
import { species } from "@/db/schema";

export default async function SpeciesPage() {
  const speciesList = await db.select().from(species);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Australian Species at Risk from H5N1 Bird Flu
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Australia is notoriously far from many places in the world. Its
          geographic isolation has led to it being home to many unique species
          of wildlife. Up until recently, this isolation has protected it from
          the decimation caused by H5N1 bird flu. However, as recent news
          reports (links tk) have shown, bird flu has reached Australian shores,
          and many of its animals are at risk. What are these species, and why
          should we care? This site aims to track the species most at risk from
          bird flu in Australia, providing information on their current
          conservation status, h5n1 infection status, and ideally, awesome
          photos of these guys.
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          As of Wednesday, 5 August 2026, there are {speciesList.length} species
          tracked.
        </p>

        <p className="mt-1 text-xs italic text-zinc-600">
          note: all text is very very rough draft and I'd love to have a copy
          desk at hand; this is a work in progress prototype by Jacqui Lough,
          better flow and grammar is, hopefully, tk.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {speciesList.map((s) => (
            <SpeciesCard key={s.id} species={s} />
          ))}
        </div>
      </main>
    </div>
  );
}

function SpeciesCard({ species: s }: { species: typeof species.$inferSelect }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex h-32 items-center justify-center bg-bush-green/10 text-bush-green">
        {s.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.imageUrl}
            alt={s.commonName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[11px] uppercase tracking-wide">
            No image yet
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h2 className="font-medium text-zinc-900">{s.commonName}</h2>
          <p className="text-xs italic text-zinc-500">{s.scientificName}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {s.endemic && (
            <span className="rounded-full bg-bush-green px-2 py-0.5 text-[11px] font-medium text-white">
              Unique
            </span>
          )}
          <StatusBadge status={s.fluStatus} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed_infected: "bg-red-100 text-red-800",
    at_risk: "bg-wattle-gold/25 text-yellow-900",
    historically_affected: "bg-zinc-200 text-zinc-700",
    no_known_risk: "bg-zinc-100 text-zinc-500",
  };
  const labels: Record<string, string> = {
    confirmed_infected: "Confirmed infected",
    at_risk: "At risk",
    historically_affected: "Historically affected",
    no_known_risk: "No known risk",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        styles[status] ?? styles.no_known_risk
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
