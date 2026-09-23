"use client";

import { useState, type ReactNode } from "react";
import { AdminCard } from "@/components/admin/ui";
import {
  leadMarketingChannel,
  marketingChannelLabel,
} from "@/lib/marketing-channel";
import { formatPragueDateTime } from "@/lib/leads/followup";
import type { Lead } from "@/lib/leads/types";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink/6 py-2 text-sm last:border-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{value ?? "—"}</dd>
    </div>
  );
}

const eyebrow =
  "font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-muted uppercase";

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
    <AdminCard>
      <h2 className={eyebrow}>Zdroj leadu</h2>
      <dl className="mt-2">
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
        <dl className="mt-2 rounded-[14px] bg-mist p-3">
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
    </AdminCard>
  );
}
