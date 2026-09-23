import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyzeLeadButton } from "@/components/admin/AnalyzeLeadButton";
import { DeleteLeadButton } from "@/components/admin/DeleteLeadButton";
import { LeadOutreachPanel } from "@/components/admin/LeadOutreachPanel";
import { LeadFollowupPanel } from "@/components/admin/LeadFollowupPanel";
import { OpportunityActions } from "@/components/admin/discovery/OpportunityActions";
import { LeadCrmForm } from "@/components/admin/LeadCrmForm";
import { LeadSourceSection } from "@/components/admin/LeadSourceSection";
import { OnlineAuditPanel } from "@/components/admin/OnlineAuditPanel";
import { LeadsListLink } from "@/components/admin/LeadsListUrlPersistence";
import {
  OpportunityBadge,
  PriorityBadge,
  ScoreSummaryCard,
  WebBandBadge,
} from "@/components/admin/ScoreBadges";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WebAuditGauges } from "@/components/admin/WebAuditGauges";
import { AdminCard, AdminSection } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import {
  leadOpportunityFromScore,
  leadPriorityFromScore,
  recommendedActionFromPriority,
  webScoreBand,
} from "@/lib/leads/scoring";
import {
  BUSINESS_SIZE_LABELS,
  INSTAGRAM_QUALITY_LABELS,
  type Lead,
} from "@/lib/leads/types";

