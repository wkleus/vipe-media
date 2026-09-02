// Article detail page - dynamic route, [id] matches the article's id
// (e.g. /article/clx9f2k3m0000... renders the article with that cuid from the DB)

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
  });

  // Triggers Next.js' built-in not-found.tsx / 404 page if no article matches
  if (!article) {
    notFound();
  }

  const categoryLabel = CATEGORY_LABELS[article.category];
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
        {article.sourceName}
        {article.author ? ` · ${article.author}` : ""} · {date}
      </p>

      {article.imageUrl && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={article.imageUrl}
            alt=""
            fill
            sizes="768px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground/90">
        {/* Fallback: content if present, otherwise description */}
        <p>{article.content || article.description}</p>
      </div>
    </main>
  );
}
