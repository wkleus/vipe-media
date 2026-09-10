"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordField, TextField } from "@/components/auth/fields";
import { fakeLogin } from "@/lib/mock-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Submit gating: fields must be filled, no double-submit while loading/after success
  // NOTE: No min-length check here - login must not enforce register password rules
  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isLoading && !success;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const res = await fakeLogin(email.trim(), password);

    setIsLoading(false);
    if (!res.ok) {
      setError("E-Mail oder Passwort ist falsch.");
    } else {
      setSuccess(true); // NOTE: Demo: real version would redirect to "/" here
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <div className="animate-fade-up w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-2xl font-bold tracking-tight"
        >
          VIPE<span className="text-accent">Media</span>
        </Link>
        <p className="mt-1 text-center text-[11px] uppercase tracking-[0.25em] text-foreground/40">
          Kunst · Kultur · KI
        </p>

        <h1 className="mt-8 text-center font-serif text-2xl font-semibold">
          Willkommen zurück
        </h1>
        <p className="mt-1 text-center text-sm text-foreground/60">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Jetzt registrieren
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            labelExtra={
              <Link
                href="#"
                className="text-xs text-foreground/40 hover:text-accent hover:underline"
              >
                Vergessen?
              </Link>
            }
          />

          {error && <FormMessage type="error">{error}</FormMessage>}
          {success && (
            <FormMessage type="success">
              Anmeldung erfolgreich (Demo)
            </FormMessage>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
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
