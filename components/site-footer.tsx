import Link from "next/link";

// Static, site-wide footer - server component (no interactivity needed)
const PRODUCT_LINKS = [
  { label: "Premium", href: "/register" }, // NOTE: later -> dedicated /premium landing page
  { label: "Registrieren", href: "/register" },
  { label: "Anmelden", href: "/login" },
];

const LEGAL_LINKS = [
  { label: "Impressum", href: "/imprint" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-foreground/60 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              VIPE<span className="text-accent">Media</span>
            </Link>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-foreground/40">
              Kunst · Kultur · KI
            </p>
          </div>

          <FooterColumn title="Produkt" links={PRODUCT_LINKS} />
          <FooterColumn title="Rechtliches" links={LEGAL_LINKS} />
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-foreground/30">
          © {new Date().getFullYear()} VIPE Media. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
