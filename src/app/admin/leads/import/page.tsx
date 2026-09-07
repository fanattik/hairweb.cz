import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadImportWizard } from "@/components/admin/import/LeadImportWizard";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminLeadImportPage() {
  const { user } = await requireAdmin();

  return (
    <AdminShell email={user.email}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/leads"
            className="text-sm text-copper hover:underline"
          >
            ← Zpět na leady
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
            Importovat leady
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            CSV / XLSX / copy-paste · mapování · deduplikace · scoring
          </p>
        </div>
        <Link
          href="/admin/leads/imports"
          className="border border-line px-4 py-2 text-sm hover:border-ink"
        >
          Historie importů
        </Link>
      </div>
      <LeadImportWizard />
    </AdminShell>
  );
}
