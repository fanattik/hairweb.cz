import { WEB_SCORE_MAX } from "@/lib/leads/types";
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

  const hasScores =
    scores &&
    Object.values(scores).some((value) => value != null);

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

      {hasScores ? (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Hairweb web skóre
          </p>
          <div className="flex flex-wrap justify-around gap-3">
            <ScoreGauge
              label="Design"
              score={scores.website_design_score}
              max={WEB_SCORE_MAX.design}
              size="sm"
            />
            <ScoreGauge
              label="Mobile"
              score={scores.website_mobile_score}
              max={WEB_SCORE_MAX.mobile}
              size="sm"
            />
            <ScoreGauge
              label="CTA"
              score={scores.website_cta_score}
              max={WEB_SCORE_MAX.cta}
              size="sm"
            />
            <ScoreGauge
              label="Content"
              score={scores.website_content_score}
              max={WEB_SCORE_MAX.content}
              size="sm"
            />
            <ScoreGauge
              label="Trust"
              score={scores.website_trust_score}
              max={WEB_SCORE_MAX.trust}
              size="sm"
            />
            <ScoreGauge
              label="SEO"
              score={scores.website_seo_score}
              max={WEB_SCORE_MAX.seo}
              size="sm"
            />
            <ScoreGauge
              label="Perf"
              score={scores.website_performance_score}
              max={WEB_SCORE_MAX.performance}
              size="sm"
            />
          </div>
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
