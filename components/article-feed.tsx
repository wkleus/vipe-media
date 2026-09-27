// Category filter + article grid with explicit "Load more" pagination
// Fetch real data from /api/articles

"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import type { Category } from "@prisma/client";
import { ArticleCard, type ArticleCardData } from "@/components/article-card";
import { CategoryNav } from "@/components/category-nav";

const PAGE_SIZE = 12;
const CULTURE_CATEGORY_COUNT = 5; // Bildende Kunst, Musik, Film, Literatur, Ausstellungen

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
  const isLoadingRef = useRef(false); // guards against overlapping loads

  const edition = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  async function loadMore(reset: boolean) {
    if (isLoadingRef.current) return;
    if (!reset && !hasNextPage) return;

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
        const seen = new Set(prev.map((a) => a.id));
        const unique = page.items.filter((a) => !seen.has(a.id));
        return [...prev, ...unique];
      });

      cursorRef.current = page.nextCursor;
      setHasNextPage(page.hasNextPage);
      setError(null);
    } catch (err) {
      console.error("[ArticleFeed] load failed:", err);
      setError("Artikel konnten nicht geladen werden.");
    }

    setIsInitialLoading(false);
    setIsLoadingMore(false);
    isLoadingRef.current = false;
  }

  // Reset feed whenever category changes
  useEffect(() => {
    categoryRef.current = category;
    cursorRef.current = null;
    isLoadingRef.current = false; // allow a fresh load if a previous request is still in flight
    void loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div>
      <header className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 64px)",
            maskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="max-w-xl font-serif text-[2.75rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">
            Kultur,
            <br />
            die bewegt.
          </h1>

          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
            <span className="h-10 w-px bg-border sm:h-auto sm:w-10 sm:border-t sm:border-l-0" />
            <div>
              <p className="font-serif text-sm italic text-foreground/70">
                {edition}
              </p>
              <p className="text-xs text-foreground/45">
                {CULTURE_CATEGORY_COUNT} Rubriken, täglich aktualisiert
              </p>
            </div>
          </div>
        </div>
      </header>

      <CategoryNav active={category} onChange={setCategory} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {error ? (
          <p className="py-12 text-center text-sm text-accent">{error}</p>
        ) : isInitialLoading ? (
          <SkeletonGrid count={PAGE_SIZE} />
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

        {isLoadingMore && <SkeletonGrid count={3} />}

        {!isInitialLoading && hasNextPage && (
          <div className="flex justify-center py-8">
            <button
              type="button"
              onClick={() => void loadMore(false)}
              disabled={isLoadingMore}
              className="rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground/80 transition hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingMore ? "Wird geladen…" : "Weitere Artikel laden"}
            </button>
          </div>
        )}

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
