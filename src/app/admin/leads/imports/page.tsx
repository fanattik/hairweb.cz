import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/leads" className="text-sm text-copper hover:underline">
            ← Leady
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
            Importy
          </h1>
        </div>
        <Link
          href="/admin/leads/import"
          className="bg-ink px-4 py-2.5 text-sm text-foam"
        >
          Nový import
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-foam">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Soubor / název</th>
              <th className="px-4 py-3">Zdroj</th>
              <th className="px-4 py-3">Řádků</th>
              <th className="px-4 py-3">Nových</th>
              <th className="px-4 py-3">Upd.</th>
              <th className="px-4 py-3">Dup.</th>
              <th className="px-4 py-3">Chyb</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-ink-soft">
                  Zatím žádné importy. Spusť první přes „Importovat leady“.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-line/60 hover:bg-mist">
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
                  <td className="px-4 py-3 uppercase tracking-wide text-xs">
                    {row.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
