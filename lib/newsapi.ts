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

// One search query per category - keywords chosen to match art/
const CATEGORY_QUERIES: Record<Category, string> = {
  BILDENDE_KUNST: "Kunst OR Malerei OR Skulptur",
  MUSIK: "Konzert OR Musikfestival OR Oper",
  FILM: "Filmfestival OR Kino OR Dokumentarfilm",
  LITERATUR: "Roman OR Literaturpreis OR Buchmesse",
  FOTOGRAFIE: "Fotografie OR Fotoausstellung",
  AUSSTELLUNGEN: "Ausstellung OR Museum OR Galerie",
  STREETART: "Streetart OR Graffiti OR Urban Art",
  SONSTIGES: "Kultur",
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

  const params = new URLSearchParams({
    q: CATEGORY_QUERIES[category],
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
