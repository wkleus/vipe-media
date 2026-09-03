// Category filter + article grid with infinite scroll
// Fetch real data from /api/articles

"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import type { Category } from "@prisma/client";
import { ArticleCard, type ArticleCardData } from "@/components/article-card";
import { CategoryNav } from "@/components/category-nav";

const PAGE_SIZE = 6;

interface ArticlesResponse {
  items: ArticleCardData[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

async function fetchArticlesPage(
  category: Category | "ALL",
  cursor: string | null,
): Promise<ArticlesResponse> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (category !== "ALL") params.set("category", category);
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`/api/articles?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load articles (${res.status})`);
  return res.json();
}

export function ArticleFeed() {
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(null);
  const categoryRef = useRef<Category | "ALL">(category);
  const hasNextPageRef = useRef(true);
  const isLoadingRef = useRef(false); // guards against overlapping loads
  const isSentinelVisibleRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  async function loadMore(reset: boolean) {
    if (isLoadingRef.current) return;
    if (!reset && !hasNextPageRef.current) return;

    isLoadingRef.current = true;
    startTransition(() => {
      if (reset) setIsInitialLoading(true);
      else setIsLoadingMore(true);
    });

    try {
      const page = await fetchArticlesPage(
        categoryRef.current,
        reset ? null : cursorRef.current,
      );

      setArticles((prev) => {
        if (reset) return page.items;

        // Guard against duplicate keys if same page is appended twice
        // (IntersectionObserver / overlapping loadMore races)
        const seen = new Set(prev.map((a) => a.id));
        const unique = page.items.filter((a) => !seen.has(a.id));
        return [...prev, ...unique];
      });

      cursorRef.current = page.nextCursor;
      hasNextPageRef.current = page.hasNextPage;
      setHasNextPage(page.hasNextPage);
      setError(null);
    } catch (err) {
      console.error("[ArticleFeed] load failed:", err);
      setError("Artikel konnten nicht geladen werden.");
    }

    setIsInitialLoading(false);
    setIsLoadingMore(false);
    isLoadingRef.current = false;

    // Observer only fires on visibility change, not continuously
    if (isSentinelVisibleRef.current && hasNextPageRef.current) {
      void loadMore(false);
    }
  }

  // Reset feed whenever category changes
  useEffect(() => {
    categoryRef.current = category;
    cursorRef.current = null;
    hasNextPageRef.current = true;
    void loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // IntersectionObserver -> Its callback always calls loadMore(false), which reads
  // current values from refs -> so observer never needs to be recreated
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        isSentinelVisibleRef.current = entries[0].isIntersecting;
        if (entries[0].isIntersecting) {
          void loadMore(false);
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
        {error ? (
          <p className="py-12 text-center text-sm text-accent">{error}</p>
        ) : isInitialLoading ? (
          <SkeletonGrid count={6} />
        ) : articles.length === 0 ? (
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

        {isLoadingMore && <SkeletonGrid count={3} />}

        {!hasNextPage && !isInitialLoading && articles.length > 0 && (
          <p className="py-8 text-center text-sm text-foreground/40">
            Keine weiteren Artikel in dieser Kategorie.
          </p>
        )}
      </div>
    </div>
  );
}

// Placeholder cards shown while articles are loading
function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 pt-5 first:pt-0 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border"
        >
          <div className="aspect-[16/10] animate-pulse bg-foreground/10" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-full animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
