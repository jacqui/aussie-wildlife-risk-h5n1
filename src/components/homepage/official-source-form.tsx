"use client";

import { useState } from "react";
import { homepageOfficialSources } from "@/db/schema";
import {
  insertHomepageOfficialSourceSchema,
  type HomepageOfficialSourceFormData,
} from "@/lib/schemas/homepage-official-source";

interface OfficialSourceFormProps {
  initialData?: typeof homepageOfficialSources.$inferSelect | null;
  onSubmit: (data: HomepageOfficialSourceFormData) => Promise<void> | void;
  onCancel?: () => void;
}

export function OfficialSourceForm({
  initialData,
  onSubmit,
  onCancel,
}: OfficialSourceFormProps) {
  const isEditMode = Boolean(initialData?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    url: initialData?.url ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const payloadToValidate = {
        ...formData,
        description: formData.description || undefined,
      };

      const validationResult =
        insertHomepageOfficialSourceSchema.safeParse(payloadToValidate);
      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.issues.forEach((issue) => {
          if (issue.path[0])
            fieldErrors[issue.path[0].toString()] = issue.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      await onSubmit(validationResult.data);
    } catch (error) {
      console.error("Official source form submission error:", error);
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
          {isEditMode ? "Edit Official Source" : "Add an Official Source"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Shown in "Official data sources" on the homepage.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border p-2 text-sm"
          placeholder="e.g. DCCEEW"
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border p-2 text-sm"
        />
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
          {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add Source"}
        </button>
      </div>
    </form>
  );
}
