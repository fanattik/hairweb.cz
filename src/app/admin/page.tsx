import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadsMap } from "@/components/admin/LeadsMap";
import { TodayFollowupsSection } from "@/components/admin/TodayFollowupsSection";
import { requireAdmin } from "@/lib/admin/auth";
import {
  endOfPragueDay,
  startOfPragueDay,
} from "@/lib/leads/followup";
import type { Lead } from "@/lib/leads/types";

type DashLead = Pick<
  Lead,
  | "id"
  | "status"
  | "next_followup_at"
  | "last_contact_at"
  | "followup_count"
  | "followup_paused"
  | "followup_stopped"
  | "salon_name"
  | "name"
  | "city"
  | "email"
  | "phone"
  | "latitude"
  | "longitude"
  | "lead_score"
  | "opportunity_score"
  | "opportunity_grade"
  | "opportunity_summary"
  | "has_website"
  | "google_rating"
  | "google_reviews_count"
  | "instagram_url"
  | "discovery_status"
  | "created_at"
  | "has_online_booking"
>;

function isActiveFollowup(lead: DashLead) {
  return (
    Boolean(lead.next_followup_at) &&
    !lead.followup_paused &&
    !lead.followup_stopped &&
    !["won", "lost", "skip"].includes(lead.status)
  );
}

export default async function AdminDashboardPage() {
  const { supabase, user } = await requireAdmin();

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, status, next_followup_at, last_contact_at, followup_count, followup_paused, followup_stopped, salon_name, name, city, email, phone, latitude, longitude, lead_score, opportunity_score, opportunity_grade, opportunity_summary, has_website, google_rating, google_reviews_count, instagram_url, discovery_status, created_at, has_online_booking",
    )
    .returns<DashLead[]>();

  const rows = leads ?? [];
  const now = new Date();
  const todayStart = startOfPragueDay(now);
  const todayEnd = endOfPragueDay(now);

  const newCount = rows.filter((l) => l.status === "new").length;

  const activeFollowups = rows.filter(isActiveFollowup);
  const overdue = activeFollowups
    .filter(
      (l) =>
        l.next_followup_at &&
        new Date(l.next_followup_at) < todayStart,
    )
    .sort(
      (a, b) =>
        new Date(a.next_followup_at!).getTime() -
        new Date(b.next_followup_at!).getTime(),
    );
  const dueToday = activeFollowups
    .filter((l) => {
      if (!l.next_followup_at) return false;
      const t = new Date(l.next_followup_at).getTime();
      return t >= todayStart.getTime() && t <= todayEnd.getTime();
    })
    .sort(
      (a, b) =>
        new Date(a.next_followup_at!).getTime() -
        new Date(b.next_followup_at!).getTime(),
    );
  const followUpDue = overdue.length + dueToday.length;
  const scheduled = activeFollowups.filter((l) => {
    if (!l.next_followup_at) return false;
    return new Date(l.next_followup_at) > todayEnd;
  }).length;
  const exhausted = rows.filter(
    (l) =>
      (l.followup_count ?? 0) >= 3 &&
      !l.followup_stopped &&
      !["won", "lost", "skip", "interested", "meeting", "proposal"].includes(
        l.status,
      ),
  ).length;

  const inProgress = rows.filter((l) =>
    ["interested", "meeting", "proposal"].includes(l.status),
  ).length;
  const won = rows.filter((l) => l.status === "won").length;

  const newOpportunitiesToday = rows.filter(
    (l) =>
      l.created_at &&
      new Date(l.created_at) >= todayStart &&
      (l.opportunity_score != null || l.discovery_status != null),
  ).length;
  const aGrade = rows.filter((l) => l.opportunity_grade === "A").length;
  const noWebsite = rows.filter((l) => l.has_website === false).length;
  const highRatingBadWeb = rows.filter(
    (l) =>
      (l.google_rating ?? 0) >= 4.7 &&
      (l.google_reviews_count ?? 0) >= 50 &&
      l.has_website === false,
  ).length;

  const { count: needsReview } = await supabase
    .from("lead_discovery_reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const cards = [
    { label: "Nové leady", value: newCount, href: "/admin/leads?status=new" },
    {
      label: "Dnes kontaktovat",
      value: followUpDue,
      href: "/admin/leads?followup=today",
    },
    {
      label: "Po termínu",
      value: overdue.length,
      href: "/admin/leads?followup=overdue",
    },
    {
      label: "Naplánováno",
      value: scheduled,
      href: "/admin/leads?followup=scheduled",
    },
    {
      label: "Bez odpovědi po 3 FU",
      value: exhausted,
      href: "/admin/leads?followup=exhausted",
    },
    {
      label: "Rozjednané",
      value: inProgress,
      href: "/admin/leads?pipeline=1",
    },
    { label: "Vyhráno", value: won, href: "/admin/leads?status=won" },
  ];

  const opportunityCards = [
    {
      label: "New opportunities today",
      value: newOpportunitiesToday,
      href: "/admin/leads?sort=opportunity_desc",
    },
    {
      label: "A-grade leads",
      value: aGrade,
      href: "/admin/leads?opp_grade=A",
    },
    {
      label: "Leads without website",
      value: noWebsite,
      href: "/admin/leads?has_website=no",
    },
    {
      label: "High rating / bad website",
      value: highRatingBadWeb,
      href: "/admin/leads?quick=high_rating_no_web",
    },
    {
      label: "Needs review",
      value: needsReview ?? 0,
      href: "/admin/leads/discovery",
    },
  ];

  const topOpportunities = [...rows]
    .filter((l) => l.opportunity_score != null)
    .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0))
    .slice(0, 5);

  return (
    <AdminShell email={user.email}>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
        Dashboard
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border border-line bg-foam p-5 transition hover:border-ink/30"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
              {card.label}
            </p>
            <p className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <TodayFollowupsSection
        overdue={overdue as Lead[]}
        dueToday={dueToday as Lead[]}
      />

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl">
            Nové příležitosti
          </h2>
          <Link
            href="/admin/leads/discovery"
            className="text-sm text-copper hover:underline"
          >
            Otevřít Discovery →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {opportunityCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="border border-line bg-foam p-4 transition hover:border-ink/30"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                {card.label}
              </p>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">
                {card.value}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            TOP opportunities
          </h3>
          {topOpportunities.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Zatím žádné opportunity skóre — spusť Discovery.
            </p>
          ) : (
            topOpportunities.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex flex-wrap items-center justify-between gap-3 border border-line bg-foam p-4 transition hover:border-ink/30"
              >
                <div>
                  <p className="font-medium">
                    {lead.salon_name || lead.name}
                    {lead.opportunity_grade === "A" ? (
                      <span className="ml-2 text-xs text-copper-deep">
                        Hot opportunity
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {lead.opportunity_summary || lead.city || "—"}
                  </p>
                </div>
                <p className="font-[family-name:var(--font-fraunces)] text-2xl">
                  {lead.opportunity_score}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="mt-10">
        <LeadsMap leads={rows} />
      </div>
    </AdminShell>
  );
}
