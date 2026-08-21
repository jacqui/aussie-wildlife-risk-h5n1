import { OfficialSourceForm } from "@/components/homepage/official-source-form";
import { createOfficialSourceAction } from "../../actions";

export default function NewOfficialSourcePage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <OfficialSourceForm
          onSubmit={async (data) => {
            "use server";
            await createOfficialSourceAction(data);
          }}
        />
      </div>
    </main>
  );
}
