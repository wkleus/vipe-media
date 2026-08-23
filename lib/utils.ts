// Helper function -> merges Tailwind class names and resolves conflicts
// Example: cn("px-2", condition && "px-4") -> only "px-4" survives if
// condition is true, instead of both classes being applied (which would
// silently break with plain string concatenation).

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
