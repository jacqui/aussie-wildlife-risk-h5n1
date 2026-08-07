import Link from "next/link";
import { db } from "@/db";
import { speciesImages, species } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { deleteSpeciesImageAction } from "./actions";

export default async function AdminImagesPage() {
  const allImages = await db
    .select({
      id: speciesImages.id,
      url: speciesImages.url,
      attribution: speciesImages.attribution,
      isPrimary: speciesImages.isPrimary,
      createdAt: speciesImages.createdAt,
      speciesId: speciesImages.speciesId,
      speciesCommonName: species.commonName,
    })
    .from(speciesImages)
    .innerJoin(species, eq(speciesImages.speciesId, species.id))
    .orderBy(desc(speciesImages.createdAt));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans min-h-screen">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Images
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Every species image, in one place.
            </p>
          </div>
          <Link
            href="/admin/images/new"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Add an Image
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {allImages.length === 0 ? (
            <p className="col-span-full py-8 text-center text-zinc-500">
              No images added yet.
            </p>
          ) : (
            allImages.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
              >
                <div className="relative h-32 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {image.isPrimary && (
                    <span className="absolute top-1 left-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white">
                      Primary
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <Link
                    href={`/admin/species/${image.speciesId}/edit`}
                    className="text-sm font-medium text-zinc-900 hover:underline"
                  >
                    {image.speciesCommonName}
                  </Link>
                  {image.attribution && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {image.attribution}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <Link
                      href={`/admin/images/${image.id}/edit`}
                      className="font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteSpeciesImageAction(
                          image.id,
                          image.speciesId,
                        );
                      }}
                    >
                      <button
                        type="submit"
                        className="font-medium text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
