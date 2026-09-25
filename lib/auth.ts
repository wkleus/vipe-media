import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    // emailVerification below) -> without this, "enabled: true" alone
    // would let anyone register with an email they don't own
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    // Once verified via the emailed link, log the user straight in
    // instead of sending them back to /login to sign in again
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { error: sendError } = await resend.emails.send({
        from: "VIPE Media <noreply@vipemedia.pixelstack.me>",
        to: user.email,
        subject: "Bestätige deine E-Mail-Adresse",
        html: `<p>Hallo${user.name ? ` ${user.name}` : ""},</p>
<p>bitte bestätige deine E-Mail-Adresse, um dein VIPE-Media-Konto zu aktivieren:</p>
<p><a href="${url}">E-Mail-Adresse bestätigen</a></p>
<p>Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>`,
      });
      // The Resend SDK returns { data, error } instead of throwing, so a
      // failure here would otherwise pass silently - sign-up would still
      // succeed with a 200, but no email (and no dashboard log entry)
      if (sendError) {
        console.error("[auth] Failed to send verification email:", sendError);
      }
    },
  },
  // Login/register are prime brute-force/spam targets, and Better Auth doesn't rate-limit by default;
  // "database" storage reuses our existing Postgres via Prisma; global default stays loose;
  // sign-in/sign-up get tighter, endpoint-specific limits since those are the actual abuse targets
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
});
