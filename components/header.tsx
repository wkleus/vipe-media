// Header with VIPE Media logo, shown on every page
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link
          href="/"
          className="font-serif text-2xl font-semibold tracking-tight"
        >
          VIPE <span className="text-accent">Media</span>
        </Link>

        <Link
          href="/search"
          className="ml-auto text-xs font-medium text-foreground/70 hover:text-foreground sm:text-sm"
        >
          Suche
        </Link>

        <Link
          href="/bookmarks"
          className="ml-4 text-xs font-medium text-foreground/70 hover:text-foreground sm:text-sm"
        >
          Lesezeichen
        </Link>
      </div>
    </header>
  );
}
