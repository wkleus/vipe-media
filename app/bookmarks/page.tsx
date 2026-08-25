// Bookmarks overview page -> shows all articles user has bookmarked
// Bookmark state only exists in localStorage for now (no backend/auth yet)

"use client";

import Link from "next/link";
import { MOCK_ARTICLES } from "@/lib/mock-data";
import { ArticleCard } from "@/components/article-card";
import { useBookmarkedIds } from "@/components/bookmark-button";

export default function BookmarksPage() {
  const bookmarkedIds = useBookmarkedIds();
  const bookmarkedArticles = MOCK_ARTICLES.filter((a) =>
    bookmarkedIds.includes(a.id),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold">
        Deine Lesezeichen
      </h1>

      {bookmarkedArticles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <p className="font-serif text-lg">Noch keine Lesezeichen</p>
          <p className="mb-4 text-sm text-foreground/50">
            Tippe auf den Stern bei einem Artikel, um ihn hier zu speichern.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-accent hover:underline"
          >
            Zum Feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
