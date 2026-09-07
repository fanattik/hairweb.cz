"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ScoreSummaryCard } from "@/components/admin/ScoreBadges";
import { calculateLeadScores } from "@/lib/leads/scoring";
import {
  BUSINESS_SIZE_LABELS,
  BUSINESS_SIZES,
  INSTAGRAM_QUALITIES,
  INSTAGRAM_QUALITY_LABELS,
  LEAD_STATUSES,
  WEB_SCORE_MAX,
  type BusinessSize,
  type InstagramQuality,
  type Lead,
  type LeadStatus,
} from "@/lib/leads/types";

const field =
  "border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-copper w-full";

type Mode = "create" | "edit";

type FormState = {
  name: string;
  salon_name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  website: string;
  google_maps_url: string;
  google_rating: string;
  google_reviews_count: string;
  instagram_url: string;
  instagram_handle: string;
  instagram_active: boolean | null;
  instagram_followers: string;
  instagram_quality: InstagramQuality | "";
  has_online_booking: boolean | null;
  booking_provider: string;
  booking_url: string;
  business_size: BusinessSize | "";
  premium_impression: boolean;
  professional_photos: boolean;
  professional_branding: boolean;
  paid_marketing: boolean;
  has_website: boolean;
  website_design_score: string;
  website_mobile_score: string;
  website_cta_score: string;
  website_content_score: string;
  website_trust_score: string;
  website_seo_score: string;
  website_performance_score: string;
  website_outdated: boolean;
  website_mobile_problem: boolean;
  website_clear_booking_cta: boolean | null;
  website_has_prices: boolean | null;
  website_has_gallery: boolean | null;
  website_has_team: boolean | null;
  website_has_reviews: boolean | null;
  website_audit: string;
  opportunity_note: string;
  notes: string;
  status: LeadStatus;
  last_contact_at: string;
  next_followup_at: string;
  won_value: string;
  lost_reason: string;
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function numOrNull(value: string) {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function boolTri(value: boolean | null): boolean | null {
  return value;
}

function fromLead(lead?: Lead): FormState {
  return {
    name: lead?.name ?? "",
    salon_name: lead?.salon_name ?? "",
    contact_person: lead?.contact_person ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    city: lead?.city ?? "",
    region: lead?.region ?? "",
    website: lead?.website && lead.website !== "—" ? lead.website : "",
    google_maps_url: lead?.google_maps_url ?? "",
    google_rating:
      lead?.google_rating != null ? String(lead.google_rating) : "",
    google_reviews_count:
      lead?.google_reviews_count != null
        ? String(lead.google_reviews_count)
        : "",
    instagram_url: lead?.instagram_url ?? "",
    instagram_handle: lead?.instagram_handle ?? "",
    instagram_active: lead?.instagram_active ?? null,
    instagram_followers:
      lead?.instagram_followers != null
        ? String(lead.instagram_followers)
        : "",
    instagram_quality: lead?.instagram_quality ?? "",
    has_online_booking: lead?.has_online_booking ?? null,
    booking_provider: lead?.booking_provider ?? "",
    booking_url: lead?.booking_url ?? "",
    business_size: lead?.business_size ?? "",
    premium_impression: lead?.premium_impression ?? false,
    professional_photos: lead?.professional_photos ?? false,
    professional_branding: lead?.professional_branding ?? false,
    paid_marketing: lead?.paid_marketing ?? false,
    has_website: lead?.has_website ?? true,
    website_design_score:
      lead?.website_design_score != null
        ? String(lead.website_design_score)
        : "",
    website_mobile_score:
      lead?.website_mobile_score != null
        ? String(lead.website_mobile_score)
        : "",
    website_cta_score:
      lead?.website_cta_score != null ? String(lead.website_cta_score) : "",
    website_content_score:
      lead?.website_content_score != null
        ? String(lead.website_content_score)
        : "",
    website_trust_score:
      lead?.website_trust_score != null
        ? String(lead.website_trust_score)
        : "",
    website_seo_score:
      lead?.website_seo_score != null ? String(lead.website_seo_score) : "",
    website_performance_score:
      lead?.website_performance_score != null
        ? String(lead.website_performance_score)
        : "",
    website_outdated: lead?.website_outdated ?? false,
    website_mobile_problem: lead?.website_mobile_problem ?? false,
    website_clear_booking_cta: lead?.website_clear_booking_cta ?? null,
    website_has_prices: lead?.website_has_prices ?? null,
    website_has_gallery: lead?.website_has_gallery ?? null,
    website_has_team: lead?.website_has_team ?? null,
    website_has_reviews: lead?.website_has_reviews ?? null,
    website_audit: lead?.website_audit ?? "",
    opportunity_note: lead?.opportunity_note ?? "",
    notes: lead?.notes ?? "",
    status: lead?.status ?? "new",
    last_contact_at: toLocalInput(lead?.last_contact_at ?? null),
    next_followup_at: toLocalInput(lead?.next_followup_at ?? null),
    won_value: lead?.won_value != null ? String(lead.won_value) : "",
    lost_reason: lead?.lost_reason ?? "",
  };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-line bg-foam p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
        {title}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function ScoreField({
  label,
  max,
  value,
  onChange,
}: {
  label: string;
  max: number;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm sm:col-span-1">
      <span className="font-medium">
        {label}{" "}
        <span className="font-normal text-ink-soft">/ {max}</span>
      </span>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      />
    </label>
  );
}

function TriBool({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        value={value === null ? "" : value ? "true" : "false"}
        onChange={(e) => {
          if (e.target.value === "") onChange(null);
          else onChange(e.target.value === "true");
        }}
        className={field}
      >
        <option value="">—</option>
        <option value="true">Ano</option>
        <option value="false">Ne</option>
      </select>
    </label>
  );
}

export function LeadEditorForm({
  mode,
  lead,
}: {
  mode: Mode;
  lead?: Lead;
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => fromLead(lead));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  const liveScores = useMemo(() => {
    return calculateLeadScores({
      email: state.email,
      phone: state.phone,
      contact_person: state.contact_person,
      google_rating: numOrNull(state.google_rating),
      google_reviews_count: numOrNull(state.google_reviews_count),
      instagram_url: state.instagram_url,
      instagram_handle: state.instagram_handle,
      instagram_active: boolTri(state.instagram_active),
      instagram_quality: state.instagram_quality || null,
      premium_impression: state.premium_impression,
      has_online_booking: boolTri(state.has_online_booking),
      paid_marketing: state.paid_marketing,
      professional_branding: state.professional_branding,
      professional_photos: state.professional_photos,
      business_size: state.business_size || null,
      has_website: state.has_website,
      website_design_score: numOrNull(state.website_design_score),
      website_mobile_score: numOrNull(state.website_mobile_score),
      website_cta_score: numOrNull(state.website_cta_score),
      website_content_score: numOrNull(state.website_content_score),
      website_trust_score: numOrNull(state.website_trust_score),
      website_seo_score: numOrNull(state.website_seo_score),
      website_performance_score: numOrNull(state.website_performance_score),
      website_mobile_problem: state.website_mobile_problem,
      website_clear_booking_cta: boolTri(state.website_clear_booking_cta),
      website_has_prices: boolTri(state.website_has_prices),
      website_has_gallery: boolTri(state.website_has_gallery),
    });
  }, [state]);

  function buildPayload() {
    const qualification = {
      salon_name: state.salon_name || null,
      contact_person: state.contact_person || null,
      city: state.city || null,
      region: state.region || null,
      phone: state.phone || null,
      website: state.website || null,
      google_rating: numOrNull(state.google_rating),
      google_reviews_count: numOrNull(state.google_reviews_count),
      google_maps_url: state.google_maps_url || null,
      instagram_url: state.instagram_url || null,
      instagram_handle: state.instagram_handle || null,
      instagram_active: state.instagram_active,
      instagram_followers: numOrNull(state.instagram_followers),
      instagram_quality: state.instagram_quality || null,
      has_online_booking: state.has_online_booking,
      booking_provider: state.booking_provider || null,
      booking_url: state.booking_url || null,
      business_size: state.business_size || null,
      premium_impression: state.premium_impression,
      professional_photos: state.professional_photos,
      professional_branding: state.professional_branding,
      paid_marketing: state.paid_marketing,
      has_website: state.has_website,
      website_design_score: state.has_website
        ? numOrNull(state.website_design_score)
        : null,
      website_mobile_score: state.has_website
        ? numOrNull(state.website_mobile_score)
        : null,
      website_cta_score: state.has_website
        ? numOrNull(state.website_cta_score)
        : null,
      website_content_score: state.has_website
        ? numOrNull(state.website_content_score)
        : null,
      website_trust_score: state.has_website
        ? numOrNull(state.website_trust_score)
        : null,
      website_seo_score: state.has_website
        ? numOrNull(state.website_seo_score)
        : null,
      website_performance_score: state.has_website
        ? numOrNull(state.website_performance_score)
        : null,
      website_outdated: state.website_outdated,
      website_mobile_problem: state.website_mobile_problem,
      website_clear_booking_cta: state.website_clear_booking_cta,
      website_has_prices: state.website_has_prices,
      website_has_gallery: state.website_has_gallery,
      website_has_team: state.website_has_team,
      website_has_reviews: state.website_has_reviews,
      website_audit: state.website_audit || null,
      opportunity_note: state.opportunity_note || null,
    };

    if (mode === "create") {
      return {
        ...qualification,
        name: state.name,
        salonName: state.salon_name,
        email: state.email,
        phone: state.phone,
        website: state.website,
        notes: state.notes,
      };
    }

    return {
      name: state.name,
      email: state.email,
      status: state.status,
      notes: state.notes || null,
      last_contact_at: toIsoOrNull(state.last_contact_at),
      next_followup_at: toIsoOrNull(state.next_followup_at),
      won_value: numOrNull(state.won_value),
      lost_reason: state.lost_reason || null,
      ...qualification,
    };
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch(
      mode === "create" ? "/api/admin/leads" : `/api/admin/leads/${lead!.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      },
    );

    setSaving(false);

    if (!response.ok) {
      setMessage(mode === "create" ? "Vytvoření se nepovedlo." : "Uložení se nepovedlo.");
      return;
    }

    if (mode === "create") {
      const data = (await response.json()) as { id: string };
      router.push(`/admin/leads/${data.id}`);
      router.refresh();
      return;
    }

    setMessage("Uloženo. Score přepočítán serverem.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="grid gap-5">
        <Section title="Základní údaje">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Název salonu</span>
            <input
              className={field}
              value={state.salon_name}
              onChange={(e) => patch("salon_name", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Kontaktní osoba</span>
            <input
              className={field}
              value={state.contact_person}
              onChange={(e) => patch("contact_person", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Jméno v CRM *</span>
            <input
              required
              className={field}
              value={state.name}
              onChange={(e) => patch("name", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">E-mail *</span>
            <input
              required
              type="email"
              className={field}
              value={state.email}
              onChange={(e) => patch("email", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Telefon</span>
            <input
              className={field}
              value={state.phone}
              onChange={(e) => patch("phone", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Město</span>
            <input
              className={field}
              value={state.city}
              onChange={(e) => patch("city", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Region</span>
            <input
              className={field}
              value={state.region}
              onChange={(e) => patch("region", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Web</span>
            <input
              className={field}
              value={state.website}
              onChange={(e) => patch("website", e.target.value)}
              disabled={!state.has_website}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Instagram URL</span>
            <input
              className={field}
              value={state.instagram_url}
              onChange={(e) => patch("instagram_url", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Google Maps URL</span>
            <input
              className={field}
              value={state.google_maps_url}
              onChange={(e) => patch("google_maps_url", e.target.value)}
            />
          </label>
        </Section>

        <Section title="Google">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Google rating (0–5)</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className={field}
              value={state.google_rating}
              onChange={(e) => patch("google_rating", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Počet Google recenzí</span>
            <input
              type="number"
              min={0}
              className={field}
              value={state.google_reviews_count}
              onChange={(e) => patch("google_reviews_count", e.target.value)}
            />
          </label>
        </Section>

        <Section title="Instagram / social">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Handle</span>
            <input
              className={field}
              value={state.instagram_handle}
              onChange={(e) => patch("instagram_handle", e.target.value)}
              placeholder="@salon"
            />
          </label>
          <TriBool
            label="Instagram aktivní"
            value={state.instagram_active}
            onChange={(v) => patch("instagram_active", v)}
          />
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Followers</span>
            <input
              type="number"
              min={0}
              className={field}
              value={state.instagram_followers}
              onChange={(e) => patch("instagram_followers", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Kvalita Instagramu</span>
            <select
              className={field}
              value={state.instagram_quality}
              onChange={(e) =>
                patch(
                  "instagram_quality",
                  e.target.value as InstagramQuality | "",
                )
              }
            >
              <option value="">—</option>
              {INSTAGRAM_QUALITIES.map((q) => (
                <option key={q} value={q}>
                  {INSTAGRAM_QUALITY_LABELS[q]}
                </option>
              ))}
            </select>
          </label>
        </Section>

        <Section title="Booking">
          <TriBool
            label="Online rezervace"
            value={state.has_online_booking}
            onChange={(v) => patch("has_online_booking", v)}
          />
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Rezervační systém</span>
            <input
              className={field}
              list="booking-providers"
              value={state.booking_provider}
              onChange={(e) => patch("booking_provider", e.target.value)}
            />
            <datalist id="booking-providers">
              <option value="Reservio" />
              <option value="Fresha" />
              <option value="Bookio" />
              <option value="SimplyBook" />
              <option value="Vlastní systém" />
              <option value="Jiný" />
            </datalist>
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Rezervační URL</span>
            <input
              className={field}
              value={state.booking_url}
              onChange={(e) => patch("booking_url", e.target.value)}
            />
          </label>
        </Section>

        <Section title="Business">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Velikost salonu</span>
            <select
              className={field}
              value={state.business_size}
              onChange={(e) =>
                patch("business_size", e.target.value as BusinessSize | "")
              }
            >
              <option value="">—</option>
              {BUSINESS_SIZES.map((size) => (
                <option key={size} value={size}>
                  {BUSINESS_SIZE_LABELS[size]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-1">
            <input
              type="checkbox"
              checked={state.premium_impression}
              onChange={(e) => patch("premium_impression", e.target.checked)}
            />
            Prémiový dojem
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.professional_photos}
              onChange={(e) => patch("professional_photos", e.target.checked)}
            />
            Profesionální fotografie
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.professional_branding}
              onChange={(e) => patch("professional_branding", e.target.checked)}
            />
            Profesionální branding
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.paid_marketing}
              onChange={(e) => patch("paid_marketing", e.target.checked)}
            />
            Placený marketing / reklama
          </label>
        </Section>

        <Section title="Web audit">
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={state.has_website}
              onChange={(e) => patch("has_website", e.target.checked)}
            />
            Salon má web
          </label>

          {state.has_website ? (
            <>
              <ScoreField
                label="Design"
                max={WEB_SCORE_MAX.design}
                value={state.website_design_score}
                onChange={(v) => patch("website_design_score", v)}
              />
              <ScoreField
                label="Mobile UX"
                max={WEB_SCORE_MAX.mobile}
                value={state.website_mobile_score}
                onChange={(v) => patch("website_mobile_score", v)}
              />
              <ScoreField
                label="CTA / rezervace"
                max={WEB_SCORE_MAX.cta}
                value={state.website_cta_score}
                onChange={(v) => patch("website_cta_score", v)}
              />
              <ScoreField
                label="Obsah / služby / ceník"
                max={WEB_SCORE_MAX.content}
                value={state.website_content_score}
                onChange={(v) => patch("website_content_score", v)}
              />
              <ScoreField
                label="Trust"
                max={WEB_SCORE_MAX.trust}
                value={state.website_trust_score}
                onChange={(v) => patch("website_trust_score", v)}
              />
              <ScoreField
                label="SEO"
                max={WEB_SCORE_MAX.seo}
                value={state.website_seo_score}
                onChange={(v) => patch("website_seo_score", v)}
              />
              <ScoreField
                label="Performance"
                max={WEB_SCORE_MAX.performance}
                value={state.website_performance_score}
                onChange={(v) => patch("website_performance_score", v)}
              />
              <p className="sm:col-span-2 text-sm text-ink-soft">
                Web Score live:{" "}
                <span className="font-medium text-ink">
                  {liveScores.webScore} / 100
                </span>
              </p>
            </>
          ) : (
            <p className="sm:col-span-2 text-sm text-ink-soft">
              Bez webu → vysoká web opportunity (35+ bonusy, max 40).
            </p>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.website_outdated}
              onChange={(e) => patch("website_outdated", e.target.checked)}
            />
            Web je zastaralý
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.website_mobile_problem}
              onChange={(e) =>
                patch("website_mobile_problem", e.target.checked)
              }
            />
            Problém na mobilu
          </label>
          <TriBool
            label="Jasná rezervace (CTA)"
            value={state.website_clear_booking_cta}
            onChange={(v) => patch("website_clear_booking_cta", v)}
          />
          <TriBool
            label="Ceník"
            value={state.website_has_prices}
            onChange={(v) => patch("website_has_prices", v)}
          />
          <TriBool
            label="Galerie"
            value={state.website_has_gallery}
            onChange={(v) => patch("website_has_gallery", v)}
          />
          <TriBool
            label="Tým"
            value={state.website_has_team}
            onChange={(v) => patch("website_has_team", v)}
          />
          <TriBool
            label="Recenze na webu"
            value={state.website_has_reviews}
            onChange={(v) => patch("website_has_reviews", v)}
          />
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Audit webu</span>
            <textarea
              rows={4}
              className={field}
              value={state.website_audit}
              onChange={(e) => patch("website_audit", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Obchodní příležitost</span>
            <textarea
              rows={4}
              className={field}
              value={state.opportunity_note}
              onChange={(e) => patch("opportunity_note", e.target.value)}
            />
          </label>
        </Section>

        <Section title={mode === "edit" ? "CRM workflow" : "Poznámka"}>
          {mode === "edit" ? (
            <>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Status</span>
                <select
                  className={field}
                  value={state.status}
                  onChange={(e) =>
                    patch("status", e.target.value as LeadStatus)
                  }
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Poslední kontakt</span>
                <input
                  type="datetime-local"
                  className={field}
                  value={state.last_contact_at}
                  onChange={(e) => patch("last_contact_at", e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Další follow-up</span>
                <input
                  type="datetime-local"
                  className={field}
                  value={state.next_followup_at}
                  onChange={(e) => patch("next_followup_at", e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Won value (Kč)</span>
                <input
                  type="number"
                  min={0}
                  className={field}
                  value={state.won_value}
                  onChange={(e) => patch("won_value", e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm sm:col-span-2">
                <span className="font-medium">Důvod lost</span>
                <input
                  className={field}
                  value={state.lost_reason}
                  onChange={(e) => patch("lost_reason", e.target.value)}
                />
              </label>
            </>
          ) : null}
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Interní poznámky</span>
            <textarea
              rows={4}
              className={field}
              value={state.notes}
              onChange={(e) => patch("notes", e.target.value)}
            />
          </label>
        </Section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-ink px-4 py-2.5 text-sm text-foam hover:bg-ink-soft disabled:opacity-60"
          >
            {saving
              ? "Ukládám…"
              : mode === "create"
                ? "Vytvořit outbound lead"
                : "Uložit lead"}
          </button>
          {message ? <p className="text-sm text-ink-soft">{message}</p> : null}
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <ScoreSummaryCard
          businessScore={liveScores.businessScore}
          webOpportunityScore={liveScores.webOpportunityScore}
          purchaseIntentScore={liveScores.purchaseIntentScore}
          contactabilityScore={liveScores.contactabilityScore}
          leadScore={liveScores.leadScore}
          priority={liveScores.priority}
        />
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Live náhled. Finální score se vždy přepočítá na serveru při uložení.
        </p>
        <p className="mt-3 border border-line bg-mist p-3 text-xs leading-relaxed text-ink">
          <span className="font-semibold">Doporučení: </span>
          {liveScores.recommendedAction}
        </p>
      </aside>
    </form>
  );
}
