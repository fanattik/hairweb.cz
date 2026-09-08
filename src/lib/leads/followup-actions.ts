import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CONTACT_TYPE_LABELS,
  calculateNextFollowup,
  formatPragueDate,
  isTerminalLeadStatus,
  snoozeNextFollowup,
  type ContactType,
} from "@/lib/leads/followup";
import type { Lead, LeadStatus } from "@/lib/leads/types";

export type LeadActivityType =
  | "contact"
  | "followup"
  | "snooze"
  | "manual_schedule"
  | "cancel"
  | "pause"
  | "resume"
  | "reply"
  | "stop"
  | "note";

async function logActivity(
  supabase: SupabaseClient,
  input: {
    leadId: string;
    userId?: string | null;
    activityType: LeadActivityType;
    summary: string;
    meta?: Record<string, unknown>;
  },
) {
  await supabase.from("lead_activities").insert({
    lead_id: input.leadId,
    created_by: input.userId ?? null,
    activity_type: input.activityType,
    summary: input.summary,
    meta: input.meta ?? {},
  });
}

function nextIsoFromCount(lastContactAt: string, followupCount: number) {
  const next = calculateNextFollowup({
    lastContactAt,
    followupCount,
  });
  return next ? next.toISOString() : null;
}

export async function recordLeadContact(
  supabase: SupabaseClient,
  input: {
    lead: Lead;
    userId?: string | null;
    contactType: ContactType;
    contactedAt: string;
    note?: string | null;
    isFollowup: boolean;
  },
): Promise<{ leadPatch: Record<string, unknown> }> {
  const contactedAt = new Date(input.contactedAt).toISOString();
  let followupCount = input.lead.followup_count ?? 0;
  const patch: Record<string, unknown> = {
    last_contact_at: contactedAt,
    last_contact_type: input.contactType,
    followup_stopped: false,
  };

  if (input.lead.status === "new") {
    patch.status = "contacted" satisfies LeadStatus;
  }

  if (input.isFollowup) {
    followupCount += 1;
    patch.followup_count = followupCount;
    patch.last_followup_at = contactedAt;
  }

  const next = nextIsoFromCount(contactedAt, followupCount);
  patch.next_followup_at = next;

  if (input.note?.trim()) {
    const line = `[${CONTACT_TYPE_LABELS[input.contactType]} ${new Date(contactedAt).toLocaleString("cs-CZ")}] ${input.note.trim()}`;
    patch.notes = input.lead.notes?.trim()
      ? `${input.lead.notes.trim()}\n${line}`
      : line;
  }

  const { error } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", input.lead.id);
  if (error) throw new Error(error.message);

  const typeLabel = CONTACT_TYPE_LABELS[input.contactType];
  const summary = input.isFollowup
    ? `Follow-up #${followupCount} – ${typeLabel}`
    : `Kontakt – ${typeLabel}`;
  const nextLine = next
    ? ` → další follow-up naplánován na ${formatPragueDate(next)}`
    : " → automatický follow-up ukončen";

  await logActivity(supabase, {
    leadId: input.lead.id,
    userId: input.userId,
    activityType: input.isFollowup ? "followup" : "contact",
    summary: `${summary}${nextLine}`,
    meta: {
      contactType: input.contactType,
      isFollowup: input.isFollowup,
      followupCount,
      nextFollowupAt: next,
      note: input.note ?? null,
    },
  });

  return { leadPatch: patch };
}

export async function markLeadReplied(
  supabase: SupabaseClient,
  input: { lead: Lead; userId?: string | null },
) {
  const nextStatus: LeadStatus =
    input.lead.status === "new" || input.lead.status === "contacted"
      ? "interested"
      : input.lead.status;

  const patch = {
    next_followup_at: null,
    followup_stopped: true,
    followup_paused: false,
    status: nextStatus,
  };

  const { error } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", input.lead.id);
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    leadId: input.lead.id,
    userId: input.userId,
    activityType: "reply",
    summary: "Lead odpověděl — automatické follow-upy zastaveny",
    meta: { status: nextStatus },
  });

  return patch;
}

