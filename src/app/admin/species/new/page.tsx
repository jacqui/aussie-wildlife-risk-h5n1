import { SpeciesForm } from "@/components/species/species-form";
import { createSpeciesAction } from "@/app/admin/species/actions";

export default function NewSpeciesPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <SpeciesForm
          onSubmit={async (data) => {
            "use server";
            await createSpeciesAction(data);
          }}
        />
      </div>
    </main>
  );
}
