"use client";

import { useEffect } from "react";
import { captureAttributionOnce } from "@/lib/attribution";

export function AttributionCapture() {
  useEffect(() => {
    captureAttributionOnce();
  }, []);

  return null;
}
