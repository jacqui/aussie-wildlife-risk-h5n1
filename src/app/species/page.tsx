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
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {speciesList.map((s) => (
            <SpeciesCard key={s.id} species={s} />
          ))}
        </div>
      </main>
    </div>
  );
}
