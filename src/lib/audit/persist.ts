import { runSalonAudit } from "@/lib/audit/run-audit";
import type {
  AuditAnswers,
  AuditResult,
  SalonAuditRow,
} from "@/lib/audit/types";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  sendAdminNotification,
  sendCustomerConfirmation,
} from "@/lib/leads/email";
import type { Lead } from "@/lib/leads/types";

function categoryScore(
  result: AuditResult,
  category: string,
): number | null {
  return (
    result.scores.categories.find((c) => c.category === category)?.score ??
    null
  );
}

function resolveWebsiteField(answers: AuditAnswers): string {
  if (answers.websiteUrl?.trim()) return answers.websiteUrl.trim();
  if (answers.instagramHandle?.trim()) {
    const handle = answers.instagramHandle.trim();
    return handle.startsWith("@") ? handle : `@${handle}`;
  }
  if (answers.suggestedWebsite?.trim()) return answers.suggestedWebsite.trim();
  return answers.salonName;
}

export async function persistCompletedAudit(options: {
  answers: AuditAnswers;
  attribution?: Record<string, unknown> | null;
  sourceDetail?: string | null;
}): Promise<{ audit: SalonAuditRow; lead: Lead; result: AuditResult }> {
  const result = await runSalonAudit(options.answers);
  const supabase = createServiceClient();
  const answers = options.answers;

  const website = resolveWebsiteField(answers);
  const message = [
    "Online audit HAIRWEB",
    `HAIRWEB SCORE: ${result.overallScore}/100`,
    result.summary,
    "",
    "Top doporučení:",
    ...result.recommendations.slice(0, 5).map(
      (r, i) => `${i + 1}. [${r.priority}] ${r.title}`,
    ),
  ].join("\n");

  const leadInsert = {
    type: "inbound" as const,
    name: answers.name.trim(),
    salon_name: answers.salonName.trim(),
    email: answers.email.trim().toLowerCase(),
    phone: answers.phone?.trim() || null,
    website,
    message,
    package: null,
    source: "online_audit",
    source_detail: options.sourceDetail || "online_audit",
    status: "new" as const,
    city: answers.city.trim(),
    address: answers.address?.trim() || null,
    google_place_id: answers.googlePlaceId || null,
    google_maps_url: answers.googleMapsUrl || null,
    google_rating: answers.googleRating ?? null,
    google_reviews_count: answers.googleReviewsCount ?? null,
    has_website: answers.hasWebsite,
    has_online_booking: answers.bookingMethods.includes("online"),
    booking_provider: answers.bookingProvider || null,
    instagram_handle:
      result.scores.instagram?.handle
        ? `@${result.scores.instagram.handle}`
        : answers.instagramHandle || null,
    instagram_url: result.scores.instagram?.url || null,
    instagram_followers: result.scores.instagram?.followers ?? null,
    instagram_media_count: result.scores.instagram?.mediaCount ?? null,
    instagram_active: result.scores.instagram?.suggestedActive ?? null,
    instagram_quality: result.scores.instagram?.suggestedQuality ?? null,
    instagram_suggested_quality:
      result.scores.instagram?.suggestedQuality ?? null,
    facebook_url: answers.facebookUrl || null,
    paid_marketing:
      answers.paidAds === "regular" || answers.paidAds === "occasional",
    audit_score: result.overallScore,
    audit_completed_at: new Date().toISOString(),
    audit_web_score: categoryScore(result, "web"),
    audit_google_score: categoryScore(result, "google"),
    audit_directories_score: categoryScore(result, "directories"),
    audit_ai_score: categoryScore(result, "ai"),
    audit_reviews_score: categoryScore(result, "reviews"),
    audit_social_score: categoryScore(result, "social"),
    audit_booking_score: categoryScore(result, "booking"),
    audit_customers_score: categoryScore(result, "customers"),
    audit_marketing_score: categoryScore(result, "marketing"),
    audit_result: result as unknown as Record<string, unknown>,
    opportunity_note: result.summary,
  };

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert(leadInsert)
    .select("*")
    .single();

  if (leadError || !lead) {
    // Fallback without new audit columns (migration not applied yet)
    const {
      audit_score: _a,
      audit_completed_at: _b,
      audit_web_score: _c,
      audit_google_score: _d,
      audit_directories_score: _d2,
      audit_ai_score: _d3,
      audit_reviews_score: _e,
      audit_social_score: _f,
      audit_booking_score: _g,
      audit_customers_score: _h,
      audit_marketing_score: _i,
      audit_result: _j,
      ...legacy
    } = leadInsert;
    void _a; void _b; void _c; void _d; void _d2; void _d3; void _e; void _f; void _g; void _h; void _i; void _j;

    const retry = await supabase.from("leads").insert(legacy).select("*").single();
    if (retry.error || !retry.data) {
      console.error("[audit] Lead insert failed", leadError || retry.error);
      throw new Error("Nepodařilo se uložit lead.");
    }

    const auditRow = await insertAuditRow(supabase, {
      answers,
      result,
      leadId: retry.data.id,
      attribution: options.attribution,
    });

    try {
      await sendAdminNotification(retry.data as Lead);
    } catch (e) {
      console.error("[audit] Admin email failed", e);
    }
    try {
      await sendCustomerConfirmation(retry.data as Lead);
    } catch (e) {
      console.error("[audit] Customer email failed", e);
    }

    return {
      audit: auditRow,
      lead: retry.data as Lead,
      result,
    };
  }

  const auditRow = await insertAuditRow(supabase, {
    answers,
    result,
    leadId: lead.id,
    attribution: options.attribution,
  });

  // Link audit id on lead when column exists
  await supabase
    .from("leads")
    .update({ online_audit_id: auditRow.id })
    .eq("id", lead.id);

  try {
    await sendAdminNotification(lead as Lead);
  } catch (e) {
    console.error("[audit] Admin email failed", e);
  }
  try {
    await sendCustomerConfirmation(lead as Lead);
  } catch (e) {
    console.error("[audit] Customer email failed", e);
  }

  return { audit: auditRow, lead: lead as Lead, result };
}

