import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadsMap } from "@/components/admin/LeadsMap";
import { TodayFollowupsSection } from "@/components/admin/TodayFollowupsSection";
import {
  AdminEmpty,
  AdminLinkButton,
  AdminMetricCard,
  AdminPageHeader,
  AdminSection,
} from "@/components/admin/ui";
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

  const inProgress = rows.filter((l) =>
    ["interested", "meeting", "proposal"].includes(l.status),
  ).length;
  const aGrade = rows.filter((l) => l.opportunity_grade === "A").length;

  const { count: needsReview } = await supabase
    .from("lead_discovery_reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const metrics = [
    { label: "Nové", value: newCount, href: "/admin/leads?status=new" },
    {
      label: "Dnes kontaktovat",
      value: followUpDue,
      href: "/admin/leads?followup=today",
    },
    {
      label: "Rozjednané",
      value: inProgress,
      href: "/admin/leads?pipeline=1",
    },
    {
      label: "A-grade",
      value: aGrade,
      href: "/admin/leads?opp_grade=A",
    },
    {
      label: "K review",
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
      <AdminPageHeader
        eyebrow="Přehled"
        title="Dashboard"
        description="Co je dnes důležité — follow-upy, nové leady a nejlepší příležitosti."
        actions={
          <>
            <AdminLinkButton href="/admin/leads" variant="secondary">
              Všechny leady
            </AdminLinkButton>
            <AdminLinkButton href="/admin/leads/new">
              Nový outbound
            </AdminLinkButton>
          </>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((card) => (
          <AdminMetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            href={card.href}
          />
        ))}
      </div>

      <TodayFollowupsSection
        overdue={overdue as Lead[]}
        dueToday={dueToday as Lead[]}
      />

      <AdminSection
        title="Nejlepší příležitosti"
        description="Top opportunity skóre z discovery a inboundu."
        action={
          <Link
            href="/admin/leads/discovery"
            className="text-sm font-medium text-copper hover:underline"
          >
            Discovery →
          </Link>
        }
      >
        {topOpportunities.length === 0 ? (
          <AdminEmpty>
            Zatím žádné opportunity skóre — spusť Discovery.
          </AdminEmpty>
        ) : (
          <div className="grid gap-2.5">
            {topOpportunities.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-foam px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
              >
                <div>
                  <p className="font-medium tracking-tight text-ink">
                    {lead.salon_name || lead.name}
                    {lead.opportunity_grade === "A" ? (
                      <span className="ml-2 text-[11px] font-medium text-copper">
                        A-grade
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {lead.opportunity_summary || lead.city || "—"}
                  </p>
                </div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {lead.opportunity_score}
                </p>
              </Link>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection title="Mapa leadů" description="Kde máte pokrytí.">
        <LeadsMap leads={rows} />
      </AdminSection>
    </AdminShell>
  );
}
