import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { runDueDiscoveryJobs } from "@/lib/discovery/run-discovery";

/**
 * Vercel Cron / external scheduler entrypoint.
 * Secure with CRON_SECRET: Authorization: Bearer <secret>
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const result = await runDueDiscoveryJobs(supabase);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cron discovery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
