"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2 } from "lucide-react";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordField } from "@/components/auth/fields";
import { resetPassword } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = !!token && password.length >= 8 && !isLoading && !success;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !token) return;

    setError(null);
    setIsLoading(true);

    const { error: resetError } = await resetPassword({
      token,
      newPassword: password,
    });

    setIsLoading(false);
    if (resetError) {
      setError(
        "Dieser Link ist ungültig oder abgelaufen. Fordere einen neuen an.",
      );
    } else {
      setSuccess(true);
      // Sessions are invalidated on password reset, so the user has to
      // sign in again with the new password - no auto-login here.
      setTimeout(() => router.push("/login"), 2000);
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
          Neues Passwort
        </h1>

        {!token ? (
          <FormMessage type="error">
            Dieser Link ist unvollständig. Fordere einen neuen Reset-Link an.
          </FormMessage>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              showStrengthMeter
            />

            {error && <FormMessage type="error">{error}</FormMessage>}
            {success && (
              <FormMessage type="success">
                Passwort geändert! Du wirst zum Login weitergeleitet…
              </FormMessage>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Wird gespeichert…" : "Passwort speichern"}
            </button>
          </form>
        )}

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

export default function ResetPasswordPage() {
  // useSearchParams() requires a Suspense boundary in the App Router
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
