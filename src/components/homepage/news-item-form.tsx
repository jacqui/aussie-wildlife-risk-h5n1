"use client";

import { useState } from "react";
import { homepageNewsItems } from "@/db/schema";
import {
  insertHomepageNewsItemSchema,
  type HomepageNewsItemFormData,
} from "@/lib/schemas/homepage-news-item";

interface NewsItemFormProps {
  initialData?: typeof homepageNewsItems.$inferSelect | null;
  onSubmit: (data: HomepageNewsItemFormData) => Promise<void> | void;
  onCancel?: () => void;
}

export function NewsItemForm({
  initialData,
  onSubmit,
  onCancel,
}: NewsItemFormProps) {
  const isEditMode = Boolean(initialData?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    source: initialData?.source ?? "",
    url: initialData?.url ?? "",
    displayDate: initialData?.displayDate ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const payloadToValidate = {
        ...formData,
        displayDate: formData.displayDate || undefined,
      };

      const validationResult =
        insertHomepageNewsItemSchema.safeParse(payloadToValidate);
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
      console.error("News item form submission error:", error);
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
          {isEditMode ? "Edit News Item" : "Add a News Item"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Shown in "Recent coverage" on the homepage.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border p-2 text-sm"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source *
          </label>
          <input
            type="text"
            required
            value={formData.source}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, source: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm"
            placeholder="e.g. ABC News"
          />
          {errors.source && (
            <p className="text-xs text-red-500 mt-1">{errors.source}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Display Date
          </label>
          <input
            type="text"
            value={formData.displayDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, displayDate: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm"
            placeholder="e.g. September 2024"
          />
        </div>
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
          {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add News Item"}
        </button>
      </div>
    </form>
  );
}
