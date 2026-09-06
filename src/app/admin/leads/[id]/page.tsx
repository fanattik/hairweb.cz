import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadCrmForm } from "@/components/admin/LeadCrmForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import type { Lead } from "@/lib/leads/types";

function isInstagram(value: string) {
  return /instagram\.com/i.test(value) || value.trim().startsWith("@");
}

function externalHref(value: string) {
  if (value.startsWith("@")) {
    return `https://instagram.com/${value.slice(1)}`;
  }
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("[admin] lead detail", error);
  if (!data) notFound();

  const lead = data as Lead;

  return (
    <AdminShell email={user.email}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/leads" className="text-sm text-copper hover:underline">
            ← Zpět na leady
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
            {lead.name}
          </h1>
          <div className="mt-2">
            <StatusBadge status={lead.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <a
            href={`mailto:${lead.email}`}
            className="border border-line px-3 py-2 hover:border-ink"
          >
            E-mail
          </a>
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              className="border border-line px-3 py-2 hover:border-ink"
            >
              Telefon
            </a>
          ) : null}
          <a
            href={externalHref(lead.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-line px-3 py-2 hover:border-ink"
          >
            Otevřít web
          </a>
          {isInstagram(lead.website) ? (
            <a
              href={externalHref(lead.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-line px-3 py-2 hover:border-ink"
            >
              Instagram
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-foam p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Kontakt
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-ink-soft">Jméno</dt>
              <dd>{lead.name}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Salon</dt>
              <dd>{lead.salon_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">E-mail</dt>
              <dd>{lead.email}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Telefon</dt>
              <dd>{lead.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Web</dt>
              <dd className="break-all">{lead.website}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-line bg-foam p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Poptávka
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-ink-soft">Balíček</dt>
              <dd>{lead.package ? lead.package.toUpperCase() : "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Vytvořeno</dt>
              <dd>{new Date(lead.created_at).toLocaleString("cs-CZ")}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Zpráva</dt>
              <dd className="whitespace-pre-wrap">{lead.message || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-line bg-foam p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Acquisition
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-ink-soft">Type</dt>
              <dd>{lead.type}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Source</dt>
              <dd>{lead.source || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Source detail</dt>
              <dd>{lead.source_detail || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">UTM</dt>
              <dd>
                {[lead.utm_source, lead.utm_medium, lead.utm_campaign]
                  .filter(Boolean)
                  .join(" / ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">Referrer</dt>
              <dd className="break-all">{lead.referrer || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Landing page</dt>
              <dd className="break-all">{lead.landing_page || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-line bg-foam p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            CRM
          </h2>
          <LeadCrmForm lead={lead} />
        </section>
      </div>
    </AdminShell>
  );
}
