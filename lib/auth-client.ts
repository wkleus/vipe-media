import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

// No baseURL needed: the client runs in the browser on the same origin as the Better Auth API route
// (app/api/auth/[...all]/route.ts), so Better Auth resolves it automatically from window.location
export const authClient = createAuthClient({
  // Makes the extra user fields from lib/auth.ts (plan) known to the client's
  // types; `import type` keeps the server config out of the browser bundle
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
} = authClient;
