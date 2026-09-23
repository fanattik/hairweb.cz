import {
  MARKETING_CHANNEL_LABELS,
  type MarketingChannel,
  leadMarketingChannel,
} from "@/lib/marketing-channel";

const TONE: Record<MarketingChannel, string> = {
  meta_ads: "bg-ink text-foam",
  google_ads: "bg-copper/15 text-copper-deep",
  google_organic: "bg-mist text-ink border border-ink/10",
  organic_social: "bg-stone text-ink",
  referral: "bg-mist text-ink-soft border border-ink/10",
  direct: "bg-mist text-ink-soft border border-ink/10",
  outbound: "bg-foam text-ink-soft border border-ink/10",
  other: "bg-mist text-ink-soft border border-ink/10",
};

export function MarketingChannelBadge({
  lead,
}: {
  lead: Parameters<typeof leadMarketingChannel>[0];
}) {
  const channel = leadMarketingChannel(lead);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase ${TONE[channel]}`}
    >
      {MARKETING_CHANNEL_LABELS[channel]}
    </span>
  );
}
