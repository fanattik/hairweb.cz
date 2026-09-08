import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadsBulkTable } from "@/components/admin/LeadsBulkTable";
import { requireAdmin } from "@/lib/admin/auth";
import {
  endOfPragueDay,
  startOfPragueDay,
} from "@/lib/leads/followup";
import type {
  Lead,
  LeadPriority,
  LeadType,
} from "@/lib/leads/types";
import { LEAD_STATUSES, STATUS_LABELS } from "@/lib/leads/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hrefWith(
  current: Record<string, string | undefined>,
  patch: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...patch };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/admin/leads?${qs}` : "/admin/leads";
}

const SORT_OPTIONS = [
  { value: "opportunity_desc", label: "Opportunity ↓", column: "opportunity_score", asc: false },
  { value: "opportunity_asc", label: "Opportunity ↑", column: "opportunity_score", asc: true },
  { value: "lead_score_desc", label: "Lead Score ↓", column: "lead_score", asc: false },
  { value: "lead_score_asc", label: "Lead Score ↑", column: "lead_score", asc: true },
  { value: "google_rating_desc", label: "Google rating ↓", column: "google_rating", asc: false },
  { value: "reviews_desc", label: "Recenze ↓", column: "google_reviews_count", asc: false },
  { value: "web_score_asc", label: "Web Score ↑", column: "web_score", asc: true },
  { value: "web_score_desc", label: "Web Score ↓", column: "web_score", asc: false },
  { value: "created_at_desc", label: "Created ↓", column: "created_at", asc: false },
  { value: "followup_asc", label: "Follow-up ↑", column: "next_followup_at", asc: true },
] as const;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase, user } = await requireAdmin();
  const params = await searchParams;

  const status = first(params.status);
  const type = first(params.type);
  const q = first(params.q)?.trim();
  const campaign = first(params.campaign)?.trim();
  const followup = first(params.followup);
  const pipeline = first(params.pipeline);
  const priority = first(params.priority) as LeadPriority | undefined;
  const city = first(params.city)?.trim();
  const googleMin = first(params.google_min);
  const reviewsMin = first(params.reviews_min);
  const webBand = first(params.web_band);
  const booking = first(params.booking);
  const igActive = first(params.ig_active);
  const quick = first(params.quick);
  const sort = first(params.sort) ?? "lead_score_desc";
  const importId = first(params.import_id);
  const grade = first(params.grade);
  const sourceType = first(params.source_type);
  const oppGrade = first(params.opp_grade);
  const oppMin = first(params.opp_min);
  const hasWebsite = first(params.has_website);
  const discoveryStatus = first(params.discovery_status);
  const discoverySource = first(params.discovery_source);
  const mktChannel = first(params.mkt_channel);

  const sortOption =
    SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];

  let query = supabase
    .from("leads")
    .select("*")
    .order(sortOption.column, {
      ascending: sortOption.asc,
      nullsFirst: false,
    });

  if (status) query = query.eq("status", status);
  if (type) query = query.eq("type", type);
  if (campaign) {
    query = query.or(
      `utm_campaign.eq.${campaign},first_touch_campaign.eq.${campaign}`,
    );
  }
  if (city) query = query.ilike("city", `%${city}%`);
  if (pipeline === "1") {
    query = query.in("status", ["interested", "meeting", "proposal"]);
  }

  const pragueStart = startOfPragueDay(new Date()).toISOString();
  const pragueEnd = endOfPragueDay(new Date()).toISOString();
  const weekEnd = endOfPragueDay(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ).toISOString();

  if (followup === "today" || quick === "followup_today") {
    query = query
      .lte("next_followup_at", pragueEnd)
      .eq("followup_paused", false)
      .eq("followup_stopped", false)
      .not("status", "in", "(won,lost,skip)");
  } else if (followup === "overdue") {
    query = query
      .lt("next_followup_at", pragueStart)
      .eq("followup_paused", false)
      .eq("followup_stopped", false)
      .not("status", "in", "(won,lost,skip)");
  } else if (followup === "due") {
    query = query
      .gte("next_followup_at", pragueStart)
      .lte("next_followup_at", pragueEnd)
      .eq("followup_paused", false)
      .eq("followup_stopped", false)
      .not("status", "in", "(won,lost,skip)");
  } else if (followup === "week") {
    query = query
      .gte("next_followup_at", pragueStart)
      .lte("next_followup_at", weekEnd)
      .eq("followup_paused", false)
      .eq("followup_stopped", false)
      .not("status", "in", "(won,lost,skip)");
  } else if (followup === "scheduled") {
    query = query
      .gt("next_followup_at", pragueEnd)
      .eq("followup_paused", false)
      .eq("followup_stopped", false)
      .not("status", "in", "(won,lost,skip)");
  } else if (followup === "none") {
    query = query.is("next_followup_at", null);
  } else if (followup === "exhausted") {
    query = query
      .gte("followup_count", 3)
      .eq("followup_stopped", false)
      .not("status", "in", "(won,lost,skip,interested,meeting,proposal)");
  }
  if (priority === "hot" || quick === "hot") {
    query = query.gte("lead_score", 80);
  } else if (priority === "good") {
    query = query.gte("lead_score", 65).lte("lead_score", 79);
  } else if (priority === "warm") {
    query = query.gte("lead_score", 50).lte("lead_score", 64);
  } else if (priority === "low") {
    query = query.lte("lead_score", 49);
  }
  if (googleMin) query = query.gte("google_rating", Number(googleMin));
  if (reviewsMin || quick === "reviews_100") {
    query = query.gte(
      "google_reviews_count",
      Number(reviewsMin || (quick === "reviews_100" ? 100 : 0)),
    );
  }
  if (webBand === "0-39" || quick === "bad_web") {
    query = query.lte("web_score", 39);
  } else if (webBand === "40-59") {
    query = query.gte("web_score", 40).lte("web_score", 59);
  } else if (webBand === "60-79") {
    query = query.gte("web_score", 60).lte("web_score", 79);
  } else if (webBand === "80+") {
    query = query.gte("web_score", 80);
  }
  if (booking === "yes" || quick === "booking") {
    query = query.eq("has_online_booking", true);
  } else if (booking === "no") {
    query = query.eq("has_online_booking", false);
  }
  if (igActive === "yes") query = query.eq("instagram_active", true);
  else if (igActive === "no") query = query.eq("instagram_active", false);
  if (quick === "no_website") query = query.eq("has_website", false);
  if (quick === "needs_analyze") {
    query = query.or(
      "last_enriched_at.is.null,enrichment_status.is.null,enrichment_status.eq.idle,enrichment_status.eq.error",
    );
  }
  if (quick === "high_rating_no_web") {
    query = query
      .eq("has_website", false)
      .gte("google_rating", 4.7)
      .gte("google_reviews_count", 50);
  }
  if (hasWebsite === "yes") query = query.eq("has_website", true);
  else if (hasWebsite === "no") query = query.eq("has_website", false);
  if (oppGrade) query = query.eq("opportunity_grade", oppGrade.toUpperCase());
  if (oppMin) query = query.gte("opportunity_score", Number(oppMin));
  if (discoveryStatus) query = query.eq("discovery_status", discoveryStatus);
  if (discoverySource) query = query.eq("discovery_source", discoverySource);
  if (grade) query = query.eq("lead_grade", grade.toUpperCase());
  if (sourceType) query = query.eq("source_type", sourceType);

  if (importId) {
    const { data: items } = await supabase
      .from("lead_import_items")
      .select("lead_id")
      .eq("import_id", importId)
      .not("lead_id", "is", null);
    const ids = [
      ...new Set(
        (items || [])
          .map((item) => item.lead_id as string | null)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    if (ids.length === 0) {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("id", ids);
    }
  }

  if (q) {
    query = query.or(
      [
        `name.ilike.%${q}%`,
        `salon_name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `website.ilike.%${q}%`,
        `instagram_handle.ilike.%${q}%`,
        `city.ilike.%${q}%`,
        `contact_person.ilike.%${q}%`,
      ].join(","),
    );
  }

  const { data, error } = await query.returns<Lead[]>();
  if (error) {
    console.error("[admin] leads list", error);
  }
  let leads = data ?? [];

  if (mktChannel) {
    const { leadMarketingChannel } = await import("@/lib/marketing-channel");
    leads = leads.filter(
      (lead) =>
        leadMarketingChannel({
          type: lead.type,
          leadSource: lead.source,
          first_touch_source: lead.first_touch_source,
          first_touch_medium: lead.first_touch_medium,
          first_touch_campaign: lead.first_touch_campaign,
          first_touch_referrer: lead.first_touch_referrer,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          fbclid: lead.fbclid,
          referrer: lead.referrer,
        }) === mktChannel,
    );
  }

  const currentFilters: Record<string, string | undefined> = {
    q,
    status,
    type,
    campaign,
    priority,
    city,
    google_min: googleMin,
    reviews_min: reviewsMin,
    web_band: webBand,
    booking,
    ig_active: igActive,
    sort,
    followup,
    pipeline,
    quick,
    import_id: importId,
    grade,
    source_type: sourceType,
    opp_grade: oppGrade,
    opp_min: oppMin,
    has_website: hasWebsite,
    discovery_status: discoveryStatus,
    discovery_source: discoverySource,
    mkt_channel: mktChannel,
  };

  const chip = (label: string, href: string, active = false) => (
    <Link
      href={href}
      className={`inline-flex border px-3 py-1.5 text-xs tracking-wide transition ${
        active
          ? "border-ink bg-ink text-foam"
          : "border-line bg-foam text-ink hover:border-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <AdminShell email={user.email}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
            Leady
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {leads.length} záznamů · prioritizace podle Lead Score
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/leads/import"
            className="border border-line px-4 py-2.5 text-sm hover:border-ink"
          >
            Importovat leady
          </Link>
          <Link
            href="/admin/leads/new"
            className="bg-ink px-4 py-2.5 text-sm text-foam hover:bg-ink-soft"
          >
            Nový outbound
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {chip(
          "Hot leads",
          hrefWith(currentFilters, { quick: "hot", priority: "hot" }),
          quick === "hot" || priority === "hot",
        )}
        {chip(
          "Bez webu",
          hrefWith(currentFilters, { quick: "no_website" }),
          quick === "no_website",
        )}
        {chip(
          "Špatný web",
          hrefWith(currentFilters, { quick: "bad_web", web_band: "0-39" }),
          quick === "bad_web" || webBand === "0-39",
        )}
        {chip(
          "100+ recenzí",
          hrefWith(currentFilters, { quick: "reviews_100", reviews_min: "100" }),
          quick === "reviews_100" || reviewsMin === "100",
        )}
        {chip(
          "Bez analýzy",
          hrefWith(currentFilters, { quick: "needs_analyze" }),
          quick === "needs_analyze",
        )}
        {chip(
          "A-grade opportunity",
          hrefWith(currentFilters, { opp_grade: "A" }),
          oppGrade === "A",
        )}
        {chip(
          "High rating / no web",
          hrefWith(currentFilters, { quick: "high_rating_no_web" }),
          quick === "high_rating_no_web",
        )}
        {chip(
          "Online booking",
          hrefWith(currentFilters, { quick: "booking", booking: "yes" }),
          quick === "booking" || booking === "yes",
        )}
        {chip(
          "Dnes follow-up",
          hrefWith(currentFilters, { quick: "followup_today", followup: "today" }),
          quick === "followup_today" || followup === "today",
        )}
        {chip(
          "Po termínu",
          hrefWith(currentFilters, { followup: "overdue", quick: "" }),
          followup === "overdue",
        )}
        {chip(
          "Tento týden",
          hrefWith(currentFilters, { followup: "week", quick: "" }),
          followup === "week",
        )}
        {chip(
          "Naplánované",
          hrefWith(currentFilters, { followup: "scheduled", quick: "" }),
          followup === "scheduled",
        )}
        {chip(
          "Bez follow-upu",
          hrefWith(currentFilters, { followup: "none", quick: "" }),
          followup === "none",
        )}
        {chip("Vyčistit filtry", "/admin/leads")}
      </div>

      <form className="mt-5 grid gap-3 border border-line bg-foam p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Hledat salon / město / e-mail / IG…"
          className="border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-copper sm:col-span-2"
        />
        <select
          name="priority"
          defaultValue={priority}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Priorita</option>
          <option value="hot">HOT</option>
          <option value="good">GOOD</option>
          <option value="warm">WARM</option>
          <option value="low">LOW</option>
        </select>
        <select
          name="opp_grade"
          defaultValue={oppGrade}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Opportunity grade</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <select
          name="has_website"
          defaultValue={hasWebsite}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Web</option>
          <option value="yes">Má web</option>
          <option value="no">Bez webu</option>
        </select>
        <select
          name="discovery_status"
          defaultValue={discoveryStatus}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Discovery status</option>
          <option value="ready">Připraveno</option>
          <option value="needs_review">Ke kontrole</option>
          <option value="discovered">Nalezeno</option>
          <option value="enriching">Obohacování</option>
          <option value="rejected">Zamítnuto</option>
        </select>
        <input
          name="discovery_source"
          defaultValue={discoverySource}
          placeholder="Discovery source"
          className="border border-line bg-mist px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Sales status</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          name="followup"
          defaultValue={followup}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Follow-up</option>
          <option value="today">Dnes (+ po termínu)</option>
          <option value="due">Jen dnes</option>
          <option value="overdue">Po termínu</option>
          <option value="week">Tento týden</option>
          <option value="scheduled">Naplánované</option>
          <option value="none">Bez follow-upu</option>
          <option value="exhausted">Bez odpovědi po 3 FU</option>
        </select>
        <select
          name="type"
          defaultValue={type}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Type (vše)</option>
          {(["inbound", "outbound"] as LeadType[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          name="city"
          defaultValue={city}
          placeholder="Město"
          className="border border-line bg-mist px-3 py-2 text-sm"
        />
        <select
          name="grade"
          defaultValue={grade}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Grade</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <select
          name="source_type"
          defaultValue={sourceType}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">CRM zdroj</option>
          <option value="google_maps">Google Maps</option>
          <option value="firmy_cz">Firmy.cz</option>
          <option value="instagram">Instagram</option>
          <option value="manual">Manual</option>
          <option value="other">Other</option>
        </select>
        <select
          name="mkt_channel"
          defaultValue={mktChannel}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Marketing zdroj</option>
          <option value="meta_ads">Meta Ads</option>
          <option value="google_ads">Google Ads</option>
          <option value="google_organic">Google Organic</option>
          <option value="organic_social">Organic Social</option>
          <option value="referral">Referral</option>
          <option value="direct">Direct</option>
          <option value="outbound">Outbound</option>
          <option value="other">Other</option>
        </select>
        <input
          name="campaign"
          defaultValue={campaign}
          placeholder="utm_campaign"
          className="border border-line bg-mist px-3 py-2 text-sm"
        />
        <input
          name="import_id"
          defaultValue={importId}
          placeholder="Import ID"
          className="border border-line bg-mist px-3 py-2 text-sm"
        />
        <select
          name="google_min"
          defaultValue={googleMin}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Google rating</option>
          <option value="4.8">4.8+</option>
          <option value="4.6">4.6+</option>
          <option value="4.4">4.4+</option>
        </select>
        <select
          name="reviews_min"
          defaultValue={reviewsMin}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Recenze</option>
          <option value="200">200+</option>
          <option value="100">100+</option>
          <option value="50">50+</option>
          <option value="20">20+</option>
        </select>
        <select
          name="web_band"
          defaultValue={webBand}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Web Score</option>
          <option value="0-39">0–39 POOR</option>
          <option value="40-59">40–59 WEAK</option>
          <option value="60-79">60–79 GOOD</option>
          <option value="80+">80+ STRONG</option>
        </select>
        <select
          name="booking"
          defaultValue={booking}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Booking</option>
          <option value="yes">Ano</option>
          <option value="no">Ne</option>
        </select>
        <select
          name="ig_active"
          defaultValue={igActive}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Instagram active</option>
          <option value="yes">Ano</option>
          <option value="no">Ne</option>
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-copper px-4 py-2 text-sm text-foam hover:bg-copper-deep"
        >
          Filtrovat
        </button>
      </form>

      {leads.length === 0 ? (
        <p className="mt-6 border border-line bg-foam px-3 py-8 text-center text-ink-soft">
          Žádné leady.
        </p>
      ) : (
        <LeadsBulkTable leads={leads} />
      )}
    </AdminShell>
  );
}
