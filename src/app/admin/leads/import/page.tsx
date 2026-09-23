import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadImportWizard } from "@/components/admin/import/LeadImportWizard";
import { AdminLinkButton, AdminPageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminLeadImportPage() {
  const { user } = await requireAdmin();

  return (
    <AdminShell email={user.email}>
      <Link
        href="/admin/leads"
        className="text-sm text-copper hover:underline"
      >
        ← Zpět na leady
      </Link>
      <div className="mb-6 mt-2">
        <AdminPageHeader
          eyebrow="CRM"
          title="Importovat leady"
          description="CSV / XLSX / copy-paste · mapování · deduplikace · scoring"
          actions={
            <AdminLinkButton href="/admin/leads/imports" variant="secondary">
              Historie importů
            </AdminLinkButton>
          }
        />
      </div>
      <LeadImportWizard />
    </AdminShell>
  );
}
