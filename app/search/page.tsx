// Search page - fetches from /api/articles?q=... with debounced input

"use client";

import { useEffect, useState } from "react";
import { ArticleCard, type ArticleCardData } from "@/components/article-card";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    // Debounce: wait 300ms after the user stops typing before firing the
    // request, so we don't send a request on every single keystroke.
    const timeoutId = setTimeout(() => {
      if (!trimmed) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      fetch(`/api/articles?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.items ?? []);
        })
        .catch((err) => {
          console.error("[SearchPage] search failed:", err);
          setResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mx-auto mb-8 max-w-xl">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nach Artikeln suchen…"
          className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      {!query.trim() ? (
        <p className="text-center text-sm text-foreground/50">
          Suchbegriff eingeben, um Artikel zu finden.
        </p>
      ) : isLoading ? (
        <p className="text-center text-sm text-foreground/50">Suche läuft…</p>
      ) : results.length === 0 ? (
        <p className="text-center text-sm text-foreground/50">
          Keine Treffer für &bdquo;{query}&ldquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
