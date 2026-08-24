"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface DeleteSpeciesButtonProps {
  speciesId: number;
  speciesName: string;
  action: (id: number) => Promise<void>;
  // Where to send the user after a successful delete. If omitted, the
  // current page is just refreshed in place (for the list view). Pass an
  // explicit path (e.g. "/admin/species") when deleting from a page that
  // won't exist anymore afterwards, like the species edit page.
  redirectTo?: string;
  className?: string;
}

export function DeleteSpeciesButton({
  speciesId,
  speciesName,
  action,
  redirectTo,
  className,
}: DeleteSpeciesButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    const confirmed = window.confirm(
      `Delete "${speciesName}"? This also deletes its sources and images. This can't be undone.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await action(speciesId);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={
        className ??
        "font-medium text-red-600 hover:text-red-900 disabled:opacity-50"
      }
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
