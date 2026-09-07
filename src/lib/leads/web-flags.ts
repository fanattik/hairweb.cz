import { WEB_SCORE_MAX } from "@/lib/leads/types";

/** Yes/no web quality flags used in the admin form. */
export type WebQualityFlags = {
  website_design_ok: boolean | null;
  website_mobile_ok: boolean | null;
  website_cta_ok: boolean | null;
  website_content_ok: boolean | null;
  website_trust_ok: boolean | null;
  website_seo_ok: boolean | null;
  website_performance_ok: boolean | null;
};

export type WebScoreFields = {
  website_design_score: number | null;
  website_mobile_score: number | null;
  website_cta_score: number | null;
  website_content_score: number | null;
  website_trust_score: number | null;
  website_seo_score: number | null;
  website_performance_score: number | null;
};

function flagFromScore(score: number | null | undefined, max: number) {
  if (score == null) return null;
  return score >= max * 0.55;
}

function scoreFromFlag(flag: boolean | null, max: number) {
  if (flag == null) return null;
  return flag ? max : Math.round(max * 0.2);
}

/** Convert stored numeric scores into Ano/Ne for the form. */
export function scoresToWebFlags(scores: Partial<WebScoreFields>): WebQualityFlags {
  return {
    website_design_ok: flagFromScore(
      scores.website_design_score,
      WEB_SCORE_MAX.design,
    ),
    website_mobile_ok: flagFromScore(
      scores.website_mobile_score,
      WEB_SCORE_MAX.mobile,
    ),
    website_cta_ok: flagFromScore(scores.website_cta_score, WEB_SCORE_MAX.cta),
    website_content_ok: flagFromScore(
      scores.website_content_score,
      WEB_SCORE_MAX.content,
    ),
    website_trust_ok: flagFromScore(
      scores.website_trust_score,
      WEB_SCORE_MAX.trust,
    ),
    website_seo_ok: flagFromScore(scores.website_seo_score, WEB_SCORE_MAX.seo),
    website_performance_ok: flagFromScore(
      scores.website_performance_score,
      WEB_SCORE_MAX.performance,
    ),
  };
}

/** Convert Ano/Ne flags back into numeric scores for Lead Score. */
export function webFlagsToScores(flags: WebQualityFlags): WebScoreFields {
  return {
    website_design_score: scoreFromFlag(
      flags.website_design_ok,
      WEB_SCORE_MAX.design,
    ),
    website_mobile_score: scoreFromFlag(
      flags.website_mobile_ok,
      WEB_SCORE_MAX.mobile,
    ),
    website_cta_score: scoreFromFlag(flags.website_cta_ok, WEB_SCORE_MAX.cta),
    website_content_score: scoreFromFlag(
      flags.website_content_ok,
      WEB_SCORE_MAX.content,
    ),
    website_trust_score: scoreFromFlag(
      flags.website_trust_ok,
      WEB_SCORE_MAX.trust,
    ),
    website_seo_score: scoreFromFlag(flags.website_seo_ok, WEB_SCORE_MAX.seo),
    website_performance_score: scoreFromFlag(
      flags.website_performance_ok,
      WEB_SCORE_MAX.performance,
    ),
  };
}

/** AI/Lighthouse numeric scores → flags for apply. */
export function numericAuditToFlags(scores: {
  website_design_score: number;
  website_mobile_score: number;
  website_cta_score: number;
  website_content_score: number;
  website_trust_score: number;
  website_seo_score: number;
  website_performance_score: number;
}): WebQualityFlags {
  return scoresToWebFlags(scores);
}
