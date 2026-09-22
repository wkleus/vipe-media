// Bookmarks overview page - shows all articles the user has bookmarked.
// Bookmark IDs come from the Bookmark table via /api/bookmarks (see
// bookmark-button.tsx); the actual article data is then fetched from
// the database via /api/articles?ids=...

"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { ArticleCard, type ArticleCardData } from "@/components/article-card";
import { useBookmarkedIds } from "@/components/bookmark-button";
import { useSession } from "@/lib/auth-client";

export default function BookmarksPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const isLoggedIn = !!session?.user;
  const bookmarkedIds = useBookmarkedIds();
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookmarkedIds.length === 0) {
      startTransition(() => {
        setArticles([]);
        setIsLoading(false);
      });
      return;
    }

    startTransition(() => {
      setIsLoading(true);
    });

    fetch(`/api/articles?ids=${bookmarkedIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => setArticles(data.items ?? []))
      .catch((err) => {
        console.error("[BookmarksPage] failed to load:", err);
        setArticles([]);
      })
      .finally(() => setIsLoading(false));
  }, [bookmarkedIds]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold">
        Deine Lesezeichen
      </h1>

      {isLoading || isSessionPending ? (
        <p className="text-center text-sm text-foreground/50">Wird geladen…</p>
      ) : !isLoggedIn ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <p className="font-serif text-lg">Melde dich an</p>
          <p className="mb-4 text-sm text-foreground/50">
            Lesezeichen sind an dein Konto gebunden - melde dich an, um sie zu
            sehen.
          </p>
          <Link
            href="/login"
            className="text-sm font-medium text-accent hover:underline"
          >
            Zum Login
          </Link>
        </div>
      ) : articles.length === 0 ? (
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
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
