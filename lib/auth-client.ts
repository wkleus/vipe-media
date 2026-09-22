import { createAuthClient } from "better-auth/react";

// No baseURL needed: the client runs in the browser on the same origin as the Better Auth API route
// (app/api/auth/[...all]/route.ts), so Better Auth resolves it automatically from window.location
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
