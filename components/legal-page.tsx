import type { ReactNode } from "react";

// Section with heading + arbitrary content (paragraphs, lists, ...)
function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/70">
        {children}
      </div>
    </section>
  );
}

// Shared shell for all legal pages
// flex-1 keeps footer pinned to bottom
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex-1">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-serif text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-xs uppercase tracking-wider text-foreground/40">
          Stand: {updated}
        </p>

        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          Dieses Webprojekt ist ein nicht‑kommerzielles Template und wird nicht
          geschäftsmäßig betrieben. Es stellt kein dauerhaft betriebenes oder
          öffentlich relevantes Angebot dar und fällt daher nicht unter die
          Impressumspflicht. Die Angaben sind Platzhalter.
        </div>

        {children}
      </div>
    </div>
  );
}

export { LegalSection };
