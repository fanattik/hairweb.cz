"use client";

import { useState } from "react";
import {
  leadMarketingChannel,
  marketingChannelLabel,
} from "@/lib/marketing-channel";
import { formatPragueDateTime } from "@/lib/leads/followup";
import type { Lead } from "@/lib/leads/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line/60 py-2 text-sm last:border-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{value ?? "—"}</dd>
    </div>
  );
}

export function LeadSourceSection({ lead }: { lead: Lead }) {
  const [openTech, setOpenTech] = useState(false);
  const channel = leadMarketingChannel({
    type: lead.type,
    leadSource: lead.source,
    first_touch_source: lead.first_touch_source,
    first_touch_medium: lead.first_touch_medium,
    first_touch_campaign: lead.first_touch_campaign,
    first_touch_content: lead.first_touch_content,
    first_touch_term: lead.first_touch_term,
    first_touch_referrer: lead.first_touch_referrer,
    first_touch_landing_page: lead.first_touch_landing_page,
    utm_source: lead.utm_source,
    utm_medium: lead.utm_medium,
    utm_campaign: lead.utm_campaign,
    fbclid: lead.fbclid,
    referrer: lead.referrer,
    landing_page: lead.landing_page,
  });

  const campaign =
    lead.first_touch_campaign || lead.utm_campaign || "—";
  const content = lead.first_touch_content || lead.utm_content || "—";
  const landing =
    lead.first_touch_landing_page || lead.landing_page || "—";
  const firstAt = lead.first_touch_at;

  const lastDiffers =
    (lead.last_touch_source || lead.last_touch_campaign) &&
    (lead.last_touch_source !== lead.first_touch_source ||
      lead.last_touch_campaign !== lead.first_touch_campaign ||
      lead.last_touch_content !== lead.first_touch_content);

  return (
    <section className="border border-line bg-foam p-5">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Zdroj leadu
      </h2>
      <dl>
        <Row label="Zdroj" value={marketingChannelLabel(channel)} />
        <Row label="Kampaň" value={campaign} />
        <Row label="Reklama" value={content} />
        <Row label="Landing page" value={landing} />
        <Row
          label="První návštěva"
          value={firstAt ? formatPragueDateTime(firstAt) : "—"}
        />
        {lastDiffers ? (
          <>
            <Row
              label="Last touch"
              value={[
                lead.last_touch_source,
                lead.last_touch_medium,
                lead.last_touch_campaign,
              ]
                .filter(Boolean)
                .join(" / ") || "—"}
            />
            <Row
              label="Last touch čas"
              value={
                lead.last_touch_at
                  ? formatPragueDateTime(lead.last_touch_at)
                  : "—"
              }
            />
          </>
        ) : null}
        {lead.source_detail ? (
          <Row label="CTA na webu" value={lead.source_detail} />
        ) : null}
      </dl>

      <button
        type="button"
        onClick={() => setOpenTech((v) => !v)}
        className="mt-3 text-xs text-copper hover:underline"
      >
        {openTech ? "Skrýt technické údaje" : "Technické údaje"}
      </button>
      {openTech ? (
        <dl className="mt-2 border border-line bg-mist p-3">
          <Row label="utm_source" value={lead.first_touch_source || lead.utm_source} />
          <Row label="utm_medium" value={lead.first_touch_medium || lead.utm_medium} />
          <Row
            label="utm_campaign"
            value={lead.first_touch_campaign || lead.utm_campaign}
          />
          <Row
            label="utm_content"
            value={lead.first_touch_content || lead.utm_content}
          />
          <Row label="utm_term" value={lead.first_touch_term || lead.utm_term} />
          <Row label="fbclid" value={lead.fbclid} />
          <Row
            label="referrer"
            value={lead.first_touch_referrer || lead.referrer}
          />
          <Row label="type / source" value={`${lead.type} / ${lead.source || "—"}`} />
        </dl>
      ) : null}
    </section>
  );
}
