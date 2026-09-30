/**
 * Tracks whether Free.ai's daily free-token budget is exhausted, so
 * repeated requests don't keep hitting Free.ai and failing once the
 * budget is used up - instead, calls go straight to the DeepSeek
 * fallback until the cooldown has passed
 */

// Wait time before trying Free.ai again after a 402 ("out of tokens");
// NOTE: Free.ai's daily quota resets roughly every 24h (but the exact timing
// isn't guaranteed - hence this is configurable!)
const COOLDOWN_MS = Number(
  process.env.FREE_AI_COOLDOWN_MS ?? 24 * 60 * 60 * 1000,
);

let exhaustedAt: number | null = null;

// True if Free.ai should be tried; false while in the cooldown window
export function isFreeAiAvailable(): boolean {
  if (exhaustedAt === null) return true;
  return Date.now() - exhaustedAt >= COOLDOWN_MS;
}

// Call this when Free.ai responds with 402 (budget exhausted)
export function markFreeAiExhausted(): void {
  exhaustedAt = Date.now();
  console.warn(
    `[ai-provider] Free.ai budget exhausted — routing to DeepSeek for the next ${Math.round(
      COOLDOWN_MS / 3_600_000,
    )}h.`,
  );
}

// Manual reset, e.g. for tests or an admin endpoint
export function resetFreeAiCircuit(): void {
  exhaustedAt = null;
}
