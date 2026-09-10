import { BookmarkCheck, Bot, SlidersHorizontal, Sparkles } from "lucide-react";

const PREMIUM_FEATURES = [
  {
    icon: Sparkles,
    title: "KI-Zusammenfassungen",
    text: "Die Essenz jedes Artikels in Sekunden",
  },
  {
    icon: SlidersHorizontal,
    title: "Persönlicher Feed",
    text: "News, gefiltert nach deinen Interessen",
  },
  {
    icon: Bot,
    title: "AI-Kultur-Agent",
    text: "Dein persönlicher Kurator für Kunst & Kultur",
  },
  {
    icon: BookmarkCheck,
    title: "Lesezeichen-Sync",
    text: "Deine Sammlung auf allen Geräten",
  },
];

// Left-hand editorial panel advertising the premium product (desktop only)
export function EditorialPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-foreground/[0.03] p-12 lg:flex">
      <div className="animate-fade-up">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <Sparkles size={12} />
          VIPE Premium
        </span>
        <h2 className="mt-6 max-w-md font-serif text-4xl font-semibold leading-tight">
          Kultur <span className="italic text-accent">verstehen</span> – nicht
          nur konsumieren.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/60">
          Jetzt kostenlos registrieren und exklusive Einblicke von VIPE Media
          freischalten.
        </p>
      </div>

      <ul className="mt-12 space-y-5">
        {PREMIUM_FEATURES.map((feature, i) => (
          <li
            key={feature.title}
            className="animate-fade-up flex items-start gap-4"
            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-foreground/5 text-accent">
              <feature.icon size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium">{feature.title}</span>
              <span className="block text-sm text-foreground/50">
                {feature.text}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-xs uppercase tracking-[0.2em] text-foreground/30">
        Kunst · Musik · Film · Literatur · Fotografie
      </p>
    </aside>
  );
}
