// Combine category filter + article grid; hold "active category" state

"use client";

import { useState } from "react";
import { MOCK_ARTICLES, type Category } from "@/lib/mock-data";
import { ArticleCard } from "@/components/article-card";
import { CategoryNav } from "@/components/category-nav";

export function ArticleFeed() {
  const [category, setCategory] = useState<Category | "ALL">("ALL");

  const filtered =
    category === "ALL"
      ? MOCK_ARTICLES
      : MOCK_ARTICLES.filter((a) => a.category === category);

  return (
    <div>
      <CategoryNav active={category} onChange={setCategory} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            Keine Artikel in dieser Kategorie.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
