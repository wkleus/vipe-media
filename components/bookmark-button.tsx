// Bookmark toggle button.
// NOTE: state currently lives only in localStorage - no backend/auth yet
// Once NextAuth + Bookmark DB table exist, this hook gets swapped for
// React Query mutation against /api/bookmarks endpoint

"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "vipe-media:bookmarks";
// Custom event name -> fired manually on every write
const BOOKMARKS_CHANGED_EVENT = "vipe-media:bookmarks-changed";

function readBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    // Corrupted/tampered localStorage should not crash app
    return [];
  }
}

function writeBookmarks(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    // Notify every mounted BookmarkButton to re-read
    window.dispatchEvent(new Event(BOOKMARKS_CHANGED_EVENT));
  } catch {
    // e.g. Safari private mode with full storage - silent fallback,
    // bookmark still works visually, just not persisted
  }
}

// useSyncExternalStore reads external state (localStorage)  synchronously
// during render, and re-renders automatically whenever `subscribe` fires
function subscribe(callback: () => void) {
  window.addEventListener(BOOKMARKS_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback); // syncs across browser tabs too
  return () => {
    window.removeEventListener(BOOKMARKS_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useIsBookmarked(articleId: string) {
  const isBookmarked = useSyncExternalStore(
    subscribe,
    () => readBookmarks().includes(articleId), // client snapshot
    () => false, // server snapshot (SSR has no localStorage, always "not bookmarked")
  );

  const toggle = useCallback(() => {
    const current = readBookmarks();
    const next = current.includes(articleId)
      ? current.filter((id) => id !== articleId)
      : [...current, articleId];
    writeBookmarks(next);
  }, [articleId]);

  return { isBookmarked, toggle };
}

export function BookmarkButton({ articleId }: { articleId: string }) {
  const { isBookmarked, toggle } = useIsBookmarked(articleId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault(); // stops navigation if this button sits inside a <Link> card
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "Lesezeichen entfernen" : "Artikel merken"}
      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-xl shadow-md hover:bg-neutral-50"
    >
      <span className={isBookmarked ? "text-red-600" : "text-neutral-400"}>
        {isBookmarked ? "★" : "☆"}
      </span>
    </button>
  );
}
