// Simple card component showing one article preview
// Minimal version for now - no bookmark button, no theming yet

import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, type Article } from "@/lib/mock-data";

function categoryLabel(value: Article["category"]): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="block overflow-hidden rounded-lg border border-neutral-200 hover:border-neutral-400 transition-colors"
    >
      <div className="relative aspect-[16/10] w-full bg-neutral-100">
        <Image src={article.imageUrl} alt="" fill className="object-cover" />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-red-600">
          {categoryLabel(article.category)}
        </span>
        <h3 className="mt-1 text-lg font-semibold leading-snug">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
          {article.description}
        </p>
      </div>
    </Link>
  );
}
