import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/** Auth session refresh only needed for admin — keep public pages off the critical path. */
export const config = {
  matcher: ["/admin/:path*"],
};
