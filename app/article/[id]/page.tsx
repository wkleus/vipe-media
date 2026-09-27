// Article detail page - dynamic route, [id] matches article's id
// (e.g. /article/clx9f2k3m0000... renders article with that cuid from DB)

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Category } from "@prisma/client";
import { ExternalLink } from "lucide-react";
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

// NewsAPI often returns truncated content with "… [+1234 chars]" – which should be removed
function cleanSnippet(text: string | null | undefined): string | null {
  if (!text) return null;
  return (
    text
      .replace(/\s*…\s*\[\+\d+\s*chars?\]\s*$/i, "")
      .replace(/\s*\.\.\.\s*\[\+\d+\s*chars?\]\s*$/i, "")
      .trim() || null
  );
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    notFound();
  }

  const categoryLabel = CATEGORY_LABELS[article.category] ?? article.category;
  const date = new Date(article.publishedAt).toLocaleString("de-DE", {
    dateStyle: "long",
    timeStyle: "short",
  });

  // Prefer description, otherwise cleaned content
  const snippet =
    cleanSnippet(article.description) || cleanSnippet(article.content);

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
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={article.imageUrl}
            alt=""
            fill
            sizes="768px"
            className="object-cover"
          />
        </div>
      )}

      {snippet && (
        <div className="mt-6 text-lg leading-relaxed text-foreground/90">
          <p>{snippet}</p>
        </div>
      )}

      {/* Prominent link to original source – NewsAPI never provides full text */}
      <div className="mt-8">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Originalartikel bei {article.sourceName} lesen
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        <p className="mt-2 text-xs text-foreground/40">
          Der vollständige Text ist nur auf der Seite der Quelle verfügbar.
        </p>
      </div>
    </main>
  );
}
