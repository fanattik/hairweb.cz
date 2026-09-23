/**
 * Probe whether a salon website URL is actually reachable.
 * Catches common Google/Firmy.cz mistakes like diacritics in the domain.
 */

export type WebsiteProbeResult = {
  inputUrl: string;
  normalizedUrl: string | null;
  ok: boolean;
  httpStatus: number | null;
  error: string | null;
  /** Hostname contains non-ASCII / diacritics (often broken when pasted into Google). */
  hasDiacriticsInHost: boolean;
  /** Working ASCII alternative we discovered, if any. */
  suggestedUrl: string | null;
  finalUrl: string | null;
};

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function hostnameHasNonAscii(hostname: string): boolean {
  try {
    // Punycode xn-- means original had non-ASCII
    if (hostname.includes("xn--")) return true;
    return /[^\x00-\x7f]/.test(hostname);
  } catch {
    return false;
  }
}

export function asciiHostnameVariant(hostname: string): string | null {
  const raw = hostname.trim().toLowerCase();
  if (!raw) return null;
  // Decode punycode via URL if needed — for display hosts with diacritics
  const stripped = stripDiacritics(raw).replace(/xn--[a-z0-9-]+/gi, (label) => {
    // leave punycode labels; we rebuild from unicode input instead
    return label;
  });
  // If input still has xn--, try to get unicode from URL constructor via original
  const ascii = stripDiacritics(raw);
  if (ascii === raw && !raw.includes("xn--")) return null;
  // For punycode hosts: stripDiacritics won't help — caller should pass unicode form
  if (ascii.includes("xn--")) return null;
  if (ascii === raw.replace(/^www\./, "") && !hostnameHasNonAscii(raw)) {
    return null;
  }
  return ascii !== raw ? ascii : null;
}

/** Build https URL with ASCII-only hostname if diacritics present. */
export function suggestAsciiWebsiteUrl(url: string): string | null {
  try {
    let raw = url.trim();
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
    const parsed = new URL(raw);
    // URL may already punycode the host — recover unicode from href input
    const unicodeHostMatch = url.match(
      /^(?:https?:\/\/)?([^/:?#]+)/i,
    );
    const originalHost = (unicodeHostMatch?.[1] || parsed.hostname).replace(
      /:\d+$/,
      "",
    );
    const hasDia =
      hostnameHasNonAscii(originalHost) || hostnameHasNonAscii(parsed.hostname);
    if (!hasDia) return null;

    const asciiHost = stripDiacritics(originalHost).replace(/^www\./, "www.");
    // Prefer keeping www if present
    const host = stripDiacritics(originalHost);
    if (!host.includes(".") || host === originalHost) {
      // originalHost was already punycode — strip won't work; try decoded
      // Fallback: remove xn-- manually isn't reliable; return null
      if (parsed.hostname.includes("xn--")) {
        // Can't reverse without punycode lib — try common pattern: use href unicode from input
        return null;
      }
    }
    const suggested = new URL(parsed.toString());
    suggested.hostname = host;
    suggested.hash = "";
    if (suggested.hostname === parsed.hostname) return null;
    return suggested.toString();
  } catch {
    return null;
  }
}

/** Real GET — HEAD often lies (200) while the page is empty / dead for browsers & PSI. */
async function probeGet(url: string): Promise<{
  ok: boolean;
  status: number | null;
  finalUrl: string | null;
  error: string | null;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "HairwebWebAudit/1.0 (+https://www.hairweb.cz)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const body = await response.text();
    clearTimeout(timeout);
    const statusOk =
      response.ok || (response.status >= 200 && response.status < 400);
    // Empty / tiny body = not a usable website (matches PageSpeed "could not resolve" / blank host)
    const hasContent = body.trim().length >= 80;
    const ok = statusOk && hasContent;
    return {
      ok,
      status: response.status,
      finalUrl: response.url || url,
      error: ok
        ? null
        : !statusOk
          ? `HTTP ${response.status}`
          : "Server neodpovídá použitelným obsahem (prázdná odpověď)",
    };
  } catch (error) {
    clearTimeout(timeout);
    const err = error as Error & { cause?: { code?: string; message?: string } };
    const message = err?.message || String(error);
    const causeMsg = err?.cause?.message || err?.cause?.code || "";
    const combined = `${message} ${causeMsg}`;
    return {
      ok: false,
      status: null,
      finalUrl: null,
      error: /ENOTFOUND|getaddrinfo|Could not resolve|DNS|name resolution/i.test(
        combined,
      )
        ? "DNS: doména neexistuje / nejde přeložit"
        : /fetch failed|ECONNRESET|empty|socket/i.test(combined)
          ? "Doména nejde otevřít (síť / prázdná odpověď)"
          : message.slice(0, 180),
    };
  }
}

/**
 * Check URL reachability and try ASCII alternative when host has diacritics.
 */
export async function probeWebsite(
  inputUrl: string,
): Promise<WebsiteProbeResult> {
  let raw = inputUrl.trim();
  if (!raw) {
    return {
      inputUrl,
      normalizedUrl: null,
      ok: false,
      httpStatus: null,
      error: "Prázdná URL",
      hasDiacriticsInHost: false,
      suggestedUrl: null,
      finalUrl: null,
    };
  }
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  let normalizedUrl: string | null = null;
  let hasDiacriticsInHost = false;
  try {
    const parsed = new URL(raw);
    // Detect diacritics from original string before punycode conversion
    const hostFromInput =
      inputUrl.match(/^(?:https?:\/\/)?([^/:?#]+)/i)?.[1] || parsed.hostname;
    hasDiacriticsInHost =
      /[^\x00-\x7f]/.test(hostFromInput) ||
      parsed.hostname.includes("xn--") ||
      /[áäčďéěíľĺňóôŕšťúůýžÁÄČĎÉĚÍĽĹŇÓÔŔŠŤÚŮÝŽ]/.test(hostFromInput);
    normalizedUrl = parsed.toString();
  } catch {
    return {
      inputUrl,
      normalizedUrl: null,
      ok: false,
      httpStatus: null,
      error: "Neplatná URL",
      hasDiacriticsInHost: false,
      suggestedUrl: null,
      finalUrl: null,
    };
  }

  const primary = await probeGet(normalizedUrl);
  let suggestedUrl: string | null = null;

  if (hasDiacriticsInHost || !primary.ok) {
    const asciiSuggestion = buildAsciiSuggestion(inputUrl);
    if (asciiSuggestion && asciiSuggestion !== normalizedUrl) {
      const alt = await probeGet(asciiSuggestion);
      if (alt.ok) {
        suggestedUrl = asciiSuggestion;
      }
    }
  }

  return {
    inputUrl,
    normalizedUrl,
    ok: primary.ok,
    httpStatus: primary.status,
    error: primary.error,
    hasDiacriticsInHost,
    suggestedUrl,
    finalUrl: primary.finalUrl,
  };
}

function buildAsciiSuggestion(inputUrl: string): string | null {
  try {
    let raw = inputUrl.trim();
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
    // Work on the raw host with diacritics before URL punycode
    const match = raw.match(/^(https?:\/\/)([^/:?#]+)(.*)$/i);
    if (!match) return null;
    const [, protocol, host, rest] = match;
    const asciiHost = stripDiacritics(host);
    if (asciiHost === host) return null;
    return `${protocol}${asciiHost}${rest || "/"}`;
  } catch {
    return null;
  }
}
