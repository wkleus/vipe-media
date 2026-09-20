// Session check happens here, server-side - this is the real security boundary;
// proxy.ts only redirects early for a snappier UX and must not be trusted alone

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-semibold tracking-tight">
        Kontoeinstellungen
      </h1>
      <p className="mt-2 text-sm text-foreground/60">
        Eingeloggt als {session.user.email}
      </p>
      <p className="mt-6 text-sm text-foreground/70">
        Abo-Verwaltung und weitere Kontoeinstellungen folgen hier bald.
      </p>
    </div>
  );
}
