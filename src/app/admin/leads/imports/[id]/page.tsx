import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminCard,
  AdminLinkButton,
  AdminPageHeader,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

const thClass =
  "px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase";

export default async function AdminLeadImportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin();

  const { data: session } = await supabase
    .from("lead_imports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!session) notFound();

  const { data: items } = await supabase
    .from("lead_import_items")
    .select("id, row_number, status, match_reason, action, error, lead_id, raw_data")
    .eq("import_id", id)
    .order("row_number", { ascending: true })
    .limit(2000);

  return (
    <AdminShell email={user.email}>
      <Link
        href="/admin/leads/imports"
        className="text-sm text-copper hover:underline"
      >
        ← Historie importů
      </Link>
      <div className="mt-3">
        <AdminPageHeader
          eyebrow="Import"
          title={session.source_name || session.file_name || "Import"}
          description={`${new Date(session.created_at).toLocaleString("cs-CZ")} · ${session.import_method} · ${session.source_type || "—"} · ${session.status}`}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {[
          ["Řádků", session.total_rows],
          ["Nových", session.new_count],
          ["Aktualizovaných", session.updated_count],
          ["Přeskočeno", session.skipped_count],
          ["Chyb", session.invalid_count],
        ].map(([label, value]) => (
          <AdminCard key={String(label)} padding="sm">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {value as number}
            </p>
          </AdminCard>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <AdminLinkButton href={`/admin/leads?import_id=${id}`}>
          Zobrazit leady z importu
        </AdminLinkButton>
        <AdminLinkButton
          href={`/admin/leads?import_id=${id}&grade=A`}
          variant="secondary"
        >
          Jen grade A
        </AdminLinkButton>
      </div>

      <AdminCard padding="none" className="mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10">
              <th className={thClass}>Řádek</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Akce</th>
              <th className={thClass}>Match</th>
              <th className={thClass}>Lead</th>
              <th className={thClass}>Chyba</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item) => (
              <tr key={item.id} className="border-b border-ink/6">
                <td className="px-3 py-2">{item.row_number}</td>
                <td className="px-3 py-2 text-xs uppercase tracking-wide">
                  {item.status}
                </td>
                <td className="px-3 py-2">{item.action || "—"}</td>
                <td className="px-3 py-2 text-ink-soft">
                  {item.match_reason || "—"}
                </td>
                <td className="px-3 py-2">
                  {item.lead_id ? (
                    <Link
                      href={`/admin/leads/${item.lead_id}`}
                      className="text-copper hover:underline"
                    >
                      Otevřít
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-copper-deep">
                  {item.error || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </AdminShell>
  );
}
