"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";
import {
  captureAttributionOnce,
  setSourceDetail,
  type SourceDetail,
} from "@/lib/attribution";

/**
 * One client island for UTM capture + delegated click tracking.
 * CTAs stay as Server Components with data-track / data-source attrs.
 */
export function ClientBootstrap() {
  useEffect(() => {
    captureAttributionOnce();

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const el = target.closest<HTMLElement>("[data-track]");
      if (!el) return;

      const name = el.dataset.track as AnalyticsEvent | undefined;
      if (!name) return;

      const source = el.dataset.source as SourceDetail | undefined;
      if (source) setSourceDetail(source);

      let payload: Record<string, string> | undefined;
      const raw = el.dataset.trackPayload;
      if (raw) {
        try {
          payload = JSON.parse(raw) as Record<string, string>;
        } catch {
          payload = undefined;
        }
      }

      trackEvent(name, payload);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
