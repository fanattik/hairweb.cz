/**
 * Future Meta Conversions API hook.
 * Do NOT send events until META_CAPI_ACCESS_TOKEN + META_PIXEL_ID are configured.
 *
 * Env (never hardcode):
 * - META_PIXEL_ID
 * - META_CAPI_ACCESS_TOKEN
 * - META_CAPI_TEST_EVENT_CODE (optional)
 */

export type MetaConversionEventName =
  | "Lead"
  | "CompleteRegistration"
  | "Purchase";

export type MetaConversionPayload = {
  eventName: MetaConversionEventName;
  eventTime?: number;
  eventId?: string;
  email?: string | null;
  phone?: string | null;
  value?: number | null;
  currency?: string;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  /** Facebook click id captured at attribution time. */
  fbclid?: string | null;
};

export function isMetaCapiConfigured() {
  return Boolean(
    process.env.META_PIXEL_ID?.trim() &&
      process.env.META_CAPI_ACCESS_TOKEN?.trim(),
  );
}

/**
 * Placeholder for server-side Meta CAPI.
 * Safe no-op until credentials exist.
 */
export async function sendMetaConversionEvent(
  _payload: MetaConversionPayload,
): Promise<{ sent: boolean; reason?: string }> {
  if (!isMetaCapiConfigured()) {
    return { sent: false, reason: "Meta CAPI credentials not configured" };
  }

  // Intentionally not implemented yet — wire Graph API when credentials ready.
  console.info(
    "[meta-capi] credentials present but send not implemented yet",
  );
  return { sent: false, reason: "not_implemented" };
}

/**
 * Call sites for later:
 * - inbound lead created → Lead
 * - status → interested/meeting/proposal → qualify
 * - status → won → Purchase with won_value
 */
export function metaEventForLeadStatus(status: string): MetaConversionEventName | null {
  if (status === "won") return "Purchase";
  if (["interested", "meeting", "proposal"].includes(status)) {
    return "CompleteRegistration";
  }
  return null;
}
