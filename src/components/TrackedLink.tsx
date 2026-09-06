"use client";

import type { ReactNode } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

type TrackedLinkProps = {
  href: string;
  event: AnalyticsEvent;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

export function TrackedLink({
  href,
  event,
  className,
  children,
  "aria-label": ariaLabel,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackEvent(event)}
    >
      {children}
    </a>
  );
}
