import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import type { Lead, LeadPackage, LeadStatus, LeadType } from "@/lib/leads/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase, user } = await requireAdmin();
  const params = await searchParams;

  const status = first(params.status);
  const type = first(params.type);
  const pkg = first(params.package);
  const q = first(params.q)?.trim();
  const campaign = first(params.campaign)?.trim();
  const followup = first(params.followup);
  const pipeline = first(params.pipeline);

  let query = supabase.from("leads").select("*").order("created_at", {
    ascending: false,
  });

  if (status) query = query.eq("status", status);
  if (type) query = query.eq("type", type);
  if (pkg) query = query.eq("package", pkg);
  if (campaign) query = query.eq("utm_campaign", campaign);
  if (pipeline === "1") {
    query = query.in("status", ["interested", "meeting", "proposal"]);
  }
  if (followup === "today") {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    query = query
      .lte("next_followup_at", end.toISOString())
      .not("status", "in", "(won,lost)");
  }
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,salon_name.ilike.%${q}%,email.ilike.%${q}%,website.ilike.%${q}%`,
    );
  }

  const { data, error } = await query.returns<Lead[]>();
  if (error) {
    console.error("[admin] leads list", error);
  }
  const leads = data ?? [];

  return (
    <AdminShell email={user.email}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
            Leady
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{leads.length} záznamů</p>
        </div>
        <Link
          href="/admin/leads/new"
          className="bg-ink px-4 py-2.5 text-sm text-foam hover:bg-ink-soft"
        >
          Nový outbound
        </Link>
      </div>

      <form className="mt-6 grid gap-3 border border-line bg-foam p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Hledat jméno / salon / e-mail / web"
          className="border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-copper lg:col-span-2"
        />
        <select
          name="status"
          defaultValue={status}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Status</option>
          {(
            [
              "new",
              "contacted",
              "interested",
              "meeting",
              "proposal",
              "won",
              "lost",
            ] as LeadStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={type}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Type</option>
          {(["inbound", "outbound"] as LeadType[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          name="package"
          defaultValue={pkg}
          className="border border-line bg-mist px-3 py-2 text-sm"
        >
          <option value="">Balíček</option>
          {(["start", "pro"] as LeadPackage[]).map((p) => (
            <option key={p} value={p}>
              {p.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          name="campaign"
          defaultValue={campaign}
          placeholder="UTM campaign"
          className="border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-copper"
        />
        <button
          type="submit"
          className="bg-copper px-4 py-2 text-sm text-foam hover:bg-copper-deep sm:col-span-2 lg:col-span-1"
        >
          Filtrovat
        </button>
      </form>

      <div className="mt-6 overflow-x-auto border border-line bg-foam">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-3 py-3">Datum</th>
              <th className="px-3 py-3">Jméno</th>
              <th className="px-3 py-3">Salon</th>
              <th className="px-3 py-3">Web</th>
              <th className="px-3 py-3">Typ</th>
              <th className="px-3 py-3">Balíček</th>
              <th className="px-3 py-3">Zdroj</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-line/70 hover:bg-mist/60">
                <td className="px-3 py-3 whitespace-nowrap">
                  <Link href={`/admin/leads/${lead.id}`} className="underline-offset-2 hover:underline">
                    {formatDate(lead.created_at)}
                  </Link>
                </td>
                <td className="px-3 py-3">{lead.name}</td>
                <td className="px-3 py-3">{lead.salon_name || "—"}</td>
                <td className="max-w-[10rem] truncate px-3 py-3">
                  {lead.website}
                </td>
                <td className="px-3 py-3">{lead.type}</td>
                <td className="px-3 py-3">
                  {lead.package ? lead.package.toUpperCase() : "—"}
                </td>
                <td className="px-3 py-3">{lead.source_detail || lead.source || "—"}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {formatDate(lead.next_followup_at)}
                </td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-ink-soft">
                  Žádné leady.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
