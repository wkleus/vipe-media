"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, ChevronDown, CreditCard, LogOut } from "lucide-react";

// NOTE: DEMO: flip this to preview the logged-in state
// Later: const { data: session } = useSession();
//        const isLoggedIn = !!session?.user;
const isLoggedIn = false; // NOTE: demo only

// Logged-out: compact login link + register CTA
function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        Anmelden
      </Link>
      <Link
        href="/register"
        className="hidden rounded-full bg-accent px-2.5 py-1 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:block"
      >
        Registrieren
      </Link>
    </div>
  );
}

// Logged-in: avatar + dropdown menu
function UserDropdown({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  // Extract first letter for the avatar fallback
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  const menuItems = [
    { icon: Bookmark, label: "Lesezeichen", href: "/bookmarks" },
    { icon: CreditCard, label: "Abo verwalten", href: "/account" }, // later: billing portal
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border py-1 pl-1 pr-2.5 transition-colors hover:bg-foreground/5"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {/* Avatar circle with user initial */}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
          {initial}
        </span>
        <ChevronDown
          size={14}
          className={`text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Invisible backdrop to close the menu on outside click */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg"
          >
            <div className="border-b border-border px-3.5 py-2.5">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-foreground/50">Kostenloses Konto</p>
              {/* NOTE:Later: "PREMIUM" badge when subscriptionStatus === "PREMIUM" */}
            </div>

            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                // NOTE: Later: signOut() from next-auth/react
                console.log("[demo] logout");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <LogOut size={15} />
              Abmelden
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Public API: swap into header
export function UserMenu() {
  // Later: const name = session?.user?.name ?? session?.user?.email ?? "";
  const name = "Max Mustermann"; // demo only

  return isLoggedIn ? <UserDropdown name={name} /> : <AuthButtons />;
}
