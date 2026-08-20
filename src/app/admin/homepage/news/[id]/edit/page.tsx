import { db } from "@/db";
import { homepageNewsItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NewsItemForm } from "@/components/homepage/news-item-form";
import { updateNewsItemAction } from "../../../actions";

interface EditNewsItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsItemPage({
  params,
}: EditNewsItemPageProps) {
  const { id } = await params;
  const [existing] = await db
    .select()
    .from(homepageNewsItems)
    .where(eq(homepageNewsItems.id, Number(id)))
    .limit(1);
  if (!existing) notFound();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <NewsItemForm
          initialData={existing}
          onSubmit={async (data) => {
            "use server";
            await updateNewsItemAction(existing.id, data);
          }}
        />
      </div>
    </main>
  );
}