export async function snoozeLeadFollowup(
  supabase: SupabaseClient,
  input: {
    lead: Lead;
    userId?: string | null;
    preset?: "tomorrow" | "plus3" | "plus7";
    customAt?: string;
  },
) {
  const next = input.customAt
    ? snoozeNextFollowup(input.customAt)
    : snoozeNextFollowup(input.preset ?? "tomorrow");

  const patch = {
    next_followup_at: next.toISOString(),
    followup_paused: false,
    followup_stopped: false,
  };

  const { error } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", input.lead.id);
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    leadId: input.lead.id,
    userId: input.userId,
    activityType: "snooze",
    summary: `Follow-up odložen na ${formatPragueDate(next)}`,
    meta: {
      preset: input.preset ?? null,
      customAt: input.customAt ?? null,
      nextFollowupAt: next.toISOString(),
    },
  });

  return patch;
}

export async function updateLeadFollowupSchedule(
  supabase: SupabaseClient,
  input: {
    lead: Lead;
    userId?: string | null;
    nextFollowupAt: string | null;
  },
) {
  const patch = {
    next_followup_at: input.nextFollowupAt,
    followup_stopped: false,
    followup_paused: false,
  };

  const { error } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", input.lead.id);
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    leadId: input.lead.id,
    userId: input.userId,
    activityType: input.nextFollowupAt ? "manual_schedule" : "cancel",
    summary: input.nextFollowupAt
      ? `Follow-up ručně nastaven na ${formatPragueDate(input.nextFollowupAt)}`
      : "Follow-up zrušen",
    meta: { nextFollowupAt: input.nextFollowupAt },
  });

  return patch;
}

export async function setLeadFollowupPaused(
  supabase: SupabaseClient,
  input: { lead: Lead; userId?: string | null; paused: boolean },
) {
  const patch = {
    followup_paused: input.paused,
    followup_stopped: input.paused ? input.lead.followup_stopped : false,
  };

  const { error } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", input.lead.id);
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    leadId: input.lead.id,
    userId: input.userId,
    activityType: input.paused ? "pause" : "resume",
    summary: input.paused
      ? "Follow-up pozastaven"
      : "Follow-up znovu aktivován",
  });

  return patch;
}

/** When lead hits won/lost/skip — stop sequence. */
export async function stopFollowupForTerminalStatus(
  supabase: SupabaseClient,
  input: {
    lead: Lead;
    userId?: string | null;
    status: LeadStatus;
  },
) {
  if (!isTerminalLeadStatus(input.status)) return null;
  if (input.lead.followup_stopped && !input.lead.next_followup_at) return null;

  const patch = {
    next_followup_at: null,
    followup_stopped: true,
    followup_paused: false,
  };

  const { error } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", input.lead.id);
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    leadId: input.lead.id,
    userId: input.userId,
    activityType: "stop",
    summary: `Follow-up zastaven (status ${input.status})`,
    meta: { status: input.status },
  });

  return patch;
}

/**
 * After outbound email: treat as contact + schedule first FU if none active.
 * Does not increment followup_count (initial outreach).
 */
export function buildPatchAfterOutreachEmail(lead: Lead, nowIso: string) {
  const patch: Record<string, unknown> = {
    last_contact_at: nowIso,
    last_contact_type: "email",
  };
  if (lead.status === "new") patch.status = "contacted";

  const shouldSchedule =
    !lead.followup_stopped &&
    !lead.followup_paused &&
    !isTerminalLeadStatus(lead.status) &&
    !lead.next_followup_at;

  if (shouldSchedule) {
    const count = lead.followup_count ?? 0;
    patch.next_followup_at = nextIsoFromCount(nowIso, count);
  }

  return patch;
}
