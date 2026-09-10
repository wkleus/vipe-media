"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { EditorialPanel } from "@/components/auth/editorial-panel";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordField, TextField } from "@/components/auth/fields";
import { fakeRegister } from "@/lib/mock-auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Submit gating: valid input required, no double-submit while loading/after success
  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 8 &&
    !isLoading &&
    !successMessage;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const res = await fakeRegister({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    setIsLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Registrierung fehlgeschlagen.");
    } else {
      // Demo: real version would auto-login (signIn) + redirect to "/" or /onboarding
      setSuccessMessage(
        res.name
          ? `Konto erstellt – willkommen, ${res.name}! (Demo)`
          : "Konto erstellt (Demo – hier würde der Auto-Login starten)",
      );
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <EditorialPanel />

      {/* Form */}
      <main className="flex items-center justify-center px-4 py-12">
        <div className="animate-fade-up w-full max-w-sm">
          <Link
            href="/"
            className="block text-center text-2xl font-bold tracking-tight lg:text-left"
          >
            VIPE<span className="text-accent">Media</span>
          </Link>

          <h1 className="mt-10 font-serif text-3xl font-semibold">
            Konto erstellen
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Bereits registriert?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Anmelden
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <TextField
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Max Mustermann"
              value={name}
              onChange={(e) => setName(e.target.value)}
              label={
                <>
                  Name <span className="text-foreground/40">(optional)</span>
                </>
              }
            />

            <TextField
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="du@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="E-Mail"
            />

            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="mind. 8 Zeichen"
              showStrengthMeter
            />

            {error && <FormMessage type="error">{error}</FormMessage>}
            {successMessage && (
              <FormMessage type="success">{successMessage}</FormMessage>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Konto wird erstellt…" : "Registrieren"}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-foreground/40">
            Mit der Registrierung akzeptierst du unsere{" "}
            <Link href="#" className="hover:text-foreground/60 hover:underline">
              AGB
            </Link>{" "}
            und{" "}
            <Link href="#" className="hover:text-foreground/60 hover:underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
