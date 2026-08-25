// Card component showing one article preview

import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, type Article } from "@/lib/mock-data";
import { BookmarkButton } from "@/components/bookmark-button";

function categoryLabel(value: Article["category"]): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="block overflow-hidden rounded-lg border border-border hover:border-foreground/30 transition-colors"
    >
      <div className="relative aspect-[16/10] w-full bg-neutral-100">
        <Image
          src={article.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <BookmarkButton articleId={article.id} />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-accent">
          {categoryLabel(article.category)}
        </span>
        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-foreground/60 line-clamp-2">
          {article.description}
        </p>
      </div>
    </Link>
  );
}
