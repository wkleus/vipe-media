// Fetch articles for active culture categories from NewsAPI and saves them to database

import { NextResponse } from "next/server";
import { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  FETCH_CATEGORIES,
  fetchArticlesByCategory,
  NewsApiError,
  type NormalizedArticle,
} from "@/lib/newsapi";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface CategoryResult {
  category: Category;
  fetched: number;
  saved: number;
  error?: string;
}

export async function GET() {
  const results: CategoryResult[] = [];

  // Sequential, not parallel: NewsAPI's free tier has tight rate limit
  for (const category of FETCH_CATEGORIES) {
    try {
      const articles = await fetchArticlesByCategory(category);
      const saved = await saveArticles(articles);
      results.push({ category, fetched: articles.length, saved });
    } catch (err) {
      const message =
        err instanceof NewsApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unknown error";
      console.error(
        `[cron/fetch-news] Category "${category}" failed:`,
        message,
      );
      results.push({ category, fetched: 0, saved: 0, error: message });
    }
  }

  const totalSaved = results.reduce((sum, r) => sum + r.saved, 0);

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    totalSaved,
    results,
  });
}

async function saveArticles(articles: NormalizedArticle[]): Promise<number> {
  let savedCount = 0;

  for (const article of articles) {
    try {
      await prisma.article.upsert({
        where: { url: article.url },
        update: {
          title: article.title,
          description: article.description,
          content: article.content,
          imageUrl: article.imageUrl,
          fetchedAt: new Date(),
        },
        create: {
          url: article.url,
          title: article.title,
          description: article.description,
          content: article.content,
          imageUrl: article.imageUrl,
          author: article.author,
          sourceName: article.sourceName,
          category: article.category,
          publishedAt: article.publishedAt,
        },
      });
      savedCount++;
    } catch (err) {
      console.error(
        `[cron/fetch-news] Could not save article (${article.url}):`,
        err,
      );
    }
  }

  return savedCount;
}
