import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Show first, last, current, and one neighbor on each side; collapse the rest into "…"
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sortedPages = Array.from(pages).sort((a, b) => a - b);

  return (
    <nav
      className="flex items-center justify-center gap-1 pt-6"
      aria-label="Pagination"
    >
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded-md text-sm font-medium ${
          currentPage === 1
            ? "pointer-events-none text-zinc-300"
            : "text-zinc-600 hover:bg-zinc-100"
        }`}
      >
        ← Prev
      </Link>

      {sortedPages.map((page, i) => {
        const prevPage = sortedPages[i - 1];
        const showEllipsis = prevPage !== undefined && page - prevPage > 1;
        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-zinc-400">…</span>}
            <Link
              href={buildHref(page)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                page === currentPage
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {page}
            </Link>
          </span>
        );
      })}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-1.5 rounded-md text-sm font-medium ${
          currentPage === totalPages
            ? "pointer-events-none text-zinc-300"
            : "text-zinc-600 hover:bg-zinc-100"
        }`}
      >
        Next →
      </Link>
    </nav>
  );
}
