import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { OutboundLeadForm } from "@/components/admin/OutboundLeadForm";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewOutboundLeadPage() {
  const { user } = await requireAdmin();

  return (
    <AdminShell email={user.email}>
      <Link href="/admin/leads" className="text-sm text-copper hover:underline">
        ← Zpět
      </Link>
      <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
        Nový outbound lead
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Manuální prospect. Type = outbound, status = new.
      </p>
      <div className="mt-8">
        <OutboundLeadForm />
      </div>
    </AdminShell>
  );
}
