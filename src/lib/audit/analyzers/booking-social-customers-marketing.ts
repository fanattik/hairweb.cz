import { check, type Analyzer } from "@/lib/audit/analyzers/types";

export const analyzeBooking: Analyzer = (ctx) => {
  const { answers } = ctx;
  const methods = answers.bookingMethods || [];
  const hasOnline = methods.includes("online");
  const mostlyManual =
    !hasOnline &&
    methods.some((m) =>
      ["phone", "instagram", "whatsapp", "email"].includes(m),
    );

  const checks = [];

  if (methods.length === 0) {
    checks.push(
      check({
        checkId: "booking_channel",
        category: "booking",
        status: "unknown",
        points: 0,
        maxPoints: 15,
        severity: "none",
        title: "Způsob rezervace",
        description: "Neznáme hlavní kanál rezervací.",
        recommendation: null,
        source: "answers",
      }),
    );
  } else if (hasOnline) {
    checks.push(
      check({
        checkId: "booking_channel",
        category: "booking",
        status: "pass",
        points: 15,
        maxPoints: 15,
        severity: "none",
        title: "Online rezervace",
        description:
          "Zákazníci si mohou rezervovat termín bez nutnosti telefonovat.",
        recommendation: null,
        source: "answers",
        value: answers.bookingProvider || "online",
      }),
    );
  } else if (mostlyManual) {
    checks.push(
      check({
        checkId: "booking_channel",
        category: "booking",
        status: "fail",
        points: 3,
        maxPoints: 15,
        severity: "high",
        title: "Rezervace hlavně ručně",
        description:
          "Termíny řešíte telefonem, zprávami nebo osobně — mimo otevírací dobu přicházíte o rezervace.",
        recommendation:
          "Zvažte online rezervační systém a jeho propojení s webem, Googlem a sociálními sítěmi.",
        source: "answers",
        ease: 2,
        impact: 5,
      }),
    );
  } else {
    checks.push(
      check({
        checkId: "booking_channel",
        category: "booking",
        status: "partial",
        points: 6,
        maxPoints: 15,
        severity: "medium",
        title: "Rezervační kanály",
        description: "Rezervace fungují, ale online kanál zatím není hlavní.",
        recommendation:
          "Doplňte nebo zviditelněte online rezervaci jako primární cestu.",
        source: "answers",
        ease: 3,
        impact: 4,
      }),
    );
  }

  if (answers.booking247 === "yes") {
    checks.push(
      check({
        checkId: "booking_247",
        category: "booking",
        status: "pass",
        points: 8,
        maxPoints: 8,
        severity: "none",
        title: "Rezervace 24/7",
        description: "Zákazníci mohou rezervovat i mimo otevírací dobu.",
        recommendation: null,
        source: "answers",
      }),
    );
  } else if (answers.booking247 === "no") {
    checks.push(
      check({
        checkId: "booking_247",
        category: "booking",
        status: "fail",
        points: 0,
        maxPoints: 8,
        severity: "medium",
        title: "Rezervace jen v pracovní době",
        description:
          "Když je salon zavřený, část zákazníků termín neodloží — odejde jinam.",
        recommendation:
          "Umožněte online rezervaci nonstop, ideálně s automatickými připomínkami.",
        source: "answers",
        ease: 3,
        impact: 4,
      }),
    );
  } else {
    checks.push(
      check({
        checkId: "booking_247",
        category: "booking",
        status: "unknown",
        points: 0,
        maxPoints: 8,
        severity: "none",
        title: "Dostupnost rezervace",
        description: "Neověřili jsme, zda jde rezervovat 24/7.",
        recommendation: null,
        source: "answers",
      }),
    );
  }

  return checks;
};

