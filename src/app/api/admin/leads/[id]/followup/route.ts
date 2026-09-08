import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  markLeadReplied,
  recordLeadContact,
  setLeadFollowupPaused,
  snoozeLeadFollowup,
  updateLeadFollowupSchedule,
} from "@/lib/leads/followup-actions";
import { CONTACT_TYPES } from "@/lib/leads/followup";
import type { Lead } from "@/lib/leads/types";

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("contact"),
    contactType: z.enum(CONTACT_TYPES),
    contactedAt: z.string().datetime(),
    note: z.string().max(2000).nullable().optional(),
    isFollowup: z.boolean().default(false),
  }),
  z.object({
    action: z.literal("reply"),
  }),
  z.object({
    action: z.literal("snooze"),
    preset: z.enum(["tomorrow", "plus3", "plus7"]).optional(),
    customAt: z.string().datetime().optional(),
  }),
  z.object({
    action: z.literal("schedule"),
    nextFollowupAt: z.string().datetime().nullable(),
  }),
  z.object({
    action: z.literal("pause"),
    paused: z.boolean(),
  }),
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = lead as Lead;

  try {
    const payload = parsed.data;
    if (payload.action === "contact") {
      const result = await recordLeadContact(supabase, {
        lead: row,
        userId: user.id,
        contactType: payload.contactType,
        contactedAt: payload.contactedAt,
        note: payload.note,
        isFollowup: payload.isFollowup,
      });
      return NextResponse.json({ ok: true, patch: result.leadPatch });
    }
    if (payload.action === "reply") {
      const patch = await markLeadReplied(supabase, {
        lead: row,
        userId: user.id,
      });
      return NextResponse.json({ ok: true, patch });
    }
    if (payload.action === "snooze") {
      if (!payload.preset && !payload.customAt) {
        return NextResponse.json(
          { error: "Chybí preset nebo customAt" },
          { status: 400 },
        );
      }
      const patch = await snoozeLeadFollowup(supabase, {
        lead: row,
        userId: user.id,
        preset: payload.preset,
        customAt: payload.customAt,
      });
      return NextResponse.json({ ok: true, patch });
    }
    if (payload.action === "schedule") {
      const patch = await updateLeadFollowupSchedule(supabase, {
        lead: row,
        userId: user.id,
        nextFollowupAt: payload.nextFollowupAt,
      });
      return NextResponse.json({ ok: true, patch });
    }
    const patch = await setLeadFollowupPaused(supabase, {
      lead: row,
      userId: user.id,
      paused: payload.paused,
    });
    return NextResponse.json({ ok: true, patch });
  } catch (err) {
    console.error("[followup]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Follow-up akce selhala" },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activities: data ?? [] });
}
