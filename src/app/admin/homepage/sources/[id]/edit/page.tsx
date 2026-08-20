import { db } from "@/db";
import { homepageOfficialSources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { OfficialSourceForm } from "@/components/homepage/official-source-form";
import { updateOfficialSourceAction } from "../../../actions";

interface EditOfficialSourcePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOfficialSourcePage({
  params,
}: EditOfficialSourcePageProps) {
  const { id } = await params;
  const [existing] = await db
    .select()
    .from(homepageOfficialSources)
    .where(eq(homepageOfficialSources.id, Number(id)))
    .limit(1);
  if (!existing) notFound();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <OfficialSourceForm
          initialData={existing}
          onSubmit={async (data) => {
            "use server";
            await updateOfficialSourceAction(existing.id, data);
          }}
        />
      </div>
    </main>
  );
}
