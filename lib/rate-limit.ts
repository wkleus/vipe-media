// Lightweight in-memory rate limiter for our own API routes (not
// Better Auth's endpoints - those use its own DB-backed rateLimit
// table, see lib/auth.ts).
//
// Fixed-window counter, scoped by an arbitrary key;
// Not shared across serverless instances or persisted across restarts -
// an accepted trade-off here, since this guards an already-
// authenticated, low-severity endpoint (a logged-in user spamming
// requests), not anonymous brute-force/abuse

type WindowEntry = { count: number; windowStart: number };

const windows = new Map<string, WindowEntry>();

// Without this, `windows` would grow forever (one entry per user who
// ever hit a rate-limited route); runs occasionally, not on every call
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(maxAgeMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of windows) {
    if (now - entry.windowStart > maxAgeMs) {
      windows.delete(key);
    }
  }
}

/**
 * Checks the counter for `key` and increments it; returns whether the
 * request is permitted within the defined time window (fixed window)
 *
 * A route identifier is prefixed to the `key` (e.g., `bookmarks:${userId}`)
 * so that different routes using this mechanism do not
 * share the same counter
 */
export function checkRateLimit(
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): boolean {
  cleanupStaleEntries(windowMs);

  const now = Date.now();
  const entry = windows.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    windows.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
}
