import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyzeLeadButton } from "@/components/admin/AnalyzeLeadButton";
import { DeleteLeadButton } from "@/components/admin/DeleteLeadButton";
import { LeadOutreachPanel } from "@/components/admin/LeadOutreachPanel";
import { LeadFollowupPanel } from "@/components/admin/LeadFollowupPanel";
import { OpportunityActions } from "@/components/admin/discovery/OpportunityActions";
import { LeadCrmForm } from "@/components/admin/LeadCrmForm";
import { LeadSourceSection } from "@/components/admin/LeadSourceSection";

import {
  OpportunityBadge,
  PriorityBadge,
  ScoreSummaryCard,
  WebBandBadge,
} from "@/components/admin/ScoreBadges";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WebAuditGauges } from "@/components/admin/WebAuditGauges";
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
    <div className="flex justify-between gap-4 border-b border-line/60 py-2 text-sm last:border-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
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
      <div className="mb-6">
        <Link href="/admin/leads" className="text-sm text-copper hover:underline">
          ← Zpět na leady
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
              {title}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              {[lead.city, lead.region].filter(Boolean).join(" · ") || "—"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={lead.status} />
              {priority ? <PriorityBadge priority={priority} /> : null}
              {opportunity ? (
                <OpportunityBadge opportunity={opportunity} />
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            {lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                className="border border-line px-3 py-2 hover:border-ink"
              >
                E-mail
              </a>
            ) : null}
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                className="border border-line px-3 py-2 hover:border-ink"
              >
                Telefon
              </a>
            ) : null}
            {lead.website && lead.website !== "—" ? (
              <a
                href={externalHref(lead.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-line px-3 py-2 hover:border-ink"
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
                className="border border-line px-3 py-2 hover:border-ink"
              >
                Instagram
              </a>
            ) : null}
            {lead.google_maps_url ? (
              <a
                href={lead.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-line px-3 py-2 hover:border-ink"
              >
                Google Maps
              </a>
            ) : null}
            <DeleteLeadButton leadId={lead.id} leadLabel={title} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-line bg-foam p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Lead Score
          </p>
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">
            {hasScore ? `${lead.lead_score} / 100` : "—"}
          </p>
        </div>
        <div className="border border-line bg-foam p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Google
          </p>
          <p className="mt-2 text-lg">
            {lead.google_rating != null
              ? `${Number(lead.google_rating).toFixed(1)} ★`
              : "—"}
          </p>
          <p className="text-sm text-ink-soft">
            {lead.google_reviews_count != null
              ? `${lead.google_reviews_count} recenzí`
              : "bez recenzí"}
          </p>
        </div>
        <div className="border border-line bg-foam p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Web Score
          </p>
          <p className="mt-2 text-lg">
            {lead.has_website === false
              ? "NO WEB"
              : lead.web_score != null
                ? `${lead.web_score} / 100`
                : "—"}
          </p>
          {lead.web_score != null && lead.has_website !== false ? (
            <div className="mt-2">
              <WebBandBadge band={webScoreBand(lead.web_score)} />
            </div>
          ) : null}
        </div>
        <div className="border border-line bg-foam p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Opportunity
          </p>
          <div className="mt-3">
            {opportunity ? (
              <OpportunityBadge opportunity={opportunity} />
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {lead.opportunity_score != null ? (
        <section className="mt-4 border border-line bg-foam p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Opportunity
              </h2>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl">
                {lead.opportunity_score}
                <span className="text-lg text-ink-soft"> / 100</span>
              </p>
              <p className="mt-1 text-sm">
                Grade{" "}
                <span className="font-semibold">{lead.opportunity_grade}</span>
                {lead.opportunity_grade === "A" ? (
                  <span className="ml-2 text-copper-deep">Hot opportunity</span>
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
            <p className="mt-4 text-sm leading-relaxed text-ink">
              <span className="font-medium">AI summary: </span>
              {lead.opportunity_summary}
            </p>
          ) : null}

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-ink-soft">Recommended pitch</dt>
              <dd>{lead.recommended_pitch || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Suggested service</dt>
              <dd>{lead.suggested_service || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Outreach channel</dt>
              <dd>{lead.recommended_channel || "—"}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {hasScore && priority ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ScoreSummaryCard
            businessScore={lead.business_score ?? 0}
            webOpportunityScore={lead.web_opportunity_score ?? 0}
            purchaseIntentScore={lead.purchase_intent_score ?? 0}
            contactabilityScore={lead.contactability_score ?? 0}
            leadScore={lead.lead_score ?? 0}
            priority={priority}
          />
          <div className="grid gap-4">
            <div className="border border-line bg-mist p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Recommended action
              </p>
              <p className="mt-3 text-base text-ink">
                {recommendedActionFromPriority(priority)}
              </p>
              {lead.opportunity_note ? (
                <p className="mt-4 whitespace-pre-wrap text-sm text-ink-soft">
                  {lead.opportunity_note}
                </p>
              ) : null}
            </div>
            <AnalyzeLeadButton lead={lead} />
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <AnalyzeLeadButton lead={lead} />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="border border-line bg-foam p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Business
          </h2>
          <dl className="mt-2">
            <Row
              label="Google rating"
              value={
                lead.google_rating != null
                  ? `${Number(lead.google_rating).toFixed(1)} ★`
                  : "—"
              }
            />
            <Row
              label="Google reviews"
              value={lead.google_reviews_count ?? "—"}
            />
            <Row
              label="Instagram"
              value={lead.instagram_handle || lead.instagram_url || "—"}
            />
            <Row
              label="Followers"
              value={lead.instagram_followers ?? "—"}
            />
            <Row
              label="IG posts"
              value={lead.instagram_media_count ?? "—"}
            />
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
              label="IG návrh kvality"
              value={
                lead.instagram_suggested_quality
                  ? INSTAGRAM_QUALITY_LABELS[lead.instagram_suggested_quality]
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
              label="Premium"
              value={lead.premium_impression ? "Ano" : "Ne"}
            />
            <Row
              label="Prof. branding"
              value={lead.professional_branding ? "Ano" : "Ne"}
            />
            <Row
              label="Prof. fotky"
              value={lead.professional_photos ? "Ano" : "Ne"}
            />
            <Row
              label="Paid marketing"
              value={lead.paid_marketing ? "Ano" : "Ne"}
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
        </section>

        <section className="border border-line bg-foam p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Web audit
          </h2>
          {lead.has_website === false ? (
            <p className="mt-4 text-sm text-ink-soft">Salon nemá web.</p>
          ) : lead.lighthouse_performance != null ||
            lead.website_design_score != null ? (
            <div className="mt-4">
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
              {lead.web_score != null ? (
                <p className="mt-4 text-sm text-ink-soft">
                  Web Score {lead.web_score} / 100
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">
              Zatím bez auditu — spusť Analyzovat.
            </p>
          )}
        </section>

        <section className="border border-line bg-foam p-5 lg:col-span-2">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Acquisition / poptávka
          </h2>
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
        </section>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <LeadOutreachPanel lead={lead} />
        <LeadFollowupPanel lead={lead} />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-[family-name:var(--font-fraunces)] text-2xl tracking-tight">
          Editace & scoring
        </h2>
        <LeadCrmForm lead={lead} />
      </section>
    </AdminShell>
  );
}
