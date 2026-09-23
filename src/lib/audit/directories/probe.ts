/**
 * Soft presence checks for Czech local directories.
 * No official APIs — best-effort HTML search; unknown never lowers the score.
 */

export type DirectoryId =
  | "firmy_cz"
  | "mapy_cz"
  | "kdomestriha"
  | "zlate_stranky";

export type DirectoryProbeStatus = "found" | "not_found" | "unknown";

export type DirectoryProbeResult = {
  id: DirectoryId;
  label: string;
  status: DirectoryProbeStatus;
  searchUrl: string | null;
  detail: string | null;
};

const DIRECTORY_META: Record<
  DirectoryId,
  { label: string; buildSearchUrl: (q: string) => string }
> = {
  firmy_cz: {
    label: "Firmy.cz",
    buildSearchUrl: (q) =>
      `https://www.firmy.cz/?q=${encodeURIComponent(q)}`,
  },
  mapy_cz: {
    label: "Mapy.cz",
    buildSearchUrl: (q) =>
      `https://mapy.cz/zakladni?q=${encodeURIComponent(q)}`,
  },
  kdomestriha: {
    label: "kdomestriha.cz",
    buildSearchUrl: (q) =>
      `https://www.kdomestriha.cz/hledani?q=${encodeURIComponent(q)}`,
  },
  zlate_stranky: {
    label: "Zlaté stránky",
    buildSearchUrl: (q) =>
      `https://www.zlatestranky.cz/hledani/${encodeURIComponent(q)}`,
  },
};

function normalizeNeedle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function htmlLooksLikeHit(html: string, needles: string[]): boolean {
  const hay = normalizeNeedle(stripTagsLight(html).slice(0, 40_000));
  if (!hay) return false;
  return needles.some((n) => n.length >= 4 && hay.includes(n));
}

function stripTagsLight(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

async function softFetch(url: string): Promise<{
  ok: boolean;
  html: string;
  error: string | null;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "HairwebWebAudit/1.0 (+https://www.hairweb.cz)",
        Accept: "text/html",
      },
    });
    const html = await response.text();
    clearTimeout(timeout);
    if (!response.ok) {
      return { ok: false, html: "", error: `HTTP ${response.status}` };
    }
    return { ok: true, html, error: null };
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      html: "",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

export async function probeDirectory(
  id: DirectoryId,
  salonName: string,
  city: string,
): Promise<DirectoryProbeResult> {
  const meta = DIRECTORY_META[id];
  const query = [salonName, city, "kadeřnictví"].filter(Boolean).join(" ");
  const searchUrl = meta.buildSearchUrl(query);
  const needles = [normalizeNeedle(salonName), normalizeNeedle(city)].filter(
    (n) => n.length >= 3,
  );

  const result = await softFetch(searchUrl);
  if (!result.ok || !result.html) {
    return {
      id,
      label: meta.label,
      status: "unknown",
      searchUrl,
      detail: result.error,
    };
  }

  // Empty / captcha / blocked pages → unknown
  if (
    result.html.length < 400 ||
    /captcha|cloudflare|access denied|verify you are human/i.test(result.html)
  ) {
    return {
      id,
      label: meta.label,
      status: "unknown",
      searchUrl,
      detail: "Katalog neodpověděl použitelným výsledkem",
    };
  }

  const found = htmlLooksLikeHit(result.html, needles);
  return {
    id,
    label: meta.label,
    status: found ? "found" : "not_found",
    searchUrl,
    detail: found
      ? "V katalogu jsme našli zmínku odpovídající názvu salonu."
      : "V katalogu jsme salon podle názvu nenašli (nebo je pod jiným názvem).",
  };
}

export async function probeKeyDirectories(
  salonName: string,
  city: string,
): Promise<DirectoryProbeResult[]> {
  const ids: DirectoryId[] = ["firmy_cz", "mapy_cz", "kdomestriha"];
  return Promise.all(ids.map((id) => probeDirectory(id, salonName, city)));
}
