import {
  MARKETING_CHANNEL_LABELS,
  type MarketingChannel,
  leadMarketingChannel,
} from "@/lib/marketing-channel";

const TONE: Record<MarketingChannel, string> = {
  meta_ads: "border-blue-200 bg-blue-50 text-blue-900",
  google_ads: "border-emerald-200 bg-emerald-50 text-emerald-900",
  google_organic: "border-line bg-mist text-ink",
  organic_social: "border-violet-200 bg-violet-50 text-violet-900",
  referral: "border-line bg-mist text-ink-soft",
  direct: "border-line bg-mist text-ink-soft",
  outbound: "border-line bg-foam text-ink-soft",
  other: "border-line bg-mist text-ink-soft",
};

export function MarketingChannelBadge({
  lead,
}: {
  lead: Parameters<typeof leadMarketingChannel>[0];
}) {
  const channel = leadMarketingChannel(lead);
  return (
    <span
      className={`inline-flex border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TONE[channel]}`}
    >
      {MARKETING_CHANNEL_LABELS[channel]}
    </span>
  );
}
