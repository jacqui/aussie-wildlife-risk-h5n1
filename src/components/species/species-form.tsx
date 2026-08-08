"use client";

import { useState } from "react";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { species } from "@/db/schema";
import {
  insertSpeciesSchema,
  type SpeciesFormData,
} from "@/lib/schemas/species";
import { z } from "zod";

interface SpeciesFormProps {
  initialData?: typeof species.$inferSelect | null;
  onSubmit: (data: SpeciesFormData) => Promise<void> | void;
  onCancel?: () => void;
}

// Extracted enum options directly from the schema shape for clean rendering
const TAXON_GROUPS = species.taxonGroup.enumValues;
const CONSERVATION_STATUSES = species.conservationStatus.enumValues;
const FLU_RISKS = species.fluRisk.enumValues;
const FLU_STATUSES = species.fluStatus.enumValues;

export function SpeciesForm({
  initialData,
  onSubmit,
  onCancel,
}: SpeciesFormProps) {
  const isEditMode = Boolean(initialData?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state initialized with initialData or schema defaults
  const [formData, setFormData] = useState<Partial<SpeciesFormData>>({
    commonName: initialData?.commonName ?? "",
    scientificName: initialData?.scientificName ?? "",
    slug: initialData?.slug ?? "",
    taxonGroup: initialData?.taxonGroup ?? "bird",
    endemic: initialData?.endemic ?? false,
    conservationStatus: initialData?.conservationStatus ?? "least_concern",
    fluRisk: initialData?.fluRisk ?? "low",
    fluStatus: initialData?.fluStatus ?? "no_known_risk",
    bio: initialData?.bio ?? "",
    regions: initialData?.regions ?? [],
  });

  // Raw text input for handling PostgreSQL array input
  const [regionsInput, setRegionsInput] = useState<string>(
    initialData?.regions ? initialData.regions.join(", ") : "",
  );

  // Auto-generate slug from common name if creating new entry
  const handleCommonNameChange = (val: string) => {
    const updates: Partial<SpeciesFormData> = { commonName: val };
    if (!isEditMode && !formData.slug) {
      updates.slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Parse comma-separated text into string array for Postgres
      const parsedRegions = regionsInput
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const payloadToValidate = {
        ...formData,
        regions: parsedRegions,
      };

      // Validate data with generated Zod schema
      const validationResult = insertSpeciesSchema.safeParse(payloadToValidate);

      if (!validationResult.success) {
        // Map Zod issues to record for UI feedback
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
      console.error("Form submission error:", error);
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
          {isEditMode
            ? `Edit Species: ${initialData?.commonName}`
            : "Create New Species"}
        </h2>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Common Name *
          </label>
          <input
            type="text"
            required
            value={formData.commonName ?? ""}
            onChange={(e) => handleCommonNameChange(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2 text-sm"
          />
          {errors.commonName && (
            <p className="text-xs text-red-500 mt-1">{errors.commonName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Scientific Name *
          </label>
          <input
            type="text"
            required
            value={formData.scientificName ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                scientificName: e.target.value,
              }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm italic"
          />
          {errors.scientificName && (
            <p className="text-xs text-red-500 mt-1">{errors.scientificName}</p>
          )}
        </div>
      </div>

      {/* Slug & Taxon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <input
            type="text"
            required
            value={formData.slug ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm bg-gray-50"
          />
          {errors.slug && (
            <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Taxon Group *
          </label>
          <select
            value={formData.taxonGroup}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                taxonGroup: e.target.value as any,
              }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm capitalize"
          >
            {TAXON_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          {errors.taxonGroup && (
            <p className="text-xs text-red-500 mt-1">{errors.taxonGroup}</p>
          )}
        </div>
      </div>

      {/* Enums / Statuses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Conservation Status
          </label>
          <select
            value={formData.conservationStatus ?? "least_concern"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                conservationStatus: e.target.value as any,
              }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm capitalize"
          >
            {CONSERVATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Flu Risk *
          </label>
          <select
            value={formData.fluRisk}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                fluRisk: e.target.value as any,
              }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm capitalize"
          >
            {FLU_RISKS.map((risk) => (
              <option key={risk} value={risk}>
                {risk}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Flu Status *
          </label>
          <select
            value={formData.fluStatus}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                fluStatus: e.target.value as any,
              }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm capitalize"
          >
            {FLU_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Regions & Endemic Checkbox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Regions (comma-separated)
          </label>
          <input
            type="text"
            placeholder="NSW, VIC, TAS"
            value={regionsInput}
            onChange={(e) => setRegionsInput(e.target.value)}
            className="mt-1 block w-full rounded-md border p-2 text-sm"
          />
        </div>

        <div className="flex items-center pt-6">
          <input
            id="endemic"
            type="checkbox"
            checked={formData.endemic ?? false}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endemic: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="endemic"
            className="ml-2 block text-sm font-medium text-gray-900"
          >
            Endemic to Australia
          </label>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bio / Description
          </label>
          <textarea
            rows={3}
            value={formData.bio ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border p-2 text-sm"
          />
        </div>
      </div>

      {/* Actions */}
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
              ? "Update Species"
              : "Create Species"}
        </button>
      </div>
    </form>
  );
}
