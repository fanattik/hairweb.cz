import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CtaButton } from "@/components/CtaButton";
import type { AnalyticsEvent } from "@/lib/analytics";
import type { SourceDetail } from "@/lib/attribution";

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
  const payload =
    eventPayload && Object.keys(eventPayload).length > 0
      ? JSON.stringify(eventPayload)
      : undefined;

  return (
    <CtaButton
      href={href}
      variant={variant}
      className={className}
      data-track={event}
      data-source={sourceDetail}
      data-track-payload={payload}
    >
      {children}
    </CtaButton>
  );
}
