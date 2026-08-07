"use client";

import { useState } from "react";
import { speciesImages } from "@/db/schema";
import {
  insertSpeciesImageSchema,
  type SpeciesImageFormData,
} from "@/lib/schemas/species-image";

interface SpeciesImageFormProps {
  speciesId?: number; // fixed — hides the species field when embedded on a species page
  speciesOptions?: { id: number; commonName: string }[];
  defaultSpeciesId?: number;
  initialData?: typeof speciesImages.$inferSelect | null;
  onSubmit: (data: SpeciesImageFormData) => Promise<void> | void;
  onCancel?: () => void;
}

export function SpeciesImageForm({
  speciesId,
  speciesOptions,
  defaultSpeciesId,
  initialData,
  onSubmit,
  onCancel,
}: SpeciesImageFormProps) {
  const isEditMode = Boolean(initialData?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    speciesId: initialData?.speciesId ?? speciesId ?? defaultSpeciesId,
    url: initialData?.url ?? "",
    attribution: initialData?.attribution ?? "",
    altText: initialData?.altText ?? "",
    isPrimary: initialData?.isPrimary ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const payloadToValidate = {
        ...formData,
        attribution: formData.attribution || undefined,
        altText: formData.altText || undefined,
      };

      const validationResult =
        insertSpeciesImageSchema.safeParse(payloadToValidate);

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
      console.error("Species image form submission error:", error);
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
          {isEditMode ? "Edit Image" : "Add an Image"}
        </h2>
      </div>

      {!speciesId && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Species *
          </label>
          <select
            required
            value={formData.speciesId ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                speciesId: Number(e.target.value),
              }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm"
          >
            <option value="" disabled>
              Select a species…
            </option>
            {speciesOptions?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.commonName}
              </option>
            ))}
          </select>
          {errors.speciesId && (
            <p className="text-xs text-red-500 mt-1">{errors.speciesId}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Image URL *
        </label>
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

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Attribution
        </label>
        <input
          type="text"
          value={formData.attribution}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, attribution: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border p-2 text-sm"
          placeholder="e.g. Photo: JJ Harrison, CC BY-SA 3.0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Alt Text
        </label>
        <input
          type="text"
          value={formData.altText}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, altText: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border p-2 text-sm"
          placeholder="Describes the image for screen readers"
        />
      </div>

      <div className="flex items-center">
        <input
          id="isPrimary"
          type="checkbox"
          checked={formData.isPrimary}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isPrimary: e.target.checked }))
          }
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label
          htmlFor="isPrimary"
          className="ml-2 block text-sm font-medium text-gray-900"
        >
          Use as primary image (shown on cards and the species page)
        </label>
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
              ? "Update Image"
              : "Add Image"}
        </button>
      </div>
    </form>
  );
}
