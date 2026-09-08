import { NextResponse, type NextRequest } from "next/server";
import { LEAD_THANKS_COOKIE, LEAD_THANKS_PATH } from "@/lib/leads/thanks-flag";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Thank-you URL only after a real lead submit (cookie set client-side on success).
  // Blocks direct visits before HTML + Meta PageView for this path.
  if (pathname === LEAD_THANKS_PATH) {
    const flag = request.cookies.get(LEAD_THANKS_COOKIE)?.value;
    if (!flag) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/poptavka-odeslana"],
};
