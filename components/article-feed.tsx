// Category filter + article grid with infinite scroll

"use client";

import { useEffect, useRef, useState } from "react";
import { getMockPage, type Article, type Category } from "@/lib/mock-data";
import { ArticleCard } from "@/components/article-card";
import { CategoryNav } from "@/components/category-nav";

const PAGE_SIZE = 6;

export function ArticleFeed() {
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [articles, setArticles] = useState<Article[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  const cursorRef = useRef<string | null>(null);
  const categoryRef = useRef<Category | "ALL">(category);
  const hasNextPageRef = useRef(true);
  const isLoadingRef = useRef(false); // guards against overlapping loads

  const sentinelRef = useRef<HTMLDivElement>(null);

  function loadMore(reset: boolean) {
    if (isLoadingRef.current) return;
    if (!reset && !hasNextPageRef.current) return;

    isLoadingRef.current = true;
    const page = getMockPage(
      categoryRef.current,
      reset ? null : cursorRef.current,
      PAGE_SIZE,
    );

    setArticles((prev) => (reset ? page.items : [...prev, ...page.items]));
    cursorRef.current = page.nextCursor;
    hasNextPageRef.current = page.hasNextPage;
    setHasNextPage(page.hasNextPage);
    isLoadingRef.current = false;
  }

  // Reset feed whenever category changes
  useEffect(() => {
    categoryRef.current = category;
    cursorRef.current = null;
    hasNextPageRef.current = true;
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // IntersectionObserver -> Its callback always calls loadMore(false), which reads
  // current values from refs -> so observer never needs to be recreated
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore(false);
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <CategoryNav active={category} onChange={setCategory} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {articles.length === 0 ? (
          <p className="py-12 text-center text-sm text-foreground/50">
            Keine Artikel in dieser Kategorie.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-1" />

        {!hasNextPage && articles.length > 0 && (
          <p className="py-8 text-center text-sm text-foreground/40">
            Keine weiteren Artikel in dieser Kategorie.
          </p>
        )}
      </div>
    </div>
  );
}
