// NOTE: Next.js 16 renamed middleware.ts to proxy.ts
//
// Just a fast redirect for UX - not the security boundary. Only checks
// for a session cookie, doesn't validate it against the database. Real
// enforcement happens in the protected page itself (see account/page.tsx)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith("/account");

  if (isProtected && !getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Next.js reads this statically, not at runtime
export const config = {
  matcher: ["/account"],
};
