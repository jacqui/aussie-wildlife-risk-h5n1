import Link from "next/link";
import { db } from "@/db";
import { homepageNewsItems, homepageOfficialSources } from "@/db/schema";
import { desc } from "drizzle-orm";
import { deleteNewsItemAction, deleteOfficialSourceAction } from "./actions";

export default async function AdminHomepagePage() {
  const [newsItems, officialSources] = await Promise.all([
    db
      .select()
      .from(homepageNewsItems)
      .orderBy(desc(homepageNewsItems.createdAt)),
    db
      .select()
      .from(homepageOfficialSources)
      .orderBy(desc(homepageOfficialSources.createdAt)),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans min-h-screen">
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Homepage Content
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Recent news and official sources shown on the public homepage.
          </p>
        </div>

        <div className="space-y-4 p-6 border rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xl font-bold">Recent News</h2>
            <Link
              href="/admin/homepage/news/new"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              + Add News Item
            </Link>
          </div>
          {newsItems.length === 0 ? (
            <p className="text-sm text-gray-500">No news items yet.</p>
          ) : (
            <ul className="divide-y">
              {newsItems.map((item) => (
                <li
                  key={item.id}
                  className="py-3 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-600 hover:underline break-words"
                    >
                      {item.title}
                    </a>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.source}
                      {item.displayDate ? ` · ${item.displayDate}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <Link
                      href={`/admin/homepage/news/${item.id}/edit`}
                      className="font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteNewsItemAction(item.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="font-medium text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4 p-6 border rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xl font-bold">Official Sources</h2>
            <Link
              href="/admin/homepage/sources/new"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              + Add Source
            </Link>
          </div>
          {officialSources.length === 0 ? (
            <p className="text-sm text-gray-500">No official sources yet.</p>
          ) : (
            <ul className="divide-y">
              {officialSources.map((src) => (
                <li
                  key={src.id}
                  className="py-3 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-600 hover:underline break-words"
                    >
                      {src.name}
                    </a>
                    {src.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {src.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <Link
                      href={`/admin/homepage/sources/${src.id}/edit`}
                      className="font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteOfficialSourceAction(src.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="font-medium text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
