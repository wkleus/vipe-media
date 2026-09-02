// Card component showing one article preview

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@prisma/client";
import { BookmarkButton } from "@/components/bookmark-button";

// Shape returned by /api/articles - only the fields the card actually needs
export interface ArticleCardData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceName: string;
  category: Category;
  publishedAt: string; // ISO string, as returned by the API (JSON has no Date type)
}

const CATEGORY_LABELS: Record<Category, string> = {
  BILDENDE_KUNST: "Bildende Kunst",
  MUSIK: "Musik",
  FILM: "Film",
  LITERATUR: "Literatur",
  FOTOGRAFIE: "Fotografie",
  AUSSTELLUNGEN: "Ausstellungen",
  STREETART: "Streetart",
  SONSTIGES: "Sonstiges",
};

export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="block overflow-hidden rounded-lg border border-border hover:border-foreground/30 transition-colors"
    >
      <div className="relative aspect-16/10 w-full bg-foreground/5">
        <Image
          src={article.imageUrl || "/placeholder.jpg"}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <BookmarkButton articleId={article.id} />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-accent">
          {CATEGORY_LABELS[article.category]}
        </span>
        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug">
          {article.title}
        </h3>
        {article.description && (
          <p className="mt-2 text-sm text-foreground/60 line-clamp-2">
            {article.description}
          </p>
        )}
      </div>
    </Link>
  );
}
