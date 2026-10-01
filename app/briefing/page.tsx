// Shows today's AI-generated Kultur-Briefing per category; Premium-gated:
// non-Premium visitors see a locked teaser instead of the actual content

import Link from "next/link";
import { headers } from "next/headers";
import { Newspaper, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPremium } from "@/lib/plan";
import { CATEGORIES } from "@/lib/mock-data";

export default async function BriefingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user ?? null;
  const premium = isPremium(user);

  const header = (
    <div className="mb-10">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        <Sparkles size={12} />
        Premium
      </span>
      <h1 className="mt-4 font-serif text-3xl font-semibold">
        Kultur-Briefing
      </h1>
      <p className="mt-2 text-sm text-foreground/60">
        Der Tag in Kunst & Kultur, von einer KI aus den Artikeln des Tages
        zusammengefasst.
      </p>
    </div>
  );

  if (!premium) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        {header}
        <div className="rounded-lg border border-border bg-foreground/[0.03] p-8 text-center">
          <Newspaper size={28} className="mx-auto text-foreground/30" />
          <p className="mt-4 text-sm font-medium">
            Das Kultur-Briefing ist ein Premium-Feature.
          </p>
          <Link
            href="/premium"
            className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Mehr über Premium
          </Link>
        </div>
      </main>
    );
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const briefings = await prisma.briefing.findMany({
    where: { date: today },
  });
  const byCategory = new Map(briefings.map((b) => [b.category, b.content]));

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {header}

      <div className="space-y-8">
        {CATEGORIES.map(({ value, label }) => {
          const content = byCategory.get(value);
          return (
            <article key={value} className="border-b border-border pb-8">
              <h2 className="font-serif text-lg font-semibold">{label}</h2>
              {content ? (
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  {content}
                </p>
              ) : (
                <p className="mt-2 text-sm text-foreground/40">
                  Heute noch kein Briefing verfügbar.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
