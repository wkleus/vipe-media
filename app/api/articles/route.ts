// GET /api/articles?category=FILM&cursor=<articleId>&limit=20&q=suchbegriff
//
// Cursor pagination: use last article ID as cursor
// Prevent duplicates or skipped items when new articles are added while scrolling

import { NextRequest, NextResponse } from "next/server";
import { Category, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// "Alle" and search without category: only active culture categories
const CULTURE_CATEGORIES: Category[] = [
  Category.BILDENDE_KUNST,
  Category.MUSIK,
  Category.FILM,
  Category.LITERATUR,
  Category.AUSSTELLUNGEN,
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const categoryParam = searchParams.get("category");
  const cursor = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");
  const query = searchParams.get("q")?.trim();

  // Validate category
  let category: Category | undefined;
  if (categoryParam) {
    if (!Object.values(Category).includes(categoryParam as Category)) {
      return NextResponse.json(
        { error: `Invalid category "${categoryParam}"` },
        { status: 400 },
      );
    }
    // Reject inactive categories explicitly
    if (!CULTURE_CATEGORIES.includes(categoryParam as Category)) {
      return NextResponse.json(
        { error: `Category "${categoryParam}" is not available` },
        { status: 400 },
      );
    }
    category = categoryParam as Category;
  }

  // Validate and cap limit
  let limit = DEFAULT_LIMIT;
  if (limitParam) {
    const parsed = Number(limitParam);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return NextResponse.json(
        { error: "limit must be a positive integer" },
        { status: 400 },
      );
    }
    limit = Math.min(parsed, MAX_LIMIT);
  }

  // Build filters: category + text search on title/description
  const where: Prisma.ArticleWhereInput = {
    category: category ? category : { in: CULTURE_CATEGORIES },
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    // Fetch one extra item to check if there's a next page
    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        sourceName: true,
        category: true,
        publishedAt: true,
        url: true,
      },
    });

    const hasNextPage = articles.length > limit;
    const items = hasNextPage ? articles.slice(0, limit) : articles;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return NextResponse.json({ items, nextCursor, hasNextPage });
  } catch (err) {
    console.error("[api/articles] Error:", err);
    return NextResponse.json(
      { error: "Could not load articles" },
      { status: 500 },
    );
  }
}
