import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

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
