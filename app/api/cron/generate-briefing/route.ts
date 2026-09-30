// Generates one AI summary ("Kultur-Briefing") per category per day, from that
// day's newly ingested articles; meant to run on a schedule shortly after
// app/api/cron/fetch-news, so the articles it summarizes already exist in the database
// Uses the pattern:  Free.ai as primary and DeepSeek as fallback

import { NextRequest, NextResponse } from "next/server";
import { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FETCH_CATEGORIES } from "@/lib/newsapi";
import { callFreeAiChat, deepseekLlm, invokeWithFallback } from "@/lib/llm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Categories with fewer newly-fetched articles than this aren't worth
// summarizing - not enough material for a meaningful briefing, and it
// avoids spending an LLM call on near-empty input
const MIN_ARTICLES = 2;

// Cap how many articles go into the prompt, to keep token usage (and
// cost) predictable even on an unusually busy news day
const MAX_ARTICLES_IN_PROMPT = 15;

const SYSTEM_PROMPT = `Du bist die Redaktion von VIPE Media, einem Kultur- und Kunstmagazin.
Fasse die folgenden Artikel-Ausschnitte zu einem kurzen, redaktionellen Tagesbriefing zusammen (3-5 Sätze, deutsch, Fließtext ohne Aufzählungszeichen).
Nenne keine Artikel-URLs oder Quellennamen im Text. Erfinde keine Fakten, die nicht in den Ausschnitten stehen.`;

interface CategoryResult {
  category: Category;
  articleCount: number;
  skipped?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  // Vercel Cron automatically sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const results: CategoryResult[] = [];

  // Sequential, not parallel: avoids bursting Free.ai's rate limit and
  // keeps circuit-breaker behavior predictable across categories.
  for (const category of FETCH_CATEGORIES) {
    try {
      // fetchedAt (not publishedAt): "what did our own ingestion pick up
      // today", so the briefing lines up with the fetch-news cron's
      // cadence rather than publishers' own timestamps
      const articles = await prisma.article.findMany({
        where: { category, fetchedAt: { gte: today } },
        select: { title: true, description: true },
        take: MAX_ARTICLES_IN_PROMPT,
        orderBy: { publishedAt: "desc" },
      });

      if (articles.length < MIN_ARTICLES) {
        results.push({
          category,
          articleCount: articles.length,
          skipped: `Only ${articles.length} new article(s), minimum is ${MIN_ARTICLES}`,
        });
        continue;
      }

      const articlesText = articles
        .map(
          (a, i) =>
            `${i + 1}. ${a.title}${a.description ? ` — ${a.description}` : ""}`,
        )
        .join("\n");

      const userMessage = `Artikel von heute:\n${articlesText}`;

      const content = await invokeWithFallback(
        async () => {
          return callFreeAiChat([
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ]);
        },
        async () => {
          const res = await deepseekLlm.invoke([
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ]);
          return typeof res.content === "string"
            ? res.content
            : JSON.stringify(res.content);
        },
      );

      await prisma.briefing.upsert({
        where: { category_date: { category, date: today } },
        create: { category, date: today, content: content.trim() },
        update: { content: content.trim() },
      });

      results.push({ category, articleCount: articles.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `[cron/generate-briefing] Category "${category}" failed:`,
        message,
      );
      results.push({ category, articleCount: 0, error: message });
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
