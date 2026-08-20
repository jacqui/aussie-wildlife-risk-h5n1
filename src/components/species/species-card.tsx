import { StatusBadge } from "@/components/species/status-badge";
import { species, speciesImages } from "@/db/schema";

export function SpeciesCard({
  species: s,
  image,
}: {
  species: typeof species.$inferSelect;
  image?: typeof speciesImages.$inferSelect;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="relative flex h-32 items-center justify-center bg-bush-green/10 text-bush-green">
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.altText || s.commonName}
              className="h-full w-full object-cover"
            />
            {image.attribution && (
              <span className="absolute bottom-0 right-0 bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
                {image.attribution}
              </span>
            )}
          </>
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
          {s.fluStatus && s.fluStatus !== "at_risk" && (
            <StatusBadge status={s.fluStatus} />
          )}
        </div>
      </div>
    </div>
  );
}