export const analyzeSocial: Analyzer = (ctx) => {
  const { answers } = ctx;
  const platforms = answers.socialPlatforms || [];
  const none = platforms.includes("none") || platforms.length === 0;
  const checks = [];

  if (none) {
    checks.push(
      check({
        checkId: "social_presence",
        category: "social",
        status: "fail",
        points: 0,
        maxPoints: 12,
        severity: "medium",
        title: "Sociální sítě",
        description: "Salon sociální sítě aktivně nepoužívá.",
        recommendation:
          "I jednoduchý Instagram s ukázkami práce pomáhá budovat důvěru a přivádět rezervace.",
        source: "answers",
        ease: 3,
        impact: 3,
      }),
    );
    return checks;
  }

  const activeCount = platforms.filter((p) => p !== "none" && p !== "other").length;
  checks.push(
    check({
      checkId: "social_presence",
      category: "social",
      status: activeCount >= 1 ? "pass" : "partial",
      points: activeCount >= 2 ? 10 : 7,
      maxPoints: 12,
      severity: "none",
      title: "Přítomnost na sociálních sítích",
      description: `Salon je aktivní na: ${platforms.filter((p) => p !== "none").join(", ")}.`,
      recommendation: null,
      source: "answers",
    }),
  );

  if (platforms.includes("instagram")) {
    const hasHandle = Boolean(answers.instagramHandle?.trim());
    checks.push(
      check({
        checkId: "social_instagram",
        category: "social",
        status: hasHandle ? "pass" : "partial",
        points: hasHandle ? 6 : 2,
        maxPoints: 6,
        severity: hasHandle ? "none" : "low",
        title: "Instagram",
        description: hasHandle
          ? `Instagram: ${answers.instagramHandle}`
          : "Instagram používáte, ale nemáme handle pro další analýzu.",
        recommendation: hasHandle
          ? null
          : "Doplňte @handle, ať můžeme později lépe vyhodnotit aktivitu.",
        source: "answers",
        value: answers.instagramHandle || null,
        ease: 5,
        impact: 2,
      }),
    );
  }

  // Future: Meta Graph activity, booking link in bio, etc.
  checks.push(
    check({
      checkId: "social_activity",
      category: "social",
      status: "unknown",
      points: 0,
      maxPoints: 8,
      severity: "none",
      title: "Aktivita na sítích",
      description:
        "Frekvenci a aktuálnost příspěvků zatím automaticky neověřujeme.",
      recommendation: null,
      source: "future_api",
    }),
  );

  return checks;
};

export const analyzeCustomers: Analyzer = (ctx) => {
  const { answers } = ctx;
  const checks = [];

  if (answers.remindVisits === "yes") {
    checks.push(
      check({
        checkId: "customers_remind",
        category: "customers",
        status: "pass",
        points: 10,
        maxPoints: 10,
        severity: "none",
        title: "Připomínky návštěv",
        description: "Zákazníkům pravidelně připomínáte další návštěvu.",
        recommendation: null,
        source: "answers",
      }),
    );
  } else if (answers.remindVisits === "partial") {
    checks.push(
      check({
        checkId: "customers_remind",
        category: "customers",
        status: "partial",
        points: 5,
        maxPoints: 10,
        severity: "medium",
        title: "Připomínky návštěv jen částečně",
        description: "Připomínky fungují nepravidelně — část klientů se nevrátí včas.",
        recommendation:
          "Nastavte jednoduché automatické připomenutí další návštěvy.",
        source: "answers",
        ease: 3,
        impact: 4,
      }),
    );
  } else if (answers.remindVisits === "no") {
    checks.push(
      check({
        checkId: "customers_remind",
        category: "customers",
        status: "fail",
        points: 0,
        maxPoints: 10,
        severity: "high",
        title: "Bez připomínek další návštěvy",
        description:
          "Bez připomenutí se část spokojených zákazníků jednoduše neozve.",
        recommendation:
          "Začněte s jednoduchým připomenutím (SMS / e-mail / rezervační systém) podle typu služby.",
        source: "answers",
        ease: 3,
        impact: 5,
      }),
    );
  } else {
    checks.push(
      check({
        checkId: "customers_remind",
        category: "customers",
        status: "unknown",
        points: 0,
        maxPoints: 10,
        severity: "none",
        title: "Připomínky návštěv",
        description: "Neověřeno.",
        recommendation: null,
        source: "answers",
      }),
    );
  }

  if (answers.reactivateCustomers === "yes") {
    checks.push(
      check({
        checkId: "customers_reactivate",
        category: "customers",
        status: "pass",
        points: 8,
        maxPoints: 8,
        severity: "none",
        title: "Reaktivace zákazníků",
        description: "Pracujete se zákazníky, kteří se dlouho nevrátili.",
        recommendation: null,
        source: "answers",
      }),
    );
  } else if (answers.reactivateCustomers === "no") {
    checks.push(
      check({
        checkId: "customers_reactivate",
        category: "customers",
        status: "fail",
        points: 0,
        maxPoints: 8,
        severity: "medium",
        title: "Bez práce s neaktivními zákazníky",
        description:
          "Přivést stávajícího klienta zpět bývá jednodušší než získat nového.",
        recommendation:
          "Jednou za čas oslovte klienty, kteří se dlouho neozvali, s nabídkou termínu.",
        source: "answers",
        ease: 3,
        impact: 4,
      }),
    );
  } else {
    checks.push(
      check({
        checkId: "customers_reactivate",
        category: "customers",
        status: "unknown",
        points: 0,
        maxPoints: 8,
        severity: "none",
        title: "Reaktivace zákazníků",
        description: "Neověřeno.",
        recommendation: null,
        source: "answers",
      }),
    );
  }

  return checks;
};

