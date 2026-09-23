import type { AuditAnswers, AuditCheck } from "@/lib/audit/types";
import type { DirectoryProbeResult } from "@/lib/audit/directories/probe";
import type { WebsiteProbeResult } from "@/lib/audit/website-probe";
import type { GooglePlaceSnapshot } from "@/lib/google-places/client";
import type { PageSignals } from "@/lib/web-audit/fetch-page";
import type { LighthouseSnapshot } from "@/lib/web-audit/pagespeed";

export type AnalyzerContext = {
  answers: AuditAnswers;
  place: GooglePlaceSnapshot | null;
  page: PageSignals | null;
  /** Reachability probe for the website URL we analyzed / found on Google. */
  websiteProbe: WebsiteProbeResult | null;
  /** Mobile PageSpeed Insights / Lighthouse — null when skipped or unavailable. */
  lighthouse: LighthouseSnapshot | null;
  /** Soft probes of Firmy.cz / Mapy.cz / kdomestriha.cz */
  directoryProbes: DirectoryProbeResult[] | null;
  /** Whether origin/llms.txt exists (null = not checked). */
  llmsTxt: boolean | null;
};

export type Analyzer = (ctx: AnalyzerContext) => AuditCheck[] | Promise<AuditCheck[]>;

export function check(partial: AuditCheck): AuditCheck {
  return {
    ease: 3,
    impact: 3,
    value: null,
    ...partial,
  };
}
