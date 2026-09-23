import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

// GET: all article IDs the current user has bookmarked
// Used to hydrate bookmark-button.tsx's initial state and to populate
// the /bookmarks page (which then re-fetches the full articles via GET /api/articles?ids=...)
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { articleId: true },
    });

    return NextResponse.json({
      articleIds: bookmarks.map((b) => b.articleId),
    });
  } catch (err) {
    console.error("[api/bookmarks GET] Error:", err);
    return NextResponse.json(
      { error: "Could not load bookmarks" },
      { status: 500 },
    );
  }
}

// POST: toggle a bookmark for a single article
// Body: { articleId: string }
// Returns the new state so the client doesn't need a second request to
// know whether the article is now bookmarked or not
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const articleId = body?.articleId;
  if (typeof articleId !== "string" || articleId.length === 0) {
    return NextResponse.json(
      { error: "articleId is required" },
      { status: 400 },
    );
  }

  // Already gated behind a valid session, so this isn't guarding against
  // anonymous abuse - just against a single account hammering the toggle
  // (accidental double-clicks amplified by a buggy client, or deliberate
  // spam); generous limit, since normal usage can toggle several
  // bookmarks in quick succession while browsing
  const allowed = checkRateLimit(`bookmarks:${session.user.id}`, {
    windowMs: 60_000,
    max: 10,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests, please slow down." },
      { status: 429 },
    );
  }

  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: { userId: session.user.id, articleId },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.bookmark.create({
      data: { userId: session.user.id, articleId },
    });
    return NextResponse.json({ bookmarked: true });
  } catch (err) {
    // Foreign key violation (article doesn't exist) surfaces here - treated the
    // same as any other failure, no need to distinguish for the client's purposes
    console.error("[api/bookmarks POST] Error:", err);
    return NextResponse.json(
      { error: "Could not update bookmark" },
      { status: 500 },
    );
  }
}
