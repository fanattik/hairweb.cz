"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CtaButton } from "@/components/CtaButton";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";
import { setSourceDetail, type SourceDetail } from "@/lib/attribution";

type TrackedCtaProps = {
  href: string;
  children: ReactNode;
  variant?: ComponentPropsWithoutRef<typeof CtaButton>["variant"];
  className?: string;
  event: AnalyticsEvent;
  eventPayload?: Record<string, string | number | boolean | undefined | null>;
  sourceDetail?: SourceDetail;
};

export function TrackedCta({
  href,
  children,
  variant,
  className,
  event,
  eventPayload,
  sourceDetail,
}: TrackedCtaProps) {
  return (
    <CtaButton
      href={href}
      variant={variant}
      className={className}
      onClick={() => {
        if (sourceDetail) setSourceDetail(sourceDetail);
        trackEvent(event, eventPayload);
      }}
    >
      {children}
    </CtaButton>
  );
}
