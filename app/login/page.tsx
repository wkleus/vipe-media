"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// ----- NOTE: DEMO: simulates the actual NextAuth call -----
// For testing purposes: If "error" is entered as the password -> error state
function fakeLogin(email: string, password: string): Promise<{ ok: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ok: password.toLowerCase() !== "error" }), 900);
  });
}
// -----

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const res = await fakeLogin(email, password);

    setIsLoading(false);
    if (!res.ok) {
      setError("E-Mail oder Passwort ist falsch.");
    } else {
      setSuccess(true); // NOTE: Demo: this is where `router.push("/")` would go later
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-2xl font-bold tracking-tight"
        >
          VIPE<span className="text-accent">Media</span>
        </Link>

        <h1 className="mt-6 text-center font-serif text-2xl font-semibold">
          Anmelden
        </h1>
        <p className="mt-1 text-center text-sm text-foreground/60">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Jetzt registrieren
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm text-foreground/60"
            >
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="du@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm text-foreground/60"
            >
              Passwort
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
                aria-label={
                  showPassword ? "Passwort verbergen" : "Passwort anzeigen"
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
              ✓ Anmeldung erfolgreich (Demo – hier würde es zur Startseite
              gehen)
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? "Anmeldung…" : "Anmelden"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-foreground/40">
          <Link href="/" className="hover:text-foreground/60 hover:underline">
            ← Zurück zur Startseite
          </Link>
        </p>
      </div>
    </div>
  );
}
