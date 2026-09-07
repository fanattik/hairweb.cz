"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { LeadStatus } from "@/lib/leads/types";
import { STATUS_LABELS } from "@/lib/leads/types";

export type MapLead = {
  id: string;
  status: LeadStatus;
  salon_name: string | null;
  name: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  lead_score: number | null;
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "#9a5b3c",
  contacted: "#8a847c",
  interested: "#1a1714",
  meeting: "#1a1714",
  proposal: "#9a5b3c",
  won: "#066e3c",
  lost: "#6b6560",
};

type Props = {
  leads: MapLead[];
};

export function LeadsMap({ leads }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapLeads = useMemo(
    () =>
      leads.filter(
        (lead) =>
          lead.latitude != null &&
          lead.longitude != null &&
          Number.isFinite(lead.latitude) &&
          Number.isFinite(lead.longitude),
      ),
    [leads],
  );

  useEffect(() => {
    if (!containerRef.current || mapLeads.length === 0) return;

    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    async function init() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      // Fix default icon paths for bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 18,
      }).addTo(map);

      const bounds = L.latLngBounds([]);

      for (const lead of mapLeads) {
        const color = STATUS_COLORS[lead.status];
        const title = lead.salon_name || lead.name;
        const icon = L.divIcon({
          className: "",
          html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
            <span style="background:${color};color:#fff;font:600 10px/1 system-ui,sans-serif;padding:4px 6px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25)">${STATUS_LABELS[lead.status]}</span>
            <span style="width:10px;height:10px;border-radius:999px;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></span>
          </div>`,
          iconSize: [72, 36],
          iconAnchor: [36, 36],
          popupAnchor: [0, -28],
        });

        const marker = L.marker([lead.latitude!, lead.longitude!], { icon }).addTo(
          map!,
        );
        marker.bindPopup(
          `<strong>${title}</strong><br/>${lead.city || "—"}<br/>${STATUS_LABELS[lead.status]}${
            lead.lead_score != null ? ` · Score ${lead.lead_score}` : ""
          }<br/><a href="/admin/leads/${lead.id}">Otevřít</a>`,
        );
        bounds.extend([lead.latitude!, lead.longitude!]);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.25));
      } else {
        map.setView([49.8, 15.5], 7);
      }
    }

    void init();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [mapLeads]);

  const missing = leads.length - mapLeads.length;

  return (
    <section className="border border-line bg-foam">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl tracking-tight">
            Mapa leadů
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {mapLeads.length} s polohou
            {missing > 0 ? ` · ${missing} bez GPS (spusť Analyzovat)` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_COLORS) as LeadStatus[]).map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-ink-soft"
            >
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ background: STATUS_COLORS[status] }}
              />
              {STATUS_LABELS[status]}
            </span>
          ))}
        </div>
      </div>

      {mapLeads.length === 0 ? (
        <div className="px-5 py-10 text-sm text-ink-soft">
          Zatím žádné leady s GPS. U leadu spusť{" "}
          <strong className="text-ink">Analyzovat</strong> (Google Places /
          město) — poloha se uloží automaticky.
          <div className="mt-3">
            <Link href="/admin/leads" className="text-copper hover:underline">
              Přejít na leady →
            </Link>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="h-[420px] w-full" />
      )}
    </section>
  );
}
