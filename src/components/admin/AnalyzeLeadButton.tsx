"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GooglePlaceSnapshot } from "@/lib/google-places/client";
import { planLeadAnalysis } from "@/lib/leads/analyze-plan";
import type { Lead } from "@/lib/leads/types";
import { WebAuditGauges } from "@/components/admin/WebAuditGauges";
import type { MergedWebAuditScores } from "@/lib/web-audit/apply";

type Props = {
  lead: Lead;
};

type StepResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  detail?: string;
};

export function AnalyzeLeadButton({ lead }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<GooglePlaceSnapshot[] | null>(
    null,
  );
  const [webPreview, setWebPreview] = useState<{
    scores: MergedWebAuditScores;
    lighthouse: {
      performance: number | null;
      accessibility: number | null;
      bestPractices: number | null;
      seo: number | null;
    };
    warnings: string[];
    finalUrl: string;
    aiSource: string;
  } | null>(null);

  const plan = useMemo(() => planLeadAnalysis(lead), [lead]);
  const canRun = plan.google || plan.instagram || plan.web;

  async function analyze(placeId?: string) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/admin/leads/${lead.id}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overwrite, placeId }),
    });

    const data = (await response.json()) as {
      error?: string;
      needsSelection?: boolean;
      candidates?: GooglePlaceSnapshot[];
      steps?: {
        google: StepResult;
        instagram: StepResult;
        web: StepResult;
        geo: StepResult;
      };
      scores?: { lead_score?: number | null };
      webAudit?: {
        scores: MergedWebAuditScores;
        lighthouse: {
          performance: number | null;
          accessibility: number | null;
          bestPractices: number | null;
          seo: number | null;
        };
        warnings: string[];
        finalUrl: string;
        aiSource: string;
      };
    };

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Analýza se nepovedla.");
      return;
    }

    if (data.needsSelection && data.candidates?.length) {
      setCandidates(data.candidates);
      setMessage("Vyber správný salon ze seznamu Google Places.");
      return;
    }

    setCandidates(null);
    if (data.webAudit) setWebPreview(data.webAudit);

    const parts: string[] = [];
    if (data.steps?.google && !data.steps.google.skipped) {
      parts.push(
        data.steps.google.ok
          ? `Google ✓${data.steps.google.detail ? ` ${data.steps.google.detail}` : ""}`
          : `Google ✗ ${data.steps.google.error}`,
      );
    }
    if (data.steps?.instagram && !data.steps.instagram.skipped) {
      parts.push(
        data.steps.instagram.ok
          ? `IG ✓${data.steps.instagram.detail ? ` ${data.steps.instagram.detail}` : ""}`
          : `IG ✗ ${data.steps.instagram.error}`,
      );
    }
    if (data.steps?.web && !data.steps.web.skipped) {
      parts.push(
        data.steps.web.ok
          ? `Web ✓${data.steps.web.detail ? ` ${data.steps.web.detail}` : ""}`
          : `Web ✗ ${data.steps.web.error}`,
      );
    }
    if (data.scores?.lead_score != null) {
      parts.push(`Lead Score ${data.scores.lead_score}`);
    }

    setMessage(parts.join(" · ") || "Hotovo.");
    router.refresh();
  }

  return (
    <div className="border border-line bg-mist p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Analýza
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Spustí jen vyplněné zdroje
            {[
              plan.google ? "Google" : null,
              plan.instagram ? "Instagram" : null,
              plan.web ? "Web/PSI" : null,
            ]
              .filter(Boolean)
              .join(" · ")
              ? `: ${[
                  plan.google ? "Google" : null,
                  plan.instagram ? "Instagram" : null,
                  plan.web ? "Web/PSI" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={loading || !canRun}
          onClick={() => analyze()}
          className="bg-ink px-5 py-2.5 text-sm text-foam hover:bg-ink-soft disabled:opacity-60"
        >
          {loading ? "Analyzuji…" : "Analyzovat"}
        </button>
      </div>

      {!canRun ? (
        <p className="mt-2 text-xs text-ink-soft">
          Vyplň Maps URL / název+město, Instagram, nebo website.
        </p>
      ) : null}

      <label className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
        <input
          type="checkbox"
          checked={overwrite}
          onChange={(e) => setOverwrite(e.target.checked)}
        />
        Přepsat existující pole (název, město, IG quality, opportunity…)
      </label>

      {candidates && candidates.length > 1 ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Více výsledků Google — vyber správný
          </p>
          {candidates.map((candidate) => (
            <button
              key={candidate.placeId}
              type="button"
              disabled={loading}
              onClick={() => analyze(candidate.placeId)}
              className="flex w-full flex-col border border-line bg-foam px-3 py-2 text-left text-sm hover:border-ink"
            >
              <span className="font-medium">
                {candidate.name || candidate.placeId}
              </span>
              <span className="text-xs text-ink-soft">
                {[
                  candidate.formattedAddress,
                  candidate.rating != null
                    ? `${candidate.rating.toFixed(1)} ★`
                    : null,
                  candidate.reviewsCount != null
                    ? `${candidate.reviewsCount} rec.`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {webPreview ? (
        <div className="mt-4 border border-line bg-foam p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Web audit · {webPreview.finalUrl}
            {webPreview.aiSource === "heuristic" ? " · heuristiky" : " · AI"}
          </p>
          <WebAuditGauges
            lighthouse={webPreview.lighthouse}
            scores={webPreview.scores}
            auditText={webPreview.scores.website_audit}
            opportunityNote={webPreview.scores.opportunity_note}
            warnings={webPreview.warnings}
          />
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-copper-deep">{error}</p> : null}
      {message ? <p className="mt-2 text-sm text-ink">{message}</p> : null}
    </div>
  );
}
