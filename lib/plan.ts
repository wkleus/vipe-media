// Single source of truth for "does this user have Premium?"
// Every gate in the app goes through isPremium()

export const PLANS = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

// Accepts null/undefined and a missing plan on purpose: existing users
// created before the plan field existed count as FREE
export function isPremium(
  user: { plan?: string | null } | null | undefined,
): boolean {
  return user?.plan === PLANS.PREMIUM;
}
