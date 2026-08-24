// Header with VIPE Media logo, shown on every page
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          VIPE <span className="text-red-600">Media</span>
        </Link>
      </div>
    </header>
  );
}
