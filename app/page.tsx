// VIPE Media - homepage
// Minimal version: shows all mock articles in a grid, no filtering yet

import { MOCK_ARTICLES } from "@/lib/mock-data";
import { ArticleCard } from "@/components/article-card";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">VIPE Media</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_ARTICLES.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </main>
  );
}
