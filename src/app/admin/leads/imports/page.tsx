import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminCard,
  AdminEmpty,
  AdminLinkButton,
  AdminPageHeader,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

type ImportRow = {
  id: string;
  created_at: string;
  file_name: string | null;
  import_method: string;
  source_type: string | null;
  source_name: string | null;
  total_rows: number;
  new_count: number;
  updated_count: number;
  skipped_count: number;
  invalid_count: number;
  status: string;
};

const thClass =
  "px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase";

export default async function AdminLeadImportsPage() {
  const { supabase, user } = await requireAdmin();

  const { data, error } = await supabase
    .from("lead_imports")
    .select(
      "id, created_at, file_name, import_method, source_type, source_name, total_rows, new_count, updated_count, skipped_count, invalid_count, status",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) console.error("[admin] imports list", error);
  const rows = (data || []) as ImportRow[];

  return (
    <AdminShell email={user.email}>
      <Link href="/admin/leads" className="text-sm text-copper hover:underline">
        ← Leady
      </Link>
      <div className="mt-2">
        <AdminPageHeader
          eyebrow="CRM"
          title="Importy"
          actions={
            <AdminLinkButton href="/admin/leads/import">Nový import</AdminLinkButton>
          }
        />
      </div>

      {rows.length === 0 ? (
        <div className="mt-6">
          <AdminEmpty>
            Zatím žádné importy. Spusť první přes „Importovat leady“.
          </AdminEmpty>
        </div>
      ) : (
        <AdminCard padding="none" className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                <th className={thClass}>Datum</th>
                <th className={thClass}>Soubor / název</th>
                <th className={thClass}>Zdroj</th>
                <th className={thClass}>Řádků</th>
                <th className={thClass}>Nových</th>
                <th className={thClass}>Upd.</th>
                <th className={thClass}>Dup.</th>
                <th className={thClass}>Chyb</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-ink/6 hover:bg-mist/80">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/imports/${row.id}`}
                      className="hover:underline"
                    >
                      {new Date(row.created_at).toLocaleString("cs-CZ")}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {row.source_name || row.file_name || row.import_method}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {row.source_type || "—"}
                  </td>
                  <td className="px-4 py-3">{row.total_rows}</td>
                  <td className="px-4 py-3">{row.new_count}</td>
                  <td className="px-4 py-3">{row.updated_count}</td>
                  <td className="px-4 py-3">{row.skipped_count}</td>
                  <td className="px-4 py-3">{row.invalid_count}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wide">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      )}
    </AdminShell>
  );
}
