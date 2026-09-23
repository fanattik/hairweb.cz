"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminSelect,
} from "@/components/admin/ui";
import { DISCOVERY_BUSINESS_TYPES } from "@/lib/discovery/business-types";
import type { DiscoverySchedule } from "@/lib/discovery/types";

const eyebrow =
  "font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase";

export function DiscoveryJobForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [radius, setRadius] = useState(15000);
  const [maxResults, setMaxResults] = useState(20);
  const [schedule, setSchedule] = useState<DiscoverySchedule>("manual");
  const [types, setTypes] = useState<string[]>(["hair_salon"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleType(id: string) {
    setTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/discovery/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || `${city || "Lokalita"} – discovery`,
        city: city || null,
        region: region || null,
        location_query: [city, region].filter(Boolean).join(", ") || null,
        radius_m: radius,
        max_results: maxResults,
        business_types: types,
        schedule,
        provider: "google_places",
      }),
    });

    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Uložení se nepovedlo.");
      return;
    }

    setName("");
    setCity("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <AdminCard>
        <h2 className={eyebrow}>Nové vyhledávání</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm sm:col-span-2">
            <AdminLabel>Název jobu</AdminLabel>
            <AdminInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Praha – Hair salons"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <AdminLabel>Město</AdminLabel>
            <AdminInput
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="Praha"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <AdminLabel>Kraj</AdminLabel>
            <AdminInput
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Hlavní město Praha"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <AdminLabel>Radius (m)</AdminLabel>
            <AdminInput
              type="number"
              min={500}
              max={50000}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <AdminLabel>Max výsledků</AdminLabel>
            <AdminInput
              type="number"
              min={1}
              max={60}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
            />
          </label>
          <label className="grid gap-1.5 text-sm sm:col-span-2">
            <AdminLabel>Schedule</AdminLabel>
            <AdminSelect
              value={schedule}
              onChange={(e) =>
                setSchedule(e.target.value as DiscoverySchedule)
              }
            >
              <option value="manual">Manuálně</option>
              <option value="daily">Denně</option>
              <option value="weekly">Týdně</option>
              <option value="monthly">Měsíčně</option>
            </AdminSelect>
          </label>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-ink">Typ firmy</p>
            <div className="flex flex-wrap gap-2">
              {DISCOVERY_BUSINESS_TYPES.map((type) => {
                const active = types.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleType(type.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium tracking-tight transition ${
                      active
                        ? "bg-ink text-foam"
                        : "bg-mist text-ink-soft hover:bg-stone hover:text-ink"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-copper-deep">{error}</p>
        ) : null}
        <AdminButton
          type="submit"
          disabled={loading || types.length === 0}
          className="mt-4"
        >
          {loading ? "Ukládám…" : "Vytvořit discovery job"}
        </AdminButton>
      </AdminCard>
    </form>
  );
}
