import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// The Resend SDK returns { data, error } instead of throwing
// Shared by both sendVerificationEmail and sendResetPassword below
async function sendMail(to: string, subject: string, html: string) {
  const { error: sendError } = await resend.emails.send({
    from: "VIPE Media <noreply@vipemedia.pixelstack.me>",
    to,
    subject,
    html,
  });
  if (sendError) {
    console.error(`[auth] Failed to send "${subject}" email:`, sendError);
  }
}

export const auth = betterAuth({
  // Object form instead of a single string: the app is reachable under
  // more than one host (Vercel preview deployments each get their own
  // *.vercel.app URL; a custom domain will be added here once one
  // exists). Better Auth validates the incoming request's host against
  // this list and builds redirects/cookies for whichever one matched
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "*.vercel.app",
      // Custom domain hast to be added here once one is set up, e.g. "vipe-media.de"
    ],
  },
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Sign-in is blocked until the address is verified (see
    // emailVerification below); without this, "enabled: true" alone
    // would let anyone register with an email they don't own
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail(
        user.email,
        "Setze dein Passwort zurück",
        `<p>Hallo${user.name ? ` ${user.name}` : ""},</p>
<p>klicke auf den folgenden Link, um ein neues Passwort zu vergeben:</p>
<p><a href="${url}">Neues Passwort vergeben</a></p>
<p>Falls du das nicht angefordert hast, kannst du diese E-Mail ignorieren - dein Passwort bleibt unverändert.</p>`,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // Once verified via the emailed link, log the user straight in
    // instead of sending them back to /login to sign in again
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail(
        user.email,
        "Bestätige deine E-Mail-Adresse",
        `<p>Hallo${user.name ? ` ${user.name}` : ""},</p>
<p>bitte bestätige deine E-Mail-Adresse, um dein VIPE-Media-Konto zu aktivieren:</p>
<p><a href="${url}">E-Mail-Adresse bestätigen</a></p>
<p>Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>`,
      );
    },
  },
  // Login/register/forgot-password are prime brute-force/spam/enumeration
  // targets, and Better Auth doesn't rate-limit by default; "database"
  // storage reuses our existing Postgres via Prisma; global default stays
  // loose; these three get tighter, endpoint-specific limits since those
  // are the actual abuse targets
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
});
