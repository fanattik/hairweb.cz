"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DISCOVERY_BUSINESS_TYPES } from "@/lib/discovery/business-types";
import type { DiscoverySchedule } from "@/lib/discovery/types";

const field =
  "border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-copper w-full";

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
    <form onSubmit={onSubmit} className="border border-line bg-foam p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Nové vyhledávání
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Název jobu</span>
          <input
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Praha – Hair salons"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Město</span>
          <input
            className={field}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="Praha"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Kraj</span>
          <input
            className={field}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Hlavní město Praha"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Radius (m)</span>
          <input
            type="number"
            min={500}
            max={50000}
            className={field}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Max výsledků</span>
          <input
            type="number"
            min={1}
            max={60}
            className={field}
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
          />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Schedule</span>
          <select
            className={field}
            value={schedule}
            onChange={(e) =>
              setSchedule(e.target.value as DiscoverySchedule)
            }
          >
            <option value="manual">Manuálně</option>
            <option value="daily">Denně</option>
            <option value="weekly">Týdně</option>
            <option value="monthly">Měsíčně</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium">Typ firmy</p>
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_BUSINESS_TYPES.map((type) => {
              const active = types.includes(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleType(type.id)}
                  className={`border px-3 py-1.5 text-xs ${
                    active
                      ? "border-ink bg-ink text-foam"
                      : "border-line bg-mist text-ink"
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
      <button
        type="submit"
        disabled={loading || types.length === 0}
        className="mt-4 bg-ink px-4 py-2.5 text-sm text-foam hover:bg-ink-soft disabled:opacity-60"
      >
        {loading ? "Ukládám…" : "Vytvořit discovery job"}
      </button>
    </form>
  );
}
