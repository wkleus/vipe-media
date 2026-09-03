// Wraps NewsAPI /v2/everything endpoint. “Everything” is used instead of
// “top-headlines” because NewsAPI doesn't have an Arts/Culture category –> search for keywords instead

import { Category } from "@prisma/client";

// Types
interface NewsApiRawArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: "ok" | "error";
  totalResults?: number;
  articles?: NewsApiRawArticle[];
  code?: string;
  message?: string;
}

// Normalized shape - every source (e.g. NewsAPI) maps onto this before it reaches the database
export interface NormalizedArticle {
  url: string;
  title: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  author: string | null;
  sourceName: string;
  category: Category;
  publishedAt: Date;
}

// Active fetch categories only (no FOTOGRAFIE, STREETART, SONSTIGES)
export const FETCH_CATEGORIES: Category[] = [
  Category.BILDENDE_KUNST,
  Category.MUSIK,
  Category.FILM,
  Category.LITERATUR,
  Category.AUSSTELLUNGEN,
];

// One search query per category – tuned by observed quality
const CATEGORY_QUERIES: Partial<Record<Category, string>> = {
  BILDENDE_KUNST:
    '("bildende Kunst" OR Malerei OR Skulptur OR Kunsthalle OR "Neue Nationalgalerie" OR Kunstmuseum) AND NOT (Fußball OR Sport OR Bundesliga OR Politik OR Wahl OR Börse)',
  MUSIK:
    '(Oper OR Opernhaus OR Philharmonie OR "klassische Musik" OR Sinfonie OR Dirigent OR "Neue Musik" OR Kammermusik OR Musiktheater) AND NOT (Fußball OR Sport OR Bundesliga OR Politik OR Wahl OR "Konzert der" OR Chart OR TikTok)',
  FILM: '(Filmfestival OR Dokumentarfilm OR Filmpreis OR Regisseur OR Kinofilm OR Berlinale OR "Deutscher Film") AND NOT (Fußball OR Sport OR Bundesliga OR Politik OR Wahl)',
  LITERATUR:
    "(Literaturpreis OR Buchmesse OR Debütroman OR Lyrik OR Schriftsteller OR Verlag OR Romanveröffentlichung) AND NOT (Fußball OR Sport OR Bundesliga OR Politik OR Wahl)",
  AUSSTELLUNGEN:
    '(Kunstausstellung OR "Ausstellung im Museum" OR Retrospektive OR Kunstmuseum OR Kunsthalle OR "Galerie zeigt" OR Kurator) AND NOT (Fußball OR Sport OR Bundesliga OR Auto OR Technik OR Naturkunde OR "Deutsches Museum" OR Politik OR Wahl)',
};

// Error
export class NewsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public readonly apiCode?: string,
  ) {
    super(message);
    this.name = "NewsApiError";
  }
}

// Fetch articles for one category via keyword search and normalize them
export async function fetchArticlesByCategory(
  category: Category,
): Promise<NormalizedArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    throw new NewsApiError("NEWSAPI_KEY is not set (check .env)");
  }

  const q = CATEGORY_QUERIES[category];
  if (!q) {
    throw new NewsApiError(
      `No search query configured for category "${category}" (skipped category?)`,
    );
  }

  const params = new URLSearchParams({
    q,
    language: "de",
    sortBy: "publishedAt",
    pageSize: "20",
    apiKey,
  });

  const url = `https://newsapi.org/v2/everything?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (err) {
    throw new NewsApiError(
      `Network error calling NewsAPI (category: ${category}): ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const data = (await response.json()) as NewsApiResponse;

  if (!response.ok || data.status === "error") {
    throw new NewsApiError(
      data.message ?? `NewsAPI responded with status ${response.status}`,
      response.status,
      data.code,
    );
  }

  const rawArticles = data.articles ?? [];
  return rawArticles
    .filter(isUsableArticle)
    .map((a) => normalizeArticle(a, category));
}

function isUsableArticle(a: NewsApiRawArticle): boolean {
  return (
    !!a.url &&
    !!a.title &&
    a.title !== "[Removed]" &&
    a.source.name !== "[Removed]"
  );
}

function normalizeArticle(
  a: NewsApiRawArticle,
  category: Category,
): NormalizedArticle {
  return {
    url: a.url,
    title: a.title,
    description: a.description,
    content: a.content,
    imageUrl: a.urlToImage,
    author: a.author,
    sourceName: a.source.name,
    category,
    publishedAt: new Date(a.publishedAt),
  };
}
