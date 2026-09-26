"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FormMessage } from "@/components/auth/form-message";
import { TextField } from "@/components/auth/fields";
import { requestPasswordReset } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && !isLoading && !success;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsLoading(true);

    const { error: requestError } = await requestPasswordReset({
      email: email.trim(),
      redirectTo: "/reset-password",
    });

    setIsLoading(false);
    if (requestError) {
      // Not distinguishing "email doesn't exist" from other errors here:
      // doing so would let someone probe which addresses are registered
      // (email enumeration). Same success message either way below.
      setError("Etwas ist schiefgelaufen. Bitte versuch es erneut.");
    } else {
      setSuccess(true);
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
          Passwort vergessen?
        </h1>
        <p className="mt-1 text-center text-sm text-foreground/60">
          Gib deine E-Mail-Adresse ein, wir schicken dir einen Link zum
          Zurücksetzen.
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

          {error && <FormMessage type="error">{error}</FormMessage>}
          {success && (
            <FormMessage type="success">
              Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen
              Link zum Zurücksetzen geschickt.
            </FormMessage>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? "Wird gesendet…" : "Link anfordern"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-foreground/40">
          <Link
            href="/login"
            className="hover:text-foreground/60 hover:underline"
          >
            ← Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}