export const analyzeMarketing: Analyzer = (ctx) => {
  const { answers } = ctx;
  const checks = [];

  if (answers.knowSources === "yes") {
    checks.push(
      check({
        checkId: "marketing_sources",
        category: "marketing",
        status: "pass",
        points: 10,
        maxPoints: 10,
        severity: "none",
        title: "Znalost zdrojů zákazníků",
        description: "Víte, odkud k vám přicházejí noví zákazníci.",
        recommendation: null,
        source: "answers",
      }),
    );
  } else if (answers.knowSources === "approx") {
    checks.push(
      check({
        checkId: "marketing_sources",
        category: "marketing",
        status: "partial",
        points: 5,
        maxPoints: 10,
        severity: "medium",
        title: "Zdroje zákazníků jen přibližně",
        description:
          "Bez jasného měření je těžké vědět, kam dává smysl investovat čas a peníze.",
        recommendation:
          "Propojte web, rezervace a kampaně tak, abyste viděli, co přivádí termíny.",
        source: "answers",
        ease: 2,
        impact: 4,
      }),
    );
  } else if (answers.knowSources === "no") {
    checks.push(
      check({
        checkId: "marketing_sources",
        category: "marketing",
        status: "fail",
        points: 0,
        maxPoints: 10,
        severity: "high",
        title: "Nevíte, odkud přicházejí zákazníci",
        description:
          "Bez dat je marketing spíš tip než rozhodnutí.",
        recommendation:
          "Začněte jednoduchým měřením: web → rezervace a základní UTM u kampaní.",
        source: "answers",
        ease: 2,
        impact: 5,
      }),
    );
  } else {
    checks.push(
      check({
        checkId: "marketing_sources",
        category: "marketing",
        status: "unknown",
        points: 0,
        maxPoints: 10,
        severity: "none",
        title: "Zdroje zákazníků",
        description: "Neověřeno.",
        recommendation: null,
        source: "answers",
      }),
    );
  }

  if (answers.paidAds === "regular") {
    checks.push(
      check({
        checkId: "marketing_ads",
        category: "marketing",
        status: "pass",
        points: 6,
        maxPoints: 6,
        severity: "none",
        title: "Placená reklama",
        description: "Pravidelně používáte placenou online reklamu.",
        recommendation: null,
        source: "answers",
      }),
    );
  } else if (answers.paidAds === "occasional") {
    checks.push(
      check({
        checkId: "marketing_ads",
        category: "marketing",
        status: "partial",
        points: 3,
        maxPoints: 6,
        severity: "low",
        title: "Občasná reklama",
        description:
          "Reklamu spouštíte občas — bez měření rezervací je těžké ji vyhodnotit.",
        recommendation:
          "Než zvýšíte rozpočet, ověřte, že web a rezervace dokážou návštěvnost přeměnit.",
        source: "answers",
        ease: 3,
        impact: 3,
      }),
    );
  } else if (answers.paidAds === "no") {
    checks.push(
      check({
        checkId: "marketing_ads",
        category: "marketing",
        status: "pass",
        points: 4,
        maxPoints: 6,
        severity: "none",
        title: "Bez placené reklamy",
        description:
          "Neinzerujete — to není problém, pokud fungují organické kanály. Marketing dává smysl až po základech.",
        recommendation: null,
        source: "answers",
      }),
    );
  } else {
    checks.push(
      check({
        checkId: "marketing_ads",
        category: "marketing",
        status: "unknown",
        points: 0,
        maxPoints: 6,
        severity: "none",
        title: "Placená reklama",
        description: "Neověřeno.",
        recommendation: null,
        source: "answers",
      }),
    );
  }

  // Future: GA / conversion tracking detection
  checks.push(
    check({
      checkId: "marketing_tracking",
      category: "marketing",
      status: "unknown",
      points: 0,
      maxPoints: 8,
      severity: "none",
      title: "Měření webu a konverzí",
      description:
        "Automatickou detekci analytics a konverzí připravujeme jako budoucí kontrolu.",
      recommendation: null,
      source: "future_api",
    }),
  );

  return checks;
};
