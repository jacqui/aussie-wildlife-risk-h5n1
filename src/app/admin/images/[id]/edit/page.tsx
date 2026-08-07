import { db } from "@/db";
import { speciesImages, species } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SpeciesImageForm } from "@/components/species/species-image-form";
import { updateSpeciesImageAction } from "../../actions";

interface EditImagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditImagePage({ params }: EditImagePageProps) {
  const { id } = await params;

  const [existingImage, speciesOptions] = await Promise.all([
    db
      .select()
      .from(speciesImages)
      .where(eq(speciesImages.id, Number(id)))
      .limit(1)
      .then((r) => r[0]),
    db
      .select({ id: species.id, commonName: species.commonName })
      .from(species)
      .orderBy(asc(species.commonName)),
  ]);

  if (!existingImage) notFound();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <SpeciesImageForm
          speciesOptions={speciesOptions}
          initialData={existingImage}
          onSubmit={async (data) => {
            "use server";
            await updateSpeciesImageAction(existingImage.id, data);
          }}
        />
      </div>
    </main>
  );
}
