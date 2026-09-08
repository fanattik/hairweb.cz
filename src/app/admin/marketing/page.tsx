import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import {
  MARKETING_CHANNEL_LABELS,
  type MarketingChannel,
  leadMarketingChannel,
} from "@/lib/marketing-channel";
import type { Lead } from "@/lib/leads/types";

type Agg = {
  channel: MarketingChannel;
  leads: number;
  qualified: number;
  won: number;
  wonValue: number;
};

type CampaignAgg = {
  key: string;
  channel: MarketingChannel;
  campaign: string;
  content: string | null;
  leads: number;
  qualified: number;
  won: number;
  wonValue: number;
};

const QUALIFIED = new Set([
  "interested",
  "meeting",
  "proposal",
  "won",
]);

function pct(part: number, whole: number) {
  if (!whole) return "—";
  return `${Math.round((part / whole) * 100)} %`;
}

function money(value: number) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminMarketingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase, user } = await requireAdmin();
  const params = await searchParams;
  const channelFilter = Array.isArray(params.channel)
    ? params.channel[0]
    : params.channel;
  const campaignFilter = Array.isArray(params.campaign)
    ? params.campaign[0]
    : params.campaign;

  const { data } = await supabase
    .from("leads")
    .select(
      "id, type, status, source, won_value, utm_source, utm_medium, utm_campaign, utm_content, fbclid, referrer, landing_page, first_touch_source, first_touch_medium, first_touch_campaign, first_touch_content, first_touch_referrer, first_touch_landing_page",
    )
    .returns<
      Pick<
        Lead,
        | "id"
        | "type"
        | "status"
        | "source"
        | "won_value"
        | "utm_source"
        | "utm_medium"
        | "utm_campaign"
        | "utm_content"
        | "fbclid"
        | "referrer"
        | "landing_page"
        | "first_touch_source"
        | "first_touch_medium"
        | "first_touch_campaign"
        | "first_touch_content"
        | "first_touch_referrer"
        | "first_touch_landing_page"
      >[]
    >();

  const rows = data ?? [];

  const byChannel = new Map<MarketingChannel, Agg>();
  const byCampaign = new Map<string, CampaignAgg>();

  for (const lead of rows) {
    const channel = leadMarketingChannel({
      type: lead.type,
      leadSource: lead.source,
      first_touch_source: lead.first_touch_source,
      first_touch_medium: lead.first_touch_medium,
      first_touch_campaign: lead.first_touch_campaign,
      first_touch_referrer: lead.first_touch_referrer,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
      fbclid: lead.fbclid,
      referrer: lead.referrer,
    });

    const channelAgg = byChannel.get(channel) || {
      channel,
      leads: 0,
      qualified: 0,
      won: 0,
      wonValue: 0,
    };
    channelAgg.leads += 1;
    if (QUALIFIED.has(lead.status)) channelAgg.qualified += 1;
    if (lead.status === "won") {
      channelAgg.won += 1;
      channelAgg.wonValue += Number(lead.won_value || 0);
    }
    byChannel.set(channel, channelAgg);

    const campaign =
      lead.first_touch_campaign || lead.utm_campaign || "(bez kampaně)";
    const content = lead.first_touch_content || lead.utm_content || null;
    const key = `${channel}::${campaign}::${content || ""}`;
    const campAgg = byCampaign.get(key) || {
      key,
      channel,
      campaign,
      content,
      leads: 0,
      qualified: 0,
      won: 0,
      wonValue: 0,
    };
    campAgg.leads += 1;
    if (QUALIFIED.has(lead.status)) campAgg.qualified += 1;
    if (lead.status === "won") {
      campAgg.won += 1;
      campAgg.wonValue += Number(lead.won_value || 0);
    }
    byCampaign.set(key, campAgg);
  }

  const channelRows = [...byChannel.values()].sort(
    (a, b) => b.leads - a.leads,
  );

  let campaignRows = [...byCampaign.values()].sort(
    (a, b) => b.leads - a.leads,
  );
  if (channelFilter) {
    campaignRows = campaignRows.filter((r) => r.channel === channelFilter);
  }
  if (campaignFilter) {
    campaignRows = campaignRows.filter((r) => r.campaign === campaignFilter);
  }

  return (
    <AdminShell email={user.email}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight">
            Marketing / Acquisition
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            First-touch attribution ze skutečných leadů · {rows.length} celkem
          </p>
        </div>
        <Link href="/admin/leads?type=inbound" className="text-sm text-copper hover:underline">
          Inbound leady →
        </Link>
      </div>

      <section className="mt-8 overflow-x-auto border border-line bg-foam">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Zdroj</th>
              <th className="px-4 py-3">Leady</th>
              <th className="px-4 py-3">Kvalifikované</th>
              <th className="px-4 py-3">Zakázky</th>
              <th className="px-4 py-3">Hodnota</th>
              <th className="px-4 py-3">Conv.</th>
            </tr>
          </thead>
          <tbody>
            {channelRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-ink-soft">
                  Zatím žádná data.
                </td>
              </tr>
            ) : (
              channelRows.map((row) => (
                <tr key={row.channel} className="border-b border-line/70">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/marketing?channel=${row.channel}`}
                      className="font-medium hover:underline"
                    >
                      {MARKETING_CHANNEL_LABELS[row.channel]}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads?mkt_channel=${row.channel}`}
                      className="hover:underline"
                    >
                      {row.leads}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.qualified}</td>
                  <td className="px-4 py-3">{row.won}</td>
                  <td className="px-4 py-3">{money(row.wonValue)}</td>
                  <td className="px-4 py-3">{pct(row.won, row.leads)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl">
          Kampaně / reklamy
          {channelFilter
            ? ` · ${MARKETING_CHANNEL_LABELS[channelFilter as MarketingChannel] || channelFilter}`
            : ""}
        </h2>
        {channelFilter ? (
          <Link
            href="/admin/marketing"
            className="mt-1 inline-block text-sm text-copper hover:underline"
          >
            Zrušit filtr zdroje
          </Link>
        ) : null}
        <div className="mt-4 overflow-x-auto border border-line bg-foam">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Zdroj</th>
                <th className="px-4 py-3">Kampaň</th>
                <th className="px-4 py-3">Content / Ad</th>
                <th className="px-4 py-3">Leady</th>
                <th className="px-4 py-3">Kvalif.</th>
                <th className="px-4 py-3">Zakázky</th>
                <th className="px-4 py-3">Hodnota</th>
                <th className="px-4 py-3">Conv.</th>
              </tr>
            </thead>
            <tbody>
              {campaignRows.slice(0, 50).map((row) => (
                <tr key={row.key} className="border-b border-line/70">
                  <td className="px-4 py-3">
                    {MARKETING_CHANNEL_LABELS[row.channel]}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads?campaign=${encodeURIComponent(row.campaign)}`}
                      className="hover:underline"
                    >
                      {row.campaign}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {row.content || "—"}
                  </td>
                  <td className="px-4 py-3">{row.leads}</td>
                  <td className="px-4 py-3">{row.qualified}</td>
                  <td className="px-4 py-3">{row.won}</td>
                  <td className="px-4 py-3">{money(row.wonValue)}</td>
                  <td className="px-4 py-3">{pct(row.won, row.leads)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
