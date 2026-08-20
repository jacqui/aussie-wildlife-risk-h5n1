import { NewsItemForm } from "@/components/homepage/news-item-form";
import { createNewsItemAction } from "../../actions";

export default function NewNewsItemPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <NewsItemForm
          onSubmit={async (data) => {
            "use server";
            await createNewsItemAction(data);
          }}
        />
      </div>
    </main>
  );
}
