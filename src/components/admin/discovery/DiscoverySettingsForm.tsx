"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
} from "@/components/admin/ui";
import type { LeadDiscoverySettings } from "@/lib/discovery/types";

const eyebrow =
  "font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase";

export function DiscoverySettingsForm({
  settings,
  googlePlacesConfigured,
}: {
  settings: LeadDiscoverySettings;
  googlePlacesConfigured: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/admin/discovery/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        automatic_discovery: state.automatic_discovery,
        default_radius_m: state.default_radius_m,
        default_max_results: state.default_max_results,
        daily_api_limit: state.daily_api_limit,
        monthly_budget_limit: state.monthly_budget_limit,
        ai_enrichment_enabled: state.ai_enrichment_enabled,
        website_audit_enabled: state.website_audit_enabled,
        google_places_enabled: state.google_places_enabled,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setMessage("Uložení se nepovedlo.");
      return;
    }
    setMessage("Uloženo.");
    router.refresh();
  }

  return (
    <form onSubmit={onSave}>
      <AdminCard>
        <h2 className={eyebrow}>Lead Discovery</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Google Places API Key:{" "}
          {googlePlacesConfigured ? (
            <span className="text-ink">nastavený v env (GOOGLE_PLACES_API_KEY)</span>
          ) : (
            <span className="text-copper-deep">chybí — doplň v Vercel / .env</span>
          )}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={state.automatic_discovery}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  automatic_discovery: e.target.checked,
                }))
              }
            />
            Automatic Discovery ON
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={state.google_places_enabled}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  google_places_enabled: e.target.checked,
                }))
              }
            />
            Google Places provider
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.website_audit_enabled}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  website_audit_enabled: e.target.checked,
                }))
              }
            />
            Website audit (Phase 2)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.ai_enrichment_enabled}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  ai_enrichment_enabled: e.target.checked,
                }))
              }
            />
            AI enrichment (Phase 2)
          </label>
          <label className="grid gap-1.5 text-sm">
            <AdminLabel>Default radius (m)</AdminLabel>
            <AdminInput
              type="number"
              value={state.default_radius_m}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  default_radius_m: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <AdminLabel>Default max results</AdminLabel>
            <AdminInput
              type="number"
              value={state.default_max_results}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  default_max_results: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <AdminLabel>Daily API limit</AdminLabel>
            <AdminInput
              type="number"
              value={state.daily_api_limit}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  daily_api_limit: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <AdminLabel>Monthly budget limit (units)</AdminLabel>
            <AdminInput
              type="number"
              value={state.monthly_budget_limit ?? ""}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  monthly_budget_limit:
                    e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </label>
        </div>

        <AdminButton type="submit" disabled={saving} className="mt-4">
          {saving ? "Ukládám…" : "Uložit nastavení"}
        </AdminButton>
        {message ? (
          <p className="mt-2 text-sm text-ink-soft">{message}</p>
        ) : null}
      </AdminCard>
    </form>
  );
}
