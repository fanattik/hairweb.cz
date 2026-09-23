import { check, type Analyzer } from "@/lib/audit/analyzers/types";

export const analyzeWebsite: Analyzer = (ctx) => {
  const { answers, page, websiteProbe } = ctx;
  const checks = [];

  const listedUrl =
    answers.websiteUrl || answers.suggestedWebsite || websiteProbe?.inputUrl;
  const urlBroken = Boolean(
    websiteProbe && listedUrl && !websiteProbe.ok,
  );
  const diacriticTypo = Boolean(
    websiteProbe?.hasDiacriticsInHost && !websiteProbe.ok,
  );

  if (answers.hasWebsite === null && !listedUrl) {
    checks.push(
      check({
        checkId: "web_has_website",
        category: "web",
        status: "unknown",
        points: 0,
        maxPoints: 15,
        severity: "none",
        title: "Vlastní web",
        description: "Neověřili jsme, zda salon má vlastní web.",
        recommendation: null,
        source: "answers",
      }),
    );
  } else if (urlBroken) {
    checks.push(
      check({
        checkId: "web_has_website",
        category: "web",
        status: "fail",
        points: 2,
        maxPoints: 15,
        severity: "high",
        title: diacriticTypo
          ? "Webová adresa na profilu je nefunkční (diakritika v doméně)"
          : "Webová adresa je nefunkční",
        description: diacriticTypo
          ? websiteProbe?.suggestedUrl
            ? `Na Google / v profilu je uvedeno „${listedUrl}“, ale tato doména nejde otevřít. Domény s diakritikou (např. „á“) zákazníky nikam nedovedou. Fungující varianta vypadá jako „${websiteProbe.suggestedUrl}“.`
            : `Na Google / v profilu je uvedeno „${listedUrl}“, ale tato doména nejde otevřít. Domény s diakritikou v adrese často nefungují — a ani varianta bez diakritiky teď neodpovídá.`
          : `Adresa „${listedUrl}“ nejde otevřít (${websiteProbe?.error || "nedostupné"}). Zákazník z Googlu nebo Firmy.cz se na web nedostane.`,
        recommendation: diacriticTypo
          ? websiteProbe?.suggestedUrl
            ? `Opravte odkaz na web na Googlu, Firmy.cz i všude jinde na ${websiteProbe.suggestedUrl} (bez diakritiky v doméně).`
            : "Opravte odkaz na web na Googlu a Firmy.cz na funkční doménu bez diakritiky a ověřte, že hosting webu běží."
          : "Opravte URL webu na Googlu, Firmy.cz a dalších profilech na adresu, která skutečně funguje.",
        source: "website_probe",
        value: listedUrl,
        ease: 5,
        impact: 5,
      }),
    );
  } else if (answers.hasWebsite || listedUrl) {
    checks.push(
      check({
        checkId: "web_has_website",
        category: "web",
        status: "pass",
        points: 15,
        maxPoints: 15,
        severity: "none",
        title: "Vlastní web",
        description: "Salon má vlastní webovou prezentaci a adresa jde otevřít.",
        recommendation: null,
        source: websiteProbe ? "website_probe" : "answers",
        value: listedUrl || true,
        impact: 5,
      }),
    );
  } else if (answers.hasWebsite === false) {
    checks.push(
      check({
        checkId: "web_has_website",
        category: "web",
        status: "fail",
        points: 0,
        maxPoints: 15,
        severity: "high",
        title: "Chybí vlastní web",
        description:
          "Bez webu je těžší budovat důvěru a převést zájem z Googlu nebo sociálních sítí na rezervaci.",
        recommendation:
          "Zvažte jednoduchý web salonu se službami, kontaktem a jasnou cestou k rezervaci — nebo ověřte, že Google profil a rezervace tuto roli plní.",
        source: "answers",
        ease: 2,
        impact: 5,
      }),
    );
  }

  // Dedicated Google listing check when broken URL came from Google
  if (urlBroken && ctx.place?.website) {
    checks.push(
      check({
        checkId: "web_google_listing_url_broken",
        category: "google",
        status: "fail",
        points: 0,
        maxPoints: 8,
        severity: "high",
        title: "Na Googlu je nefunkční odkaz na web",
        description: diacriticTypo
          ? `Google Business Profile odkazuje na „${ctx.place.website}“. Doména s diakritikou se nepřeloží — zákazník se na web nedostane. Stejná chyba často bývá i na Firmy.cz.`
          : `Google Business Profile odkazuje na „${ctx.place.website}“, ale stránka nejde načíst.`,
        recommendation: websiteProbe?.suggestedUrl
          ? `Změňte odkaz na webu v Google profilu (a na Firmy.cz) na ${websiteProbe.suggestedUrl}.`
          : "Opravte odkaz na web v Google Business Profile na funkční URL.",
        source: "website_probe",
        ease: 5,
        impact: 5,
      }),
    );
  }

  if ((answers.hasWebsite || listedUrl) && !urlBroken) {
    if (answers.websiteBooking === "yes") {
      checks.push(
        check({
          checkId: "web_booking_cta",
          category: "web",
          status: "pass",
          points: 12,
          maxPoints: 12,
          severity: "none",
          title: "Rezervace z webu",
          description:
            "Zákazníci se přes web dostanou přímo k rezervaci.",
          recommendation: null,
          source: "answers",
        }),
      );
    } else if (answers.websiteBooking === "no") {
      checks.push(
        check({
          checkId: "web_booking_cta",
          category: "web",
          status: "fail",
          points: 0,
          maxPoints: 12,
          severity: "high",
          title: "Na webu není přímá rezervace",
          description:
            "Zákazník musí možnost rezervace hledat nebo volat — část zájmu tím padá.",
          recommendation:
            "Přidejte výrazné CTA „Rezervovat termín“ do hlavní navigace a první obrazovky webu.",
          source: "answers",
          ease: 4,
          impact: 5,
        }),
      );
    } else {
      checks.push(
        check({
          checkId: "web_booking_cta",
          category: "web",
          status: "unknown",
          points: 0,
          maxPoints: 12,
          severity: "none",
          title: "Rezervace z webu",
          description: "Neověřili jsme, zda web nabízí přímou rezervaci.",
          recommendation: null,
          source: "answers",
        }),
      );
    }
  }

  // Content scoring only when the listed URL itself is reachable — never from a fallback host.
  if (page && !page.fetchError && !urlBroken) {
    const https = page.finalUrl.startsWith("https://");
    checks.push(
      check({
        checkId: "web_https",
        category: "web",
        status: https ? "pass" : "fail",
        points: https ? 3 : 0,
        maxPoints: 3,
        severity: https ? "none" : "medium",
        title: "HTTPS",
        description: https
          ? "Web běží přes zabezpečené HTTPS."
          : "Web neběží přes HTTPS — prohlížeče i Google to vnímají negativně.",
        recommendation: https
          ? null
          : "Zapněte HTTPS (SSL certifikát) u hostingu webu.",
        source: "website_fetch",
        value: https,
        ease: 4,
        impact: 3,
      }),
    );

    checks.push(
      check({
        checkId: "web_mobile_viewport",
        category: "web",
        status: page.hasViewportMeta ? "pass" : "fail",
        points: page.hasViewportMeta ? 5 : 0,
        maxPoints: 5,
        severity: page.hasViewportMeta ? "none" : "high",
        title: "Mobilní zobrazení",
        description: page.hasViewportMeta
          ? "Web deklaruje mobilní viewport."
          : "Web pravděpodobně není připravený na mobilní zobrazení.",
        recommendation: page.hasViewportMeta
          ? null
          : "Upravte web tak, aby byl použitelný na mobilu — většina zákazníků přichází z telefonu.",
        source: "website_fetch",
        ease: 2,
        impact: 5,
      }),
    );

    const hasTitle = Boolean(page.title && page.title.trim().length >= 8);
    checks.push(
      check({
        checkId: "web_title",
        category: "web",
        status: hasTitle ? "pass" : "fail",
        points: hasTitle ? 2 : 0,
        maxPoints: 2,
        severity: hasTitle ? "none" : "low",
        title: "Title stránky",
        description: hasTitle
          ? `Title: „${page.title}"`
          : "Chybí smysluplný title stránky.",
        recommendation: hasTitle
          ? null
          : "Doplňte title se jménem salonu a městem.",
        source: "website_fetch",
        value: page.title,
        ease: 5,
        impact: 2,
      }),
    );

    const hasMeta = Boolean(
      page.metaDescription && page.metaDescription.trim().length >= 40,
    );
    checks.push(
      check({
        checkId: "web_meta_description",
        category: "web",
        status: hasMeta ? "pass" : "partial",
        points: hasMeta ? 2 : 0,
        maxPoints: 2,
        severity: hasMeta ? "none" : "low",
        title: "Meta description",
        description: hasMeta
          ? "Web má meta description."
          : "Meta description chybí nebo je příliš krátká.",
        recommendation: hasMeta
          ? null
          : "Doplňte krátký popis salonu do meta description.",
        source: "website_fetch",
        ease: 5,
        impact: 2,
      }),
    );

    if (page.clearBookingCta === true) {
      checks.push(
        check({
          checkId: "web_booking_signal",
          category: "web",
          status: "pass",
          points: 8,
          maxPoints: 8,
          severity: "none",
          title: "Viditelná rezervace na webu",
          description: "Na webu jsme našli odkaz nebo CTA směřující k rezervaci.",
          recommendation: null,
          source: "website_fetch",
        }),
      );
    } else if (page.clearBookingCta === false && answers.websiteBooking !== "yes") {
      checks.push(
        check({
          checkId: "web_booking_signal",
          category: "web",
          status: "fail",
          points: 0,
          maxPoints: 8,
          severity: "high",
          title: "Rezervace na webu není dostatečně vidět",
          description: "Zákazník musí možnost rezervace hledat.",
          recommendation:
            "Přidejte výrazné CTA „Rezervovat termín“ do menu a hero sekce.",
          source: "website_fetch",
          ease: 4,
          impact: 5,
        }),
      );
    }

    if (page.hasPrices === true) {
      checks.push(
        check({
          checkId: "web_prices",
          category: "web",
          status: "pass",
          points: 4,
          maxPoints: 4,
          severity: "none",
          title: "Ceník",
          description: "Na webu jsou ceny nebo ceník.",
          recommendation: null,
          source: "website_fetch",
        }),
      );
    } else if (page.hasPrices === false) {
      checks.push(
        check({
          checkId: "web_prices",
          category: "web",
          status: "partial",
          points: 1,
          maxPoints: 4,
          severity: "medium",
          title: "Ceník není jasně vidět",
          description: "Zákazníci často hledají orientační ceny před rezervací.",
          recommendation: "Zveřejněte alespoň základní ceník hlavních služeb.",
          source: "website_fetch",
          ease: 4,
          impact: 3,
        }),
      );
    }
  } else if (answers.hasWebsite && answers.websiteUrl) {
    // Fetch failed or skipped — mark technical checks unknown, not fail.
    for (const item of [
      ["web_https", "HTTPS", 3],
      ["web_mobile_viewport", "Mobilní použitelnost", 5],
      ["web_title", "Title", 2],
      ["web_meta_description", "Meta description", 2],
    ] as const) {
      checks.push(
        check({
          checkId: item[0],
          category: "web",
          status: "unknown",
          points: 0,
          maxPoints: item[2],
          severity: "none",
          title: item[1],
          description: "Technický stav webu jsme zatím neověřili automaticky.",
          recommendation: null,
          source: "website_fetch",
        }),
      );
    }
  }

  return checks;
};
