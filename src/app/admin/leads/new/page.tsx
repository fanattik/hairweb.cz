import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { OutboundLeadForm } from "@/components/admin/OutboundLeadForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewOutboundLeadPage() {
  const { user } = await requireAdmin();

  return (
    <AdminShell email={user.email}>
      <Link href="/admin/leads" className="text-sm text-copper hover:underline">
        ← Zpět
      </Link>
      <div className="mt-3">
        <AdminPageHeader
          eyebrow="CRM"
          title="Nový outbound lead"
          description="Manuální prospect. Type = outbound, status = new."
        />
      </div>
      <div className="mt-8">
        <OutboundLeadForm />
      </div>
    </AdminShell>
  );
}
