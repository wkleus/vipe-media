// Bookmark toggle button
// State lives server-side (Bookmark table), scoped to the logged-in
// user, fetched/mutated via /api/bookmarks; logged-out users can still see
// and click the button; they just get an inline hint instead of a change
//  - no redirect, they stay in reading context

"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";

// Module-level cache, shared across all BookmarkButton/useBookmarkedIds
// instances in the tree - avoids each button firing its own GET request;
// null = not loaded yet (or currently loading); string[] = loaded
let cachedIds: string[] | null = null;
let cachedUserId: string | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

async function fetchBookmarkedIds(): Promise<string[]> {
  try {
    const res = await fetch("/api/bookmarks");
    if (!res.ok) return []; // includes 401 (not logged in)
    const data = await res.json();
    return Array.isArray(data.articleIds) ? data.articleIds : [];
  } catch {
    return [];
  }
}

// Ensures cachedIds reflects the given user; re-fetches when the logged-in
// user changes (e.g. after login/logout), since bookmarks are per-account
function ensureLoadedFor(userId: string | null) {
  if (userId === cachedUserId && cachedIds !== null) return;

  cachedUserId = userId;

  if (!userId) {
    cachedIds = [];
    notify();
    return;
  }

  if (inFlight) return; // a fetch for this user is already underway

  inFlight = fetchBookmarkedIds().then((ids) => {
    cachedIds = ids;
    inFlight = null;
    notify();
  });
}

function useBookmarkStore() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    ensureLoadedFor(userId);
    listeners.add(forceRender);
    return () => {
      listeners.delete(forceRender);
    };
  }, [userId]);

  return { ids: cachedIds ?? [], userId };
}

export function useIsBookmarked(articleId: string) {
  const { ids, userId } = useBookmarkStore();
  const isBookmarked = ids.includes(articleId);

  const toggle = useCallback(async () => {
    if (!userId) return false; // caller shows the login hint instead

    // Optimistic update, reverted on failure
    const wasBookmarked = (cachedIds ?? []).includes(articleId);
    cachedIds = wasBookmarked
      ? (cachedIds ?? []).filter((id) => id !== articleId)
      : [...(cachedIds ?? []), articleId];
    notify();

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) throw new Error(`Unexpected status ${res.status}`);
    } catch (err) {
      console.error("[bookmark-button] toggle failed:", err);
      // Revert the optimistic update
      cachedIds = wasBookmarked
        ? [...(cachedIds ?? []), articleId]
        : (cachedIds ?? []).filter((id) => id !== articleId);
      notify();
    }
    return true;
  }, [articleId, userId]);

  return { isBookmarked, toggle, isLoggedIn: !!userId };
}

// Full list of bookmarked article IDs, reactively - used by the
// bookmarks overview page
export function useBookmarkedIds(): string[] {
  return useBookmarkStore().ids;
}

const HINT_DURATION_MS = 2500;

export function BookmarkButton({ articleId }: { articleId: string }) {
  const { isBookmarked, toggle, isLoggedIn } = useIsBookmarked(articleId);
  const [showHint, setShowHint] = useState(false);
  const hintTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimeout.current) clearTimeout(hintTimeout.current);
    };
  }, []);

  return (
    <div className="absolute right-2 top-2">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault(); // stops navigation if this button sits inside a <Link> card
          e.stopPropagation();

          if (!isLoggedIn) {
            setShowHint(true);
            if (hintTimeout.current) clearTimeout(hintTimeout.current);
            hintTimeout.current = setTimeout(
              () => setShowHint(false),
              HINT_DURATION_MS,
            );
            return;
          }

          toggle();
        }}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? "Lesezeichen entfernen" : "Artikel merken"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-xl shadow-md hover:bg-neutral-50"
      >
        <span className={isBookmarked ? "text-red-600" : "text-neutral-400"}>
          {isBookmarked ? "★" : "☆"}
        </span>
      </button>

      {showHint && (
        <div
          role="status"
          className="absolute right-0 top-11 z-10 w-44 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground/70 shadow-lg"
        >
          Bitte einloggen, um Artikel zu merken.
        </div>
      )}
    </div>
  );
}