function externalHref(value: string) {
  if (value.startsWith("@")) {
    return `https://instagram.com/${value.slice(1)}`;
  }
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink/6 py-2.5 text-sm last:border-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

function actionLinkClass() {
  return "inline-flex min-h-10 items-center rounded-full border border-ink/12 px-4 text-[13px] font-medium transition hover:border-ink/30";
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("[admin] lead detail", error);
  if (!data) notFound();

  const lead = data as Lead;
  const title = lead.salon_name || lead.name;
  const hasScore = lead.lead_score != null;
  const priority =
    lead.lead_score != null ? leadPriorityFromScore(lead.lead_score) : null;
  const opportunity =
    lead.lead_score != null
      ? leadOpportunityFromScore(lead.lead_score)
      : null;

  return (
    <AdminShell email={user.email}>
      <LeadsListLink className="text-sm font-medium text-copper hover:underline">
        ← Zpět na leady
      </LeadsListLink>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <p className="eyebrow mb-2">Lead</p>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-ink">
            {title}
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            {[lead.city, lead.region].filter(Boolean).join(" · ") || "—"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            {priority ? <PriorityBadge priority={priority} /> : null}
            {opportunity ? (
              <OpportunityBadge opportunity={opportunity} />
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {lead.email ? (
            <a href={`mailto:${lead.email}`} className={actionLinkClass()}>
              E-mail
            </a>
          ) : null}
          {lead.phone ? (
            <a href={`tel:${lead.phone}`} className={actionLinkClass()}>
              Telefon
            </a>
          ) : null}
          {lead.website && lead.website !== "—" ? (
            <a
              href={externalHref(lead.website)}
              target="_blank"
              rel="noopener noreferrer"
              className={actionLinkClass()}
            >
              Web
            </a>
          ) : null}
          {lead.instagram_url || lead.instagram_handle ? (
            <a
              href={externalHref(
                lead.instagram_url ||
                  (lead.instagram_handle?.startsWith("@")
                    ? lead.instagram_handle
                    : `@${lead.instagram_handle}`),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={actionLinkClass()}
            >
              Instagram
            </a>
          ) : null}
          {lead.google_maps_url ? (
            <a
              href={lead.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className={actionLinkClass()}
            >
              Maps
            </a>
          ) : null}
          <DeleteLeadButton leadId={lead.id} leadLabel={title} />
        </div>
      </div>

      <AdminSection title="Přehled" description="Skóre a klíčové signály.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminCard padding="sm">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
              Lead Score
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {hasScore ? `${lead.lead_score}` : "—"}
            </p>
          </AdminCard>
          <AdminCard padding="sm">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
              Google
            </p>
            <p className="mt-2 text-lg font-semibold">
              {lead.google_rating != null
                ? `${Number(lead.google_rating).toFixed(1)} ★`
                : "—"}
            </p>
            <p className="text-sm text-ink-soft">
              {lead.google_reviews_count != null
                ? `${lead.google_reviews_count} recenzí`
                : "bez recenzí"}
            </p>
          </AdminCard>
          <AdminCard padding="sm">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
              Web Score
            </p>
            <p className="mt-2 text-lg font-semibold">
              {lead.has_website === false
                ? "NO WEB"
                : lead.web_score != null
                  ? `${lead.web_score}`
                  : "—"}
            </p>
            {lead.web_score != null && lead.has_website !== false ? (
              <div className="mt-2">
                <WebBandBadge band={webScoreBand(lead.web_score)} />
              </div>
            ) : null}
          </AdminCard>
          <AdminCard padding="sm">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
              Opportunity
            </p>
            <div className="mt-3">
              {opportunity ? (
                <OpportunityBadge opportunity={opportunity} />
              ) : (
                "—"
              )}
            </div>
          </AdminCard>
        </div>
      </AdminSection>

      <AdminSection title="Online audit" description="Výsledek HAIRWEB Online Auditu.">
        <OnlineAuditPanel lead={lead} />
      </AdminSection>

      {lead.opportunity_score != null ? (
        <AdminSection title="Opportunity detail">
          <AdminCard>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-[-0.05em]">
                  {lead.opportunity_score}
                  <span className="text-lg text-ink-soft"> / 100</span>
                </p>
                <p className="mt-1 text-sm">
                  Grade{" "}
                  <span className="font-semibold">{lead.opportunity_grade}</span>
                  {lead.opportunity_grade === "A" ? (
                    <span className="ml-2 text-copper">Hot</span>
                  ) : null}
                </p>
              </div>
              <OpportunityActions lead={lead} />
            </div>
            {Array.isArray(lead.opportunity_reasons) &&
            lead.opportunity_reasons.length ? (
              <ul className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
                {lead.opportunity_reasons.map((reason) => (
                  <li key={`${reason.label}-${reason.points}`}>
                    +{reason.points} {reason.label}
                  </li>
                ))}
              </ul>
            ) : null}
            {lead.opportunity_summary ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                {lead.opportunity_summary}
              </p>
            ) : null}
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ink-muted">Pitch</dt>
                <dd>{lead.recommended_pitch || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Služba</dt>
                <dd>{lead.suggested_service || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Kanál</dt>
                <dd>{lead.recommended_channel || "—"}</dd>
              </div>
            </dl>
          </AdminCard>
        </AdminSection>
      ) : null}

      <AdminSection title="Skóre & analýza">
        {hasScore && priority ? (
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <ScoreSummaryCard
              businessScore={lead.business_score ?? 0}
              webOpportunityScore={lead.web_opportunity_score ?? 0}
              purchaseIntentScore={lead.purchase_intent_score ?? 0}
              contactabilityScore={lead.contactability_score ?? 0}
              leadScore={lead.lead_score ?? 0}
              priority={priority}
            />
            <div className="grid gap-3">
              <AdminCard>
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
                  Doporučená akce
                </p>
                <p className="mt-3 text-base text-ink">
                  {recommendedActionFromPriority(priority)}
                </p>
                {lead.opportunity_note ? (
                  <p className="mt-4 whitespace-pre-wrap text-sm text-ink-soft">
                    {lead.opportunity_note}
                  </p>
                ) : null}
              </AdminCard>
              <AnalyzeLeadButton lead={lead} />
            </div>
          </div>
        ) : (
          <AnalyzeLeadButton lead={lead} />
        )}
      </AdminSection>

      <AdminSection title="Profil salonu">
        <div className="grid gap-3 lg:grid-cols-2">
          <AdminCard>
            <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
              Business
            </p>
            <dl>
              <Row
                label="Google rating"
                value={
                  lead.google_rating != null
                    ? `${Number(lead.google_rating).toFixed(1)} ★`
                    : "—"
                }
              />
              <Row label="Google reviews" value={lead.google_reviews_count ?? "—"} />
              <Row
                label="Instagram"
                value={lead.instagram_handle || lead.instagram_url || "—"}
              />
              <Row label="Followers" value={lead.instagram_followers ?? "—"} />
              <Row label="IG posts" value={lead.instagram_media_count ?? "—"} />
              <Row
                label="IG active"
                value={
                  lead.instagram_active == null
                    ? "—"
                    : lead.instagram_active
                      ? "Ano"
                      : "Ne"
                }
              />
              <Row
                label="IG quality"
                value={
                  lead.instagram_quality
                    ? INSTAGRAM_QUALITY_LABELS[lead.instagram_quality]
                    : "—"
                }
              />
              <Row
                label="Velikost"
                value={
                  lead.business_size
                    ? BUSINESS_SIZE_LABELS[lead.business_size]
                    : "—"
                }
              />
              <Row
                label="Booking"
                value={
                  lead.has_online_booking
                    ? lead.booking_provider || "Ano"
                    : lead.has_online_booking === false
                      ? "Ne"
                      : "—"
                }
              />
            </dl>
          </AdminCard>

          <AdminCard>
            <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
              Web audit
            </p>
            {lead.has_website === false ? (
              <p className="mt-2 text-sm text-ink-soft">Salon nemá web.</p>
            ) : lead.lighthouse_performance != null ||
              lead.website_design_score != null ? (
              <div className="mt-2">
                <WebAuditGauges
                  lighthouse={{
                    performance: lead.lighthouse_performance,
                    accessibility: lead.lighthouse_accessibility,
                    bestPractices: lead.lighthouse_best_practices,
                    seo: lead.lighthouse_seo,
                  }}
                  scores={{
                    website_design_score: lead.website_design_score,
                    website_mobile_score: lead.website_mobile_score,
                    website_cta_score: lead.website_cta_score,
                    website_content_score: lead.website_content_score,
                    website_trust_score: lead.website_trust_score,
                    website_seo_score: lead.website_seo_score,
                    website_performance_score: lead.website_performance_score,
                  }}
                  auditText={lead.website_audit}
                />
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                Zatím bez auditu — spusť Analyzovat.
              </p>
            )}
          </AdminCard>

          <AdminCard className="lg:col-span-2">
            <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
              Acquisition
            </p>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <Row label="Typ" value={lead.type} />
              <Row
                label="Balíček"
                value={lead.package ? lead.package.toUpperCase() : "—"}
              />
              <Row label="Kontakt" value={lead.name} />
              <Row label="E-mail" value={lead.email} />
            </dl>
            {lead.message ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">
                {lead.message}
              </p>
            ) : null}
            <div className="mt-4">
              <LeadSourceSection lead={lead} />
            </div>
          </AdminCard>
        </div>
      </AdminSection>

      <AdminSection
        title="Outreach & follow-up"
        description="Komunikace a další kontakt."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <LeadOutreachPanel lead={lead} />
          <LeadFollowupPanel lead={lead} />
        </div>
      </AdminSection>

      <AdminSection title="CRM editace" description="Status, skóre a poznámky.">
        <LeadCrmForm lead={lead} />
      </AdminSection>
    </AdminShell>
  );
}