async function insertAuditRow(
  supabase: ReturnType<typeof createServiceClient>,
  options: {
    answers: AuditAnswers;
    result: AuditResult;
    leadId: string;
    attribution?: Record<string, unknown> | null;
  },
): Promise<SalonAuditRow> {
  const { answers, result, leadId, attribution } = options;
  const row = {
    status: "completed" as const,
    completed_at: new Date().toISOString(),
    lead_id: leadId,
    name: answers.name,
    email: answers.email.toLowerCase(),
    phone: answers.phone || null,
    salon_name: answers.salonName,
    city: answers.city,
    address: answers.address || null,
    google_place_id: answers.googlePlaceId || null,
    answers,
    checks: result.checks,
    scores: result.scores,
    recommendations: result.recommendations,
    strengths: result.strengths,
    quick_wins: result.quickWins,
    summary: result.summary,
    overall_score: result.overallScore,
    score_web: categoryScore(result, "web"),
    score_google: categoryScore(result, "google"),
    score_directories: categoryScore(result, "directories"),
    score_ai: categoryScore(result, "ai"),
    score_reviews: categoryScore(result, "reviews"),
    score_booking: categoryScore(result, "booking"),
    score_social: categoryScore(result, "social"),
    score_customers: categoryScore(result, "customers"),
    score_marketing: categoryScore(result, "marketing"),
    relevant_services: result.relevantServices,
    attribution: attribution || null,
  };

  const { data, error } = await supabase
    .from("salon_audits")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[audit] salon_audits insert failed", error);
    // Soft-fail: return synthetic row so UX still works if migration missing
    return {
      id: leadId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: row.completed_at,
      status: "completed",
      lead_id: leadId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      salon_name: row.salon_name,
      city: row.city,
      address: row.address,
      google_place_id: row.google_place_id,
      answers,
      checks: result.checks,
      scores: result.scores,
      recommendations: result.recommendations,
      strengths: result.strengths,
      quick_wins: result.quickWins,
      summary: result.summary,
      overall_score: result.overallScore,
      score_web: row.score_web,
      score_google: row.score_google,
      score_directories: row.score_directories,
      score_ai: row.score_ai,
      score_reviews: row.score_reviews,
      score_booking: row.score_booking,
      score_social: row.score_social,
      score_customers: row.score_customers,
      score_marketing: row.score_marketing,
      relevant_services: result.relevantServices,
      attribution: attribution || null,
    };
  }

  return data as SalonAuditRow;
}

export async function getSalonAudit(
  id: string,
): Promise<SalonAuditRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("salon_audits")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!error && data) {
    return data as SalonAuditRow;
  }

  // Fallback: audit id may equal lead id when salon_audits table missing
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!lead || !lead.audit_result) {
    if (error) console.error("[audit] fetch failed", error);
    return null;
  }

  const result = lead.audit_result as AuditResult;
  return {
    id: lead.id,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
    completed_at: lead.audit_completed_at || lead.created_at,
    status: "completed",
    lead_id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    salon_name: lead.salon_name || lead.name,
    city: lead.city || "",
    address: lead.address,
    google_place_id: lead.google_place_id,
    answers: (lead.audit_result as { answers?: AuditAnswers })?.answers ||
      ({} as AuditAnswers),
    checks: result.checks || [],
    scores: result.scores,
    recommendations: result.recommendations || [],
    strengths: result.strengths || [],
    quick_wins: result.quickWins || [],
    summary: result.summary || lead.opportunity_note,
    overall_score: lead.audit_score ?? result.overallScore,
    score_web: lead.audit_web_score ?? null,
    score_google: lead.audit_google_score ?? null,
    score_directories: lead.audit_directories_score ?? null,
    score_ai: lead.audit_ai_score ?? null,
    score_reviews: lead.audit_reviews_score ?? null,
    score_booking: lead.audit_booking_score ?? null,
    score_social: lead.audit_social_score ?? null,
    score_customers: lead.audit_customers_score ?? null,
    score_marketing: lead.audit_marketing_score ?? null,
    relevant_services: result.relevantServices || [],
    attribution: null,
  };
}
