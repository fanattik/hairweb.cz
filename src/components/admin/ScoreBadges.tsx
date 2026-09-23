import {
  OPPORTUNITY_LABELS,
  PRIORITY_LABELS,
  WEB_BAND_LABELS,
  type LeadOpportunity,
  type LeadPriority,
  type WebScoreBand,
} from "@/lib/leads/types";

const priorityStyles: Record<LeadPriority, string> = {
  hot: "bg-copper text-white",
  good: "bg-ink text-foam",
  warm: "bg-stone text-ink",
  low: "bg-mist text-ink-soft border border-ink/10",
};

const opportunityStyles: Record<LeadOpportunity, string> = {
  very_high: "bg-copper text-white",
  high: "bg-ink text-foam",
  medium: "bg-stone text-ink",
  low: "bg-mist text-ink-soft border border-ink/10",
};

const webBandStyles: Record<WebScoreBand, string> = {
  poor: "bg-copper/15 text-copper-deep",
  weak: "bg-stone text-ink",
  good: "bg-ink/10 text-ink",
  strong: "bg-ink text-foam",
};

const badgeBase =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase";

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <span className={`${badgeBase} ${priorityStyles[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function OpportunityBadge({
  opportunity,
}: {
  opportunity: LeadOpportunity;
}) {
  return (
    <span className={`${badgeBase} ${opportunityStyles[opportunity]}`}>
      {OPPORTUNITY_LABELS[opportunity]}
    </span>
  );
}

export function WebBandBadge({ band }: { band: WebScoreBand }) {
  return (
    <span className={`${badgeBase} ${webBandStyles[band]}`}>
      {WEB_BAND_LABELS[band]}
    </span>
  );
}

export function ScoreSummaryCard({
  businessScore,
  webOpportunityScore,
  purchaseIntentScore,
  contactabilityScore,
  leadScore,
  priority,
  compact = false,
}: {
  businessScore: number;
  webOpportunityScore: number;
  purchaseIntentScore: number;
  contactabilityScore: number;
  leadScore: number;
  priority: LeadPriority;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-[22px] bg-foam ${compact ? "p-4" : "p-5"}`}>
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase">
        Hairweb Score
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-4xl font-semibold tracking-[-0.05em] text-ink">
          {leadScore}
          <span className="text-lg text-ink-soft"> / 100</span>
        </p>
        <PriorityBadge priority={priority} />
      </div>
      <dl className="mt-4 space-y-1.5 text-sm text-ink-soft">
        <div className="flex justify-between gap-3">
          <dt>Business</dt>
          <dd className="text-ink">{businessScore} / 30</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Web opportunity</dt>
          <dd className="text-ink">{webOpportunityScore} / 40</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Purchase intent</dt>
          <dd className="text-ink">{purchaseIntentScore} / 20</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Contactability</dt>
          <dd className="text-ink">{contactabilityScore} / 10</dd>
        </div>
      </dl>
    </div>
  );
}
