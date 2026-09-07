import { AdminShell } from "@/components/admin/AdminShell";
import { DiscoverySettingsForm } from "@/components/admin/discovery/DiscoverySettingsForm";
import { requireAdmin } from "@/lib/admin/auth";
import { getDiscoverySettings } from "@/lib/discovery/budget";

export default async function AdminSettingsPage() {
  const { supabase, user } = await requireAdmin();
  const settings = await getDiscoverySettings(supabase);

  return (
    <AdminShell email={user.email}>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
        Nastavení
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Lead Discovery a limity Google Places API.
      </p>
      <div className="mt-8 max-w-2xl">
        <DiscoverySettingsForm
          settings={settings}
          googlePlacesConfigured={Boolean(
            process.env.GOOGLE_PLACES_API_KEY?.trim(),
          )}
        />
      </div>
      <p className="mt-6 max-w-2xl text-xs text-ink-soft">
        Cron endpoint: <code>GET /api/admin/discovery/cron</code> s hlavičkou{" "}
        <code>Authorization: Bearer $CRON_SECRET</code>. Schedule jobů běží jen
        když je Automatic Discovery zapnuté.
      </p>
    </AdminShell>
  );
}
