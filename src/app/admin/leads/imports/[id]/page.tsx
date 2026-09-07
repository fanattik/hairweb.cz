import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";

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
      <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
        {session.source_name || session.file_name || "Import"}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {new Date(session.created_at).toLocaleString("cs-CZ")} ·{" "}
        {session.import_method} · {session.source_type || "—"} ·{" "}
        {session.status}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {[
          ["Řádků", session.total_rows],
          ["Nových", session.new_count],
          ["Aktualizovaných", session.updated_count],
          ["Přeskočeno", session.skipped_count],
          ["Chyb", session.invalid_count],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-line bg-foam p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              {label}
            </p>
            <p className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl">
              {value as number}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/admin/leads?import_id=${id}`}
          className="bg-ink px-4 py-2 text-sm text-foam"
        >
          Zobrazit leady z importu
        </Link>
        <Link
          href={`/admin/leads?import_id=${id}&grade=A`}
          className="border border-line px-4 py-2 text-sm"
        >
          Jen grade A
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto border border-line bg-foam">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-3 py-2">Řádek</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Akce</th>
              <th className="px-3 py-2">Match</th>
              <th className="px-3 py-2">Lead</th>
              <th className="px-3 py-2">Chyba</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item) => (
              <tr key={item.id} className="border-b border-line/50">
                <td className="px-3 py-2">{item.row_number}</td>
                <td className="px-3 py-2 uppercase tracking-wide text-xs">
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
      </div>
    </AdminShell>
  );
}
