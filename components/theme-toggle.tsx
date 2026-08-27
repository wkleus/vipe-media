// Dark mode toggle button

"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

// next-themes only knows actual system/saved theme after hydration in
// browser - rendering icon before that would cause a mismatch between server and client output
function useHasMounted() {
  return useSyncExternalStore(
    () => () => {}, // no external events to subscribe to, mounted state never changes after hydration
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/70 hover:bg-foreground/5"
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
