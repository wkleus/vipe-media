/**
 * Free.ai (primary, free) with DeepSeek (fallback, paid) for the
 * Kultur-Briefing; fallback/circuit-breaker pattern
 */

import { ChatOpenAI } from "@langchain/openai";
import { isFreeAiAvailable, markFreeAiExhausted } from "./ai-provider-circuit";

// DeepSeek — OpenAI-compatible, works with ChatOpenAI + a custom baseURL
// Used as the fallback once Free.ai's free daily budget is exhausted
export const deepseekLlm = new ChatOpenAI({
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL ?? "deepseek-v4-flash",
  temperature: 0.3,
  configuration: {
    baseURL: "https://api.deepseek.com",
  },
});

// Free.ai doesn't support the standard OpenAI path `/chat/completions`
// (returns a generic 404 there), only its own `/v1/chat/` endpoint -
// so it's called directly via fetch instead of through ChatOpenAI
export class FreeAiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "FreeAiError";
    this.status = status;
  }
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Calls Free.ai's chat endpoint and returns the raw assistant message text
export async function callFreeAiChat(messages: ChatMessage[]): Promise<string> {
  const res = await fetch("https://api.free.ai/v1/chat/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FREE_AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.FREE_AI_MODEL ?? "qwen7b",
      messages,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new FreeAiError(
      `Free.ai request failed: ${res.status} ${body}`,
      res.status,
    );
  }

  const data = await res.json();

  // Free.ai sometimes returns errors with an HTTP 200 status and the
  // error embedded in the body instead of a proper 4xx/5xx status -
  // check for that explicitly so invokeWithFallback still sees the
  // real status code (e.g. 400) instead of "unknown"
  if (data?.error) {
    const code = data.error.code;
    throw new FreeAiError(
      `Free.ai error: ${data.error.message ?? "unknown error"}`,
      typeof code === "number" ? code : undefined,
    );
  }

  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim() === "") {
    console.warn(
      "[ai-provider] Free.ai response shape unexpected, raw body:",
      JSON.stringify(data),
    );
    throw new FreeAiError("Free.ai response missing message content");
  }

  return content;
}

function statusOf(err: unknown): number | undefined {
  const e = err as { status?: number; response?: { status?: number } };
  return e?.status ?? e?.response?.status;
}

/**
 * Runs `invokePrimary()` first (Free.ai); on failure:
 *  - 402 (budget exhausted): open the circuit breaker so future calls
 *    skip Free.ai for a while, then fall back to `invokeFallback`
 *  - 429 (rate limited): brief retry, since this is a short-term
 *    throttle, not an exhausted budget
 *  - anything else: log it and fall back for just this one call,
 *    without opening the circuit, so a real bug isn't silently masked
 *
 * If Free.ai is already known to be exhausted (circuit open), skip it
 * and go straight to `invokeFallback` - no wasted failing request
 */
export async function invokeWithFallback<T>(
  invokePrimary: () => Promise<T>,
  invokeFallback: () => Promise<T>,
): Promise<T> {
  if (!isFreeAiAvailable()) {
    return invokeFallback();
  }

  const RATE_LIMIT_RETRIES = 2;
  const RATE_LIMIT_DELAY_MS = 1500;

  for (let attempt = 0; attempt <= RATE_LIMIT_RETRIES; attempt++) {
    try {
      return await invokePrimary();
    } catch (err) {
      const status = statusOf(err);

      if (status === 402) {
        markFreeAiExhausted();
        return invokeFallback();
      }

      if (status === 429 && attempt < RATE_LIMIT_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMIT_DELAY_MS),
        );
        continue; // retry Free.ai
      }

      console.warn(
        `[ai-provider] Free.ai request failed (status ${status ?? "unknown"}), falling back to DeepSeek for this request.`,
        err,
      );
      return invokeFallback();
    }
  }

  return invokeFallback();
}
