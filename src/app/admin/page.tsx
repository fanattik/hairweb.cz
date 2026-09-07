import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadsMap } from "@/components/admin/LeadsMap";
import { requireAdmin } from "@/lib/admin/auth";
import type { Lead } from "@/lib/leads/types";

export default async function AdminDashboardPage() {
  const { supabase, user } = await requireAdmin();

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, status, next_followup_at, salon_name, name, city, latitude, longitude, lead_score",
    )
    .returns<
      Pick<
        Lead,
        | "id"
        | "status"
        | "next_followup_at"
        | "salon_name"
        | "name"
        | "city"
        | "latitude"
        | "longitude"
        | "lead_score"
      >[]
    >();

  const rows = leads ?? [];
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const newCount = rows.filter((l) => l.status === "new").length;
  const followUpDue = rows.filter(
    (l) =>
      l.next_followup_at &&
      new Date(l.next_followup_at) <= endOfToday &&
      !["won", "lost", "skip"].includes(l.status),
  ).length;
  const inProgress = rows.filter((l) =>
    ["interested", "meeting", "proposal"].includes(l.status),
  ).length;
  const won = rows.filter((l) => l.status === "won").length;

  const cards = [
    { label: "Nové leady", value: newCount, href: "/admin/leads?status=new" },
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
    { label: "Vyhráno", value: won, href: "/admin/leads?status=won" },
  ];

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

      <div className="mt-8">
        <LeadsMap leads={rows} />
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/leads"
          className="bg-ink px-4 py-2.5 text-sm text-foam transition hover:bg-ink-soft"
        >
          Zobrazit leady
        </Link>
        <Link
          href="/admin/leads/new"
          className="border border-line px-4 py-2.5 text-sm transition hover:border-ink"
        >
          Nový outbound
        </Link>
      </div>
    </AdminShell>
  );
}
