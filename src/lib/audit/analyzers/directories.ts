import { check, type Analyzer } from "@/lib/audit/analyzers/types";
import type { DirectoryProbeResult } from "@/lib/audit/directories/probe";
import type { DirectoryPlatform } from "@/lib/audit/types";

const DIRECTORY_LABEL: Record<string, string> = {
  firmy_cz: "Firmy.cz",
  mapy_cz: "Mapy.cz",
  kdomestriha: "kdomestriha.cz",
  zlate_stranky: "Zlaté stránky",
  other: "Jiný katalog",
  none: "Žádný",
};

function claimed(
  platforms: DirectoryPlatform[] | undefined,
  id: DirectoryPlatform,
): boolean {
  if (!platforms || platforms.length === 0) return false;
  if (platforms.includes("none")) return false;
  return platforms.includes(id);
}

function linkFound(
  links: Record<string, string[]> | undefined,
  id: string,
): boolean {
  return Boolean(links?.[id]?.length);
}

function probeOf(
  probes: DirectoryProbeResult[] | null | undefined,
  id: string,
): DirectoryProbeResult | undefined {
  return probes?.find((p) => p.id === id);
}

/**
 * Czech local directories: Firmy.cz, Mapy.cz, kdomestriha.cz (+ optional others).
 * Combines wizard answers, links on the website, and soft catalog search.
 */
export const analyzeDirectories: Analyzer = (ctx) => {
  const { answers, page, directoryProbes } = ctx;
  const checks = [];
  const platforms = answers.directoryPlatforms || [];
  const links = page?.directoryLinks;
  const noneClaimed = platforms.includes("none");

  const targets: Array<{
    id: DirectoryPlatform;
    checkId: string;
    title: string;
    why: string;
    maxPoints: number;
  }> = [
    {
      id: "firmy_cz",
      checkId: "dir_firmy_cz",
      title: "Firmy.cz",
      why: "Firmy.cz je často první místo, kam Češi jdou hledat lokální služby.",
      maxPoints: 8,
    },
    {
      id: "mapy_cz",
      checkId: "dir_mapy_cz",
      title: "Mapy.cz",
      why: "Mapy.cz (Seznam) používá spousta lidí místo Googlu — hlavně na mobilu.",
      maxPoints: 8,
    },
    {
      id: "kdomestriha",
      checkId: "dir_kdomestriha",
      title: "kdomestriha.cz",
      why: "Oborový katalog kadeřnictví — zákazníci tu porovnávají salony v okolí.",
      maxPoints: 6,
    },
  ];

  if (noneClaimed && platforms.length === 1) {
    checks.push(
      check({
        checkId: "dir_presence_overall",
        category: "directories",
        status: "fail",
        points: 0,
        maxPoints: 10,
        severity: "high",
        title: "Chybí zápisy v českých katalozích",
        description:
          "Bez Firmy.cz, Mapy.cz nebo oborových katalogů vás část zákazníků vůbec nenajde.",
        recommendation:
          "Založte aspoň Firmy.cz a Mapy.cz se správným názvem, adresou, telefonem a odkazem na web.",
        source: "answers",
        ease: 4,
        impact: 5,
      }),
    );
  }

  for (const target of targets) {
    const self = claimed(platforms, target.id);
    const onWeb = linkFound(links, target.id);
    const probe = probeOf(directoryProbes, target.id);
    const foundByProbe = probe?.status === "found";
    const missingByProbe = probe?.status === "not_found";

    const present = self || onWeb || foundByProbe;

    if (present) {
      checks.push(
        check({
          checkId: target.checkId,
          category: "directories",
          status: "pass",
          points: target.maxPoints,
          maxPoints: target.maxPoints,
          severity: "none",
          title: `${target.title} — zápis vypadá v pořádku`,
          description: foundByProbe
            ? `${target.why} V katalogu jsme našli zmínku o salonu.`
            : onWeb
              ? `${target.why} Na webu máte odkaz na ${target.title}.`
              : `${target.why} Uvádíte, že tam salon máte.`,
          recommendation: null,
          source: foundByProbe
            ? "directory_probe"
            : onWeb
              ? "website_fetch"
              : "answers",
          value: target.id,
        }),
      );
      continue;
    }

    if (missingByProbe || (platforms.length > 0 && !noneClaimed && !self)) {
      checks.push(
        check({
          checkId: target.checkId,
          category: "directories",
          status: "fail",
          points: 0,
          maxPoints: target.maxPoints,
          severity: target.id === "kdomestriha" ? "medium" : "high",
          title: `Chybí zápis na ${target.title}`,
          description: missingByProbe
            ? `${target.why} Při kontrole jsme salon nenašli.`
            : `${target.why} V seznamu katalogů jste ${target.title} neuvedli.`,
          recommendation: `Založte nebo doplňte profil na ${target.title}: název, adresa, telefon, otevírací doba a odkaz na web.`,
          source: missingByProbe ? "directory_probe" : "answers",
          ease: 4,
          impact: target.id === "kdomestriha" ? 3 : 5,
        }),
      );
      continue;
    }

    // No self-report and probe unknown → don't invent a fail
    checks.push(
      check({
        checkId: target.checkId,
        category: "directories",
        status: "unknown",
        points: 0,
        maxPoints: target.maxPoints,
        severity: "none",
        title: target.title,
        description: `${target.why} Zápis jsme zatím neověřili automaticky.`,
        recommendation: null,
        source: "directory_probe",
      }),
    );
  }

  // Consistency: claimed but dead / no web link
  if (claimed(platforms, "firmy_cz") && page && !page.fetchError && !linkFound(links, "firmy_cz")) {
    checks.push(
      check({
        checkId: "dir_firmy_link_on_web",
        category: "directories",
        status: "partial",
        points: 1,
        maxPoints: 3,
        severity: "low",
        title: "Na webu chybí odkaz na Firmy.cz",
        description:
          "Uvádíte Firmy.cz, ale na webu jsme odkaz nenašli — zákazníci i AI méně propojí značku s katalogem.",
        recommendation:
          "Přidejte v patičce nebo v kontaktech odkaz na váš zápis na Firmy.cz.",
        source: "consistency",
        ease: 5,
        impact: 2,
      }),
    );
  }

  void DIRECTORY_LABEL; // keep labels map for future UI
  return checks;
};
