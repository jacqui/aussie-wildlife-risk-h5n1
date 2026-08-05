import { StatusBadge } from "@/components/species/status-badge";
import { species } from "@/db/schema";

export function SpeciesCard({
  species: s,
}: {
  species: typeof species.$inferSelect;
}) {
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
