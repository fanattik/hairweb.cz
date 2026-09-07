/**
 * Phase 2 stubs — interfaces ready, integrations not fully wired.
 */

import type { OpportunitySignal } from "@/lib/discovery/types";

export type WebsiteAuditInput = {
  url: string;
};

export type WebsiteAuditResult = {
  url: string;
  httpStatus: number | null;
  httpsEnabled: boolean | null;
  hasMobileViewport: boolean | null;
  title: string | null;
  metaDescription: string | null;
  titleLength: number | null;
  descriptionLength: number | null;
  hasH1: boolean | null;
  h1Count: number | null;
  hasContactPage: boolean | null;
  hasBookingLink: boolean | null;
  hasInstagramLink: boolean | null;
  hasFacebookLink: boolean | null;
  hasGoogleMapsLink: boolean | null;
  pageLoadScore: number | null;
  mobileScore: number | null;
  seoScore: number | null;
  designOpportunityScore: number | null;
  technicalOpportunityScore: number | null;
  overallWebsiteScore: number | null;
  auditSummary: string | null;
  issues: unknown[];
};

export interface WebsiteAuditService {
  audit(input: WebsiteAuditInput): Promise<WebsiteAuditResult>;
}

/** Placeholder — Phase 2 will fetch HTML and parse signals. */
export const stubWebsiteAuditService: WebsiteAuditService = {
  async audit(input) {
    return {
      url: input.url,
      httpStatus: null,
      httpsEnabled: input.url.startsWith("https"),
      hasMobileViewport: null,
      title: null,
      metaDescription: null,
      titleLength: null,
      descriptionLength: null,
      hasH1: null,
      h1Count: null,
      hasContactPage: null,
      hasBookingLink: null,
      hasInstagramLink: null,
      hasFacebookLink: null,
      hasGoogleMapsLink: null,
      pageLoadScore: null,
      mobileScore: null,
      seoScore: null,
      designOpportunityScore: null,
      technicalOpportunityScore: null,
      overallWebsiteScore: null,
      auditSummary: "Website audit připravený pro Phase 2.",
      issues: [],
    };
  },
};

export interface AiOpportunitySummaryService {
  generate(input: {
    salonName: string;
    rating: number | null;
    reviews: number | null;
    hasWebsite: boolean;
    signals: OpportunitySignal[];
  }): Promise<{ summary: string; pitch: string }>;
}

export const stubAiOpportunitySummaryService: AiOpportunitySummaryService = {
  async generate() {
    return {
      summary: "",
      pitch: "",
    };
  },
};
