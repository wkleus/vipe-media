// Wraps NewsAPI /v2/everything endpoint. “Everything” is used instead of
// “top-headlines” because NewsAPI doesn't have an Arts/Culture category –> search for keywords instead
// Extra local relevance filter (positive + negative markers) cuts remaining off-topic hits

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
    '("bildende Kunst" OR Malerei OR Skulptur OR Kunsthalle OR Kunstmuseum OR Gemälde OR "zeitgenössische Kunst") AND NOT (Fußball OR Sport OR Bundesliga OR Politik OR Wahl OR Börse OR Auto OR Technik)',
  MUSIK:
    '(Oper OR Opernhaus OR Philharmonie OR Konzerthaus OR "klassische Musik" OR Sinfonie OR Dirigent OR Kammermusik OR Musiktheater OR Orchester) AND NOT (Fußball OR Sport OR Bundesliga OR Politik OR Chart OR TikTok OR Schlager)',
  FILM: "(Filmfestival OR Dokumentarfilm OR Filmpreis OR Regisseur OR Regisseurin OR Kinofilm OR Berlinale OR Spielfilm OR Filmkritik) AND NOT (Fußball OR Sport OR Bundesliga OR Politik OR Wahl OR Serie OR Netflix)",
  LITERATUR:
    '(Literaturpreis OR Literaturnobelpreis OR Debütroman OR Lyrik OR Buchrezension OR Belletristik OR "Frankfurter Buchmesse" OR "Leipziger Buchmesse") AND NOT (Fußball OR Sport OR Politik OR Wahl OR Börse OR Ratgeber OR Fachbuch)',
  AUSSTELLUNGEN:
    '(Kunstausstellung OR Kunstmuseum OR Kunsthalle OR Sonderausstellung OR "Galerie zeigt" OR Museumsausstellung) AND NOT (Fußball OR Sport OR Auto OR Technik OR Naturkunde OR Messe OR Politik OR Wahl)',
};

// Must match at least one of these in title OR description (per category)
const POSITIVE_MARKERS: Partial<Record<Category, string[]>> = {
  BILDENDE_KUNST: [
    "malerei",
    "skulptur",
    "kunsthalle",
    "kunstmuseum",
    "gemälde",
    "bildende kunst",
    "zeitgenössische kunst",
    "kunstpreis",
    "plastik",
    "zeichnung",
    "kunstwerk",
    "künstler",
    "künstlerin",
  ],
  MUSIK: [
    "oper",
    "opernhaus",
    "philharmonie",
    "konzerthaus",
    "klassische musik",
    "sinfonie",
    "dirigent",
    "kammermusik",
    "musiktheater",
    "orchester",
    "dirigentin",
    "sinfonieorchester",
  ],
  FILM: [
    "filmfestival",
    "dokumentarfilm",
    "filmpreis",
    "regisseur",
    "regisseurin",
    "kinofilm",
    "berlinale",
    "spielfilm",
    "filmkritik",
    "deutscher film",
    "kinostart",
  ],
  LITERATUR: [
    "literaturpreis",
    "literaturnobelpreis",
    "debütroman",
    "debutroman",
    "lyrik",
    "buchrezension",
    "belletristik",
    "buchmesse",
    "schriftsteller",
    "schriftstellerin",
    "roman von",
    "lyrikband",
  ],
  AUSSTELLUNGEN: [
    "kunstausstellung",
    "kunstmuseum",
    "kunsthalle",
    "sonderausstellung",
    "galerie zeigt",
    "museumsausstellung",
    "retrospektive",
    "kurator",
    "kuratorin",
    "ausstellung im",
  ],
};

// Drop article if any of these appear in title OR description
const GLOBAL_NEGATIVE_MARKERS = [
  "fußball",
  "fussball",
  "bundesliga",
  "champions league",
  "sport",
  "spieltag",
  "trainer",
  "nationalmannschaft",
  "wahlkampf",
  "bundestag",
  "kanzler",
  "börse",
  "boerse",
  "aktie",
  "aktien",
  "inflation",
  "zinsen",
  "unfall",
  "polizei",
  "prozess",
  "krieg",
  "rakete",
  "wetter",
  "stau",
  "formula 1",
  "formel 1",
  "handball",
  "basketball",
  "tennis",
];

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
      `No search query configured for category "${category}"`,
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
    .filter((a) => isRelevantForCategory(a, category))
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

// Second-pass filter: NewsAPI keyword search is noisy – require category
// signal and reject clear off-topic (sport, politics, markets, …)
function isRelevantForCategory(
  a: NewsApiRawArticle,
  category: Category,
): boolean {
  const text = `${a.title} ${a.description ?? ""}`.toLowerCase();

  // 1) reject clear off-topic
  if (GLOBAL_NEGATIVE_MARKERS.some((m) => text.includes(m))) {
    return false;
  }

  // 2) require at least one category-positive marker
  const positives = POSITIVE_MARKERS[category] ?? [];
  if (positives.length === 0) return true;

  return positives.some((m) => text.includes(m));
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
