import { scoresToWebFlags } from "@/lib/leads/web-flags";
import { PsiLegend, ScoreGauge } from "@/components/admin/ScoreGauge";

export type LighthouseScores = {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
};

export type WebAuditScoreSet = {
  website_design_score: number | null;
  website_mobile_score: number | null;
  website_cta_score: number | null;
  website_content_score: number | null;
  website_trust_score: number | null;
  website_seo_score: number | null;
  website_performance_score: number | null;
};

type Props = {
  lighthouse?: LighthouseScores | null;
  scores?: WebAuditScoreSet | null;
  auditText?: string | null;
  opportunityNote?: string | null;
  warnings?: string[];
};

const FLAG_ROWS: Array<{
  key: keyof ReturnType<typeof scoresToWebFlags>;
  label: string;
}> = [
  { key: "website_design_ok", label: "Design" },
  { key: "website_mobile_ok", label: "Mobile UX" },
  { key: "website_cta_ok", label: "CTA / rezervace" },
  { key: "website_content_ok", label: "Obsah" },
  { key: "website_trust_ok", label: "Trust" },
  { key: "website_seo_ok", label: "SEO" },
  { key: "website_performance_ok", label: "Performance" },
];

function FlagPill({ ok }: { ok: boolean | null }) {
  if (ok == null) {
    return <span className="text-ink-soft">—</span>;
  }
  return (
    <span
      className={
        ok
          ? "font-medium text-emerald-800"
          : "font-medium text-copper-deep"
      }
    >
      {ok ? "Ano" : "Ne"}
    </span>
  );
}

export function WebAuditGauges({
  lighthouse,
  scores,
  auditText,
  opportunityNote,
  warnings,
}: Props) {
  const hasLh =
    lighthouse &&
    (lighthouse.performance != null ||
      lighthouse.accessibility != null ||
      lighthouse.bestPractices != null ||
      lighthouse.seo != null);

  const flags = scores ? scoresToWebFlags(scores) : null;
  const hasScores =
    flags && Object.values(flags).some((value) => value != null);

  if (!hasLh && !hasScores && !auditText) return null;

  return (
    <div className="space-y-5">
      {hasLh ? (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            PageSpeed Insights (mobil)
          </p>
          <div className="flex flex-wrap justify-around gap-4">
            <ScoreGauge
              label="Výkon"
              score={lighthouse.performance}
              size="lg"
            />
            <ScoreGauge
              label="Přístupnost"
              score={lighthouse.accessibility}
            />
            <ScoreGauge
              label="Postupy"
              score={lighthouse.bestPractices}
            />
            <ScoreGauge label="SEO" score={lighthouse.seo} />
          </div>
          <div className="mt-4">
            <PsiLegend />
          </div>
        </div>
      ) : null}

      {hasScores && flags ? (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Hairweb web checklist
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {FLAG_ROWS.map((row) => (
              <li
                key={row.key}
                className="flex items-center justify-between border border-line bg-mist px-3 py-2 text-sm"
              >
                <span>{row.label}</span>
                <FlagPill ok={flags[row.key]} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {auditText ? (
        <p className="whitespace-pre-wrap text-sm text-ink">{auditText}</p>
      ) : null}
      {opportunityNote ? (
        <p className="whitespace-pre-wrap text-sm text-ink-soft">
          {opportunityNote}
        </p>
      ) : null}
      {warnings?.length ? (
        <ul className="list-disc pl-4 text-xs text-copper-deep">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
