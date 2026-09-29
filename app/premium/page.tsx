// Premium landing page
// Public on purpose (visitors should see what
// Premium is), but shows a different call to action depending on the
// session; server component: the plan is read server-side

import Link from "next/link";
import { headers } from "next/headers";
import { Check, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { PREMIUM_FEATURES } from "@/lib/premium-features";

export default async function PremiumPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user ?? null;
  const premium = isPremium(user);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        <Sparkles size={12} />
        VIPE Premium
      </span>

      <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight">
        Kultur <span className="italic text-accent">verstehen</span> – nicht nur
        konsumieren.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-foreground/60">
        KI-Funktionen für alle, die mehr aus dem Feed holen wollen. Dies ist ein
        Demo-Projekt: Es findet keine echte Zahlung statt.
      </p>

      <ul className="mt-10 space-y-5">
        {PREMIUM_FEATURES.map((feature) => (
          <li key={feature.title} className="flex items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-foreground/5 text-accent">
              <feature.icon size={16} />
            </span>
            <span>
              <span className="flex items-center gap-2 text-sm font-medium">
                {feature.title}
                {!feature.available && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground/50">
                    Bald
                  </span>
                )}
              </span>
              <span className="block text-sm text-foreground/50">
                {feature.text}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-lg border border-border bg-foreground/[0.03] p-6">
        {!user && (
          <>
            <p className="text-sm font-medium">
              Melde dich an, um Premium zu testen.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="/register"
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Kostenlos registrieren
              </Link>
              <Link
                href="/login"
                className="text-sm text-foreground/60 hover:text-foreground hover:underline"
              >
                Anmelden
              </Link>
            </div>
          </>
        )}

        {user && premium && (
          <p className="flex items-center gap-2 text-sm font-medium">
            <Check size={16} className="text-accent" />
            Du hast Premium.
          </p>
        )}

        {user && !premium && (
          <>
            <p className="text-sm font-medium">Dein Plan: Kostenlos</p>
            {/* Placeholder - becomes the Stripe checkout in a later step */}
            <button
              type="button"
              disabled
              className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white opacity-60"
            >
              Auf Premium upgraden (folgt in Kürze)
            </button>
          </>
        )}
      </div>
    </main>
  );
}
