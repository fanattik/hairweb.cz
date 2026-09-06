"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

type SectionViewTrackerProps = {
  event: AnalyticsEvent;
  threshold?: number;
};

/** Tiny island: fires one analytics event when the parent section enters view. */
export function SectionViewTracker({
  event,
  threshold = 0.4,
}: SectionViewTrackerProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const node = ref.current?.parentElement;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackEvent(event);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [event, threshold]);

  return <span ref={ref} className="sr-only" aria-hidden />;
}
