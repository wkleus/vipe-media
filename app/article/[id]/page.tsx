// Article detail page - dynamic route, [id] matches the article's id
// (e.g. /article/mock-3 renders the article with id "mock-3")

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getMockArticleById } from "@/lib/mock-data";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getMockArticleById(id);

  // Triggers Next.js' built-in not-found.tsx / 404 page if no article matches
  if (!article) {
    notFound();
  }

  const categoryLabel = CATEGORIES.find(
    (c) => c.value === article.category,
  )?.label;
  const date = new Date(article.publishedAt).toLocaleString("de-DE", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-foreground/50 hover:text-foreground/90"
      >
        ← Zurück zum Feed
      </Link>

      <span className="text-xs font-medium uppercase tracking-wide text-accent">
        {categoryLabel}
      </span>

      <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight">
        {article.title}
      </h1>

      <p className="mt-2 text-sm text-foreground/50">
        {article.sourceName} · {article.author} · {date}
      </p>

      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={article.imageUrl}
          alt=""
          fill
          sizes="768px"
          className="object-cover"
        />
      </div>

      <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground/90">
        {/* Fallback text since content is currently empty in mock-data.ts */}
        <p>{article.content || article.description}</p>
      </div>
    </main>
  );
}
