// Rough password strength heuristic: length + character variety
export function getPasswordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export const STRENGTH_LABELS = ["Schwach", "Schwach", "Okay", "Gut", "Stark"];

export const STRENGTH_COLORS = [
  "bg-accent",
  "bg-accent",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-emerald-500",
];
