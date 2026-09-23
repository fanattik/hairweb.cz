import { AdminShell } from "@/components/admin/AdminShell";
import { DiscoverySettingsForm } from "@/components/admin/discovery/DiscoverySettingsForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { getDiscoverySettings } from "@/lib/discovery/budget";

export default async function AdminSettingsPage() {
  const { supabase, user } = await requireAdmin();
  const settings = await getDiscoverySettings(supabase);

  return (
    <AdminShell email={user.email}>
      <AdminPageHeader
        eyebrow="Admin"
        title="Nastavení"
        description="Lead Discovery a limity Google Places API."
      />
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
