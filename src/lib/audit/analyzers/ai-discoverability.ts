import { check, type Analyzer } from "@/lib/audit/analyzers/types";

/**
 * AI discoverability / preparedness — can assistants find and cite the salon?
 * Deterministic signals from the website HTML (+ optional llms.txt).
 */
export const analyzeAiDiscoverability: Analyzer = (ctx) => {
  const { page, answers, websiteProbe, llmsTxt } = ctx;
  const checks = [];

  const listedUrl =
    answers.websiteUrl || answers.suggestedWebsite || websiteProbe?.inputUrl;
  const urlBroken = Boolean(websiteProbe && listedUrl && !websiteProbe.ok);
  const hasSite = Boolean((answers.hasWebsite || listedUrl) && !urlBroken);

  if (!hasSite) {
    checks.push(
      check({
        checkId: "ai_needs_website",
        category: "ai",
        status: "fail",
        points: 0,
        maxPoints: 12,
        severity: "high",
        title: "Bez webu vás AI skoro nenajde",
        description:
          "Asistenti (ChatGPT, Gemini, Perplexity…) čerpají hlavně z veřejného webu a strukturovaných dat. Bez něj zůstáváte v mapách a sociálních sítích.",
        recommendation:
          "Mějte jednoduchý web se jménem salonu, městem, službami, kontaktem a rezervací — to AI i zákazníci umí citovat.",
        source: "answers",
        ease: 2,
        impact: 5,
      }),
    );
    return checks;
  }

  if (!page || page.fetchError) {
    checks.push(
      check({
        checkId: "ai_website_unreadable",
        category: "ai",
        status: "unknown",
        points: 0,
        maxPoints: 10,
        severity: "none",
        title: "Připravenost pro AI",
        description:
          "Obsah webu jsme nenačetli — připravenost pro AI zatím nehodnotíme.",
        recommendation: null,
        source: "website_fetch",
      }),
    );
    return checks;
  }

  // Structured data for machines
  if (page.hasLocalBusinessSchema) {
    checks.push(
      check({
        checkId: "ai_structured_business",
        category: "ai",
        status: "pass",
        points: 10,
        maxPoints: 10,
        severity: "none",
        title: "Strojově čitelný profil salonu",
        description:
          "Na webu jsou strukturovaná data o podniku — AI a vyhledávače snáz pochopí, že jde o salon, kde jste a jak vás kontaktovat.",
        recommendation: null,
        source: "website_fetch",
        value: page.jsonLdTypes.slice(0, 3).join(", ") || true,
      }),
    );
  } else {
    checks.push(
      check({
        checkId: "ai_structured_business",
        category: "ai",
        status: "fail",
        points: 0,
        maxPoints: 10,
        severity: "high",
        title: "Chybí strojově čitelný profil salonu",
        description:
          "Bez strukturovaných dat (typ podniku, adresa, telefon) AI hůř pozná, že jste kadeřnictví a kde přesně sídlíte.",
        recommendation:
          "Doplňte na web údaje o salonu ve formátu, kterému rozumí vyhledávače i AI (název, adresa, telefon, otevírací doba, odkaz na rezervaci).",
        source: "website_fetch",
        ease: 3,
        impact: 5,
      }),
    );
  }

  // Clear facts AI can quote
  const hasNap =
    Boolean(page.title || page.h1.length) &&
    page.phones.length > 0 &&
    page.hasAddressMention === true;

  checks.push(
    check({
      checkId: "ai_clear_facts",
      category: "ai",
      status: hasNap ? "pass" : "partial",
      points: hasNap ? 6 : 2,
      maxPoints: 6,
      severity: hasNap ? "none" : "medium",
      title: hasNap
        ? "Jasné údaje, které AI může citovat"
        : "Údaje pro AI nejsou kompletní",
      description: hasNap
        ? "Na webu je dohromady jméno, kontakt a zmínka o adrese — to asistenti rádi citují."
        : "Aby vás AI doporučila správně, potřebuje na jednom místě jméno salonu, telefon a adresu / město.",
      recommendation: hasNap
        ? null
        : "Dejte do hlavičky nebo patičky jméno salonu, telefon a celou adresu — stejně na Googlu i Firmy.cz.",
      source: "website_fetch",
      ease: 5,
      impact: 4,
    }),
  );

  // Services / prices = answerable questions
  const answerable =
    page.hasServicesMention === true || page.hasPrices === true;
  checks.push(
    check({
      checkId: "ai_answerable_services",
      category: "ai",
      status: answerable ? "pass" : "fail",
      points: answerable ? 6 : 0,
      maxPoints: 6,
      severity: answerable ? "none" : "medium",
      title: answerable
        ? "Služby, na které se AI umí zeptat"
        : "Chybí služby / ceny, které AI cituje",
      description: answerable
        ? "Na webu jsou služby nebo ceny — asistent umí odpovědět na „kolik stojí střih“ nebo „děláte melír“."
        : "Bez přehledu služeb a orientačních cen AI nemá co doporučit konkrétního.",
      recommendation: answerable
        ? null
        : "Zveřejněte hlavní služby a orientační ceny srozumitelným textem (ne jen v obrázku).",
      source: "website_fetch",
      ease: 4,
      impact: 4,
    }),
  );

  // FAQ helps AI Q&A
  if (page.hasFaqSchema) {
    checks.push(
      check({
        checkId: "ai_faq",
        category: "ai",
        status: "pass",
        points: 4,
        maxPoints: 4,
        severity: "none",
        title: "Časté otázky pro AI i zákazníky",
        description:
          "Na webu jsou strukturované otázky a odpovědi — AI je umí použít při doporučení.",
        recommendation: null,
        source: "website_fetch",
      }),
    );
  } else {
    checks.push(
      check({
        checkId: "ai_faq",
        category: "ai",
        status: "partial",
        points: 1,
        maxPoints: 4,
        severity: "low",
        title: "Bez častých otázek na webu",
        description:
          "Krátké FAQ (parkování, dárkové poukazy, děti, svatby…) pomáhá AI i lidem rozhodnout se dřív, než zavolají.",
        recommendation:
          "Přidejte 5–8 častých otázek s jasnými odpověďmi přímo na web.",
        source: "website_fetch",
        ease: 4,
        impact: 3,
      }),
    );
  }

  // Open Graph = cleaner sharing into AI / social contexts
  checks.push(
    check({
      checkId: "ai_share_preview",
      category: "ai",
      status: page.hasOpenGraph ? "pass" : "partial",
      points: page.hasOpenGraph ? 3 : 1,
      maxPoints: 3,
      severity: page.hasOpenGraph ? "none" : "low",
      title: page.hasOpenGraph
        ? "Náhled webu při sdílení"
        : "Chybí náhled webu při sdílení",
      description: page.hasOpenGraph
        ? "Web má připravený název a popis pro sdílení — působí důvěryhodněji i mimo Google."
        : "Bez náhledu (název + popis + obrázek) vypadáte při sdílení a v některých AI přehledech anonymně.",
      recommendation: page.hasOpenGraph
        ? null
        : "Nastavte název, krátký popis a úvodní fotku salonu pro sdílení odkazu.",
      source: "website_fetch",
      ease: 4,
      impact: 2,
    }),
  );

  // llms.txt — emerging signal
  if (llmsTxt === true) {
    checks.push(
      check({
        checkId: "ai_llms_txt",
        category: "ai",
        status: "pass",
        points: 3,
        maxPoints: 3,
        severity: "none",
        title: "Soubor pro AI asistenty",
        description:
          "Na webu je soubor, který AI říká, co je důležité vědět o salonu.",
        recommendation: null,
        source: "website_fetch",
        value: true,
      }),
    );
  } else if (llmsTxt === false) {
    checks.push(
      check({
        checkId: "ai_llms_txt",
        category: "ai",
        status: "partial",
        points: 0,
        maxPoints: 3,
        severity: "low",
        title: "Bez krátkého přehledu pro AI",
        description:
          "Stále novější věc: jednoduchý textový soubor na webu shrne salon pro AI asistenty.",
        recommendation:
          "Až budete ladit web, zvažte krátký přehled salonu určený pro AI (kdo jste, kde, služby, rezervace).",
        source: "website_fetch",
        ease: 3,
        impact: 2,
      }),
    );
  }

  return checks;
};
