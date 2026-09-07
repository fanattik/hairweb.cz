"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/leads/types";
import type { MergedWebAuditScores } from "@/lib/web-audit/apply";

type PreviewPayload = {
  url: string;
  finalUrl: string;
  scores: MergedWebAuditScores;
  lighthouse: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    lcpMs: number | null;
    error: string | null;
  };
  aiSource: "ai" | "heuristic";
  warnings: string[];
};

type Props = {
  lead: Lead;
};

export function WebAuditButton({ lead }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"preview" | "apply" | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);

  const canRun = Boolean(lead.website?.trim() && lead.website.trim() !== "—");

  async function runPreview() {
    if (!canRun) return;
    setLoading("preview");
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/leads/enrich-web-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website: lead.website }),
    });

    const data = (await response.json()) as PreviewPayload & { error?: string };
    setLoading(null);

    if (!response.ok) {
      setError(data.error || "Web audit se nepovedl.");
      setPreview(null);
      return;
    }

    setPreview(data);
    setMessage(
      `Náhled hotov (${data.aiSource === "ai" ? "AI" : "heuristiky"})` +
        (data.lighthouse.performance != null
          ? ` · PSI ${data.lighthouse.performance}`
          : ""),
    );
  }

  async function applyAudit() {
    setLoading("apply");
    setError(null);

    const response = await fetch(
      `/api/admin/leads/${lead.id}/enrich-web-audit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: lead.website,
          overwrite,
        }),
      },
    );

    const data = (await response.json()) as {
      error?: string;
      scores?: { lead_score?: number | null };
      aiSource?: string;
      warnings?: string[];
    };

    setLoading(null);

    if (!response.ok) {
      setError(data.error || "Uložení auditu se nepovedlo.");
      return;
    }

    setPreview(null);
    setMessage(
      `Web audit uložen` +
        (data.aiSource === "ai" ? " (AI)" : " (heuristiky)") +
        (data.scores?.lead_score != null
          ? ` · Lead Score ${data.scores.lead_score}`
          : ""),
    );
    router.refresh();
  }

  return (
    <div className="border border-line bg-mist p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Web audit
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            PageSpeed + AI skóre (design, CTA, content…)
            {lead.website ? ` · ${lead.website}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading !== null || !canRun}
            onClick={runPreview}
            className="border border-ink px-4 py-2 text-sm text-ink hover:bg-foam disabled:opacity-60"
          >
            {loading === "preview" ? "Analyzuji…" : "Náhled auditu"}
          </button>
          <button
            type="button"
            disabled={loading !== null || !canRun}
            onClick={applyAudit}
            className="bg-ink px-4 py-2 text-sm text-foam hover:bg-ink-soft disabled:opacity-60"
          >
            {loading === "apply" ? "Ukládám…" : "Spustit web audit"}
          </button>
        </div>
      </div>

      {!canRun ? (
        <p className="mt-2 text-xs text-ink-soft">
          Nejdřív vyplň website URL v editoru níže.
        </p>
      ) : null}

      <label className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
        <input
          type="checkbox"
          checked={overwrite}
          onChange={(e) => setOverwrite(e.target.checked)}
        />
        Přepsat opportunity note a booking flag
      </label>

      {preview ? (
        <div className="mt-3 space-y-2 border border-line bg-foam p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Náhled · {preview.finalUrl}
          </p>
          <p className="text-xs text-ink-soft">
            Design {preview.scores.website_design_score} · Mobile{" "}
            {preview.scores.website_mobile_score} · CTA{" "}
            {preview.scores.website_cta_score} · Content{" "}
            {preview.scores.website_content_score} · Trust{" "}
            {preview.scores.website_trust_score} · SEO{" "}
            {preview.scores.website_seo_score} · Perf{" "}
            {preview.scores.website_performance_score}
          </p>
          <p className="whitespace-pre-wrap text-ink">
            {preview.scores.website_audit}
          </p>
          <p className="whitespace-pre-wrap text-ink-soft">
            {preview.scores.opportunity_note}
          </p>
          {preview.warnings.length ? (
            <ul className="list-disc pl-4 text-xs text-copper-deep">
              {preview.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-copper-deep">{error}</p> : null}
      {message ? <p className="mt-2 text-sm text-ink">{message}</p> : null}
    </div>
  );
}
