// Search page - live-filters mock articles by title/description

"use client";

import { useState } from "react";
import { searchMockArticles } from "@/lib/mock-data";
import { ArticleCard } from "@/components/article-card";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const results = query.trim() ? searchMockArticles(query.trim()) : [];

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
      ) : results.length === 0 ? (
        <p className="text-center text-sm text-foreground/50">
          Keine Treffer für „{query}".
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
