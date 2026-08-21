"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin/species", label: "Species" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/homepage", label: "Homepage" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <span className="text-sm font-semibold text-zinc-900">Admin</span>
        <div className="flex items-center gap-4">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-indigo-600"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
