// Placeholder data for frontend scaffold (no DB connection yet)
// The type intentionally mirrors the later Prisma field set 1:1

export type Category =
  | "BILDENDE_KUNST" // Fine Arts – painting, sculpture, drawing, printmaking
  | "MUSIK" // Music – compositions, performances, recordings
  | "FILM" // Film – cinema, documentaries, video art
  | "LITERATUR" // Literature – poetry, prose, essays, plays
  | "FOTOGRAFIE" // Photography – analog, digital, conceptual
  | "AUSSTELLUNGEN" // Exhibitions – curated shows, galleries, museums
  | "STREETART" // Street art – murals, graffiti, public installations
  | "SONSTIGES"; // Other – anything not covered above

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string; // long-form text for detail view (placeholder body copy)
  imageUrl: string;
  author: string;
  sourceName: string;
  category: Category;
  publishedAt: string; // ISO string, same format the real API will return
  url: string;
  isBreaking?: boolean;
}

// "SONSTIGES" not listed here -> it's a technical fallback value for articles
// that don't cleanly fit a real category (e.g. when NewsAPI category mapping unclear)
export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "BILDENDE_KUNST", label: "Bildende Kunst" },
  { value: "MUSIK", label: "Musik" },
  { value: "FILM", label: "Film" },
  { value: "LITERATUR", label: "Literatur" },
  { value: "FOTOGRAFIE", label: "Fotografie" },
  { value: "AUSSTELLUNGEN", label: "Ausstellungen" },
  { value: "STREETART", label: "Streetart" },
];

function makeArticle(
  id: number,
  title: string,
  category: Category,
  sourceName: string,
  minutesAgo: number,
  isBreaking = false,
): Article {
  return {
    id: `mock-${id}`,
    title,
    description:
      "Short summary of the article for the feed view - two to three sentences that convey the core of the message without anticipating the entire text.",
    content: "",
    imageUrl: `https://picsum.photos/seed/${id}/800/500`,
    author: "Redaktion",
    sourceName,
    category,
    publishedAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    url: "#",
    isBreaking,
  };
}

// Mock articles spread across all categories for testing purposes (placeholder data)
export const MOCK_ARTICLES: Article[] = [
  makeArticle(
    1,
    "Neue Retrospektive zeigt Frühwerk eines Berliner Malers",
    "BILDENDE_KUNST",
    "Monopol",
    12,
    true,
  ),
  makeArticle(
    2,
    "Jazzfestival kündigt internationales Line-up an",
    "MUSIK",
    "Jazzthing",
    34,
  ),
  makeArticle(
    3,
    "Deutscher Film gewinnt Hauptpreis bei A-Festival",
    "FILM",
    "epd Film",
    58,
  ),
  makeArticle(
    4,
    "Debütroman einer jungen Autorin sorgt für Furore",
    "LITERATUR",
    "Der Spiegel",
    75,
  ),
  makeArticle(
    5,
    "Fotoband dokumentiert drei Jahrzehnte Stadtwandel",
    "FOTOGRAFIE",
    "Photonews",
    95,
  ),
  makeArticle(
    6,
    "Große Sonderausstellung zu impressionistischer Malerei",
    "AUSSTELLUNGEN",
    "Art Magazin",
    120,
  ),
  makeArticle(
    7,
    "Street-Art-Festival verwandelt Industriebrache",
    "STREETART",
    "Juxtapoz",
    140,
  ),
  makeArticle(
    8,
    "Berlinale kündigt Wettbewerbsfilme für 2027 an",
    "FILM",
    "Der Spiegel",
    160,
    true,
  ),
  makeArticle(
    9,
    "Opernhaus präsentiert ungewöhnliche Neuinszenierung",
    "MUSIK",
    "Deutschlandfunk",
    180,
  ),
  makeArticle(
    10,
    "Skulpturenpark eröffnet neuen Außenbereich",
    "BILDENDE_KUNST",
    "Kunstforum",
    200,
  ),
  makeArticle(
    11,
    "Literaturpreis geht an unabhängigen Kleinverlag",
    "LITERATUR",
    "Börsenblatt",
    220,
  ),
  makeArticle(
    12,
    "Museum eröffnet Ausstellung zu digitaler Kunst",
    "AUSSTELLUNGEN",
    "Monopol",
    240,
  ),
  makeArticle(
    13,
    "Streetart-Künstler gestaltet Fassade eines Kulturzentrums",
    "STREETART",
    "Widewalls",
    260,
  ),
  makeArticle(
    14,
    "Fotografie-Preis würdigt dokumentarisches Langzeitprojekt",
    "FOTOGRAFIE",
    "1854",
    280,
  ),
  makeArticle(
    15,
    "Neue Konzerthalle eröffnet mit gefeierter Akustik",
    "MUSIK",
    "VAN Magazin",
    300,
  ),
  makeArticle(
    16,
    "Auktionshaus erzielt Rekordpreis für Nachkriegskunst",
    "BILDENDE_KUNST",
    "Artnet News",
    320,
  ),
  makeArticle(
    17,
    "Theaterfestival zeigt experimentelle Inszenierungen",
    "AUSSTELLUNGEN",
    "Nachtkritik",
    340,
  ),
  makeArticle(
    18,
    "Lyrikband erhält überraschend große Resonanz",
    "LITERATUR",
    "Zeit Online",
    360,
  ),
  makeArticle(
    19,
    "Dokumentarfilm über Streetart-Szene feiert Premiere",
    "FILM",
    "Indiewire",
    380,
  ),
  makeArticle(
    20,
    "Ausstellung vereint analoge und digitale Fotografie",
    "FOTOGRAFIE",
    "Photonews",
    400,
  ),
];

/**
 * Simulates paginated API response
 */
export function getMockPage(
  category: Category | "ALL",
  cursor: string | null,
  limit: number,
): { items: Article[]; nextCursor: string | null; hasNextPage: boolean } {
  const filtered =
    category === "ALL"
      ? MOCK_ARTICLES
      : MOCK_ARTICLES.filter((a) => a.category === category);

  const startIndex = cursor
    ? filtered.findIndex((a) => a.id === cursor) + 1
    : 0;
  const page = filtered.slice(startIndex, startIndex + limit);
  const hasNextPage = startIndex + limit < filtered.length;

  return {
    items: page,
    nextCursor: hasNextPage ? (page[page.length - 1]?.id ?? null) : null,
    hasNextPage,
  };
}

export function getMockArticleById(id: string): Article | undefined {
  return MOCK_ARTICLES.find((a) => a.id === id);
}

export function searchMockArticles(query: string): Article[] {
  const q = query.toLowerCase();
  return MOCK_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q),
  );
}
