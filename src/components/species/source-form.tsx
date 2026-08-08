"use client";

import { useState } from "react";
import { sources } from "@/db/schema";
import { insertSourceSchema, type SourceFormData } from "@/lib/schemas/sources";

interface SourceFormProps {
  speciesId?: number; // fixed — hides the species field (used when embedded on a species page)
  speciesOptions?: { id: number; commonName: string }[]; // required when speciesId isn't fixed
  defaultSpeciesId?: number; // pre-select in the dropdown, e.g. via ?speciesId= query param
  initialData?: typeof sources.$inferSelect | null;
  onSubmit: (data: SourceFormData) => Promise<void> | void;
  onCancel?: () => void;
}

const SOURCE_TYPES = sources.sourceType.enumValues;

// Free text in the DB, but a dropdown here keeps values consistent
// across entries so you can filter/group by them later.
const SUPPORTS_FIELD_OPTIONS = [
  "common_name",
  "scientific_name",
  "taxon_group",
  "conservation_status",
  "flu_risk",
  "flu_status",
  "regions",
  "bio",
];

function toDateInputValue(date?: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function SourceForm({
  speciesId,
  initialData,
  defaultSpeciesId,
  onSubmit,
  onCancel,
}: SourceFormProps) {
  const isEditMode = Boolean(initialData?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    speciesId: initialData?.speciesId ?? speciesId ?? defaultSpeciesId,
    url: initialData?.url ?? "",
    title: initialData?.title ?? "",
    publisher: initialData?.publisher ?? "",
    sourceType: initialData?.sourceType ?? "news",
    supportsFields: initialData?.supportsFields ?? [],
  });

  const [publishedAtInput, setPublishedAtInput] = useState(
    toDateInputValue(initialData?.publishedAt),
  );
  const [accessedAtInput, setAccessedAtInput] = useState(
    toDateInputValue(initialData?.accessedAt) || toDateInputValue(new Date()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const payloadToValidate = {
        ...formData,
        publisher: formData.publisher || undefined,
        title: formData.title || undefined,
        supportsFields: formData.supportsFields || undefined,
        publishedAt: publishedAtInput ? new Date(publishedAtInput) : undefined,
        accessedAt: accessedAtInput ? new Date(accessedAtInput) : new Date(),
      };

      const validationResult = insertSourceSchema.safeParse(payloadToValidate);

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      await onSubmit(validationResult.data);
    } catch (error) {
      console.error("Source form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6 p-6 border rounded-lg shadow-sm bg-white"
    >
      <div className="border-b pb-3">
        <h2 className="text-xl font-bold">
          {isEditMode ? "Edit Source" : "Add a Source"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Record where a data point came from so it can be verified later.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">URL *</label>
        <input
          type="url"
          required
          value={formData.url}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, url: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border p-2 text-sm"
          placeholder="https://..."
        />
        {errors.url && (
          <p className="text-xs text-red-500 mt-1">{errors.url}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Publisher
          </label>
          <input
            type="text"
            value={formData.publisher}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, publisher: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm"
            placeholder="e.g. DCCEEW, ABC News"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source Type *
          </label>
          <select
            value={formData.sourceType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sourceType: e.target.value as any,
              }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm capitalize"
          >
            {SOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.sourceType && (
            <p className="text-xs text-red-500 mt-1">{errors.sourceType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Supports Fields
          </label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {SUPPORTS_FIELD_OPTIONS.map((field) => (
              <label
                key={field}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={formData.supportsFields.includes(field)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supportsFields: e.target.checked
                        ? [...prev.supportsFields, field]
                        : prev.supportsFields.filter((f) => f !== field),
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                {field}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Published Date
          </label>
          <input
            type="date"
            value={publishedAtInput}
            onChange={(e) => setPublishedAtInput(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Accessed Date *
          </label>
          <input
            type="date"
            required
            value={accessedAtInput}
            onChange={(e) => setAccessedAtInput(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
              ? "Update Source"
              : "Add Source"}
        </button>
      </div>
    </form>
  );
}
