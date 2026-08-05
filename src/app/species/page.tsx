import { db } from "@/db";
import { species } from "@/db/schema";
import { SpeciesCard } from "@/components/species/species-card";

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
