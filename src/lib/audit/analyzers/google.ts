import { check, type Analyzer } from "@/lib/audit/analyzers/types";

export const analyzeGoogle: Analyzer = (ctx) => {
  const { place, answers, websiteProbe } = ctx;
  const checks = [];
  const placesConfigured = Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());

  if (!place || !place.placeId) {
    checks.push(
      check({
        checkId: "google_profile",
        category: "google",
        status: "unknown",
        points: 0,
        maxPoints: 12,
        severity: "none",
        title: "Google Business Profile",
        description: placesConfigured
          ? "Google profil jsme automaticky nenašli. Neznamená to, že neexistuje — zkuste vybrat salon z našeptávače nebo vložit odkaz na Google Maps."
          : "Automatické ověření Google profilu zatím není aktivní (chybí napojení Places API). Skóre v této oblasti proto nesnižujeme.",
        recommendation: null,
        source: "places",
      }),
    );
    return checks;
  }

  // Place found with id but possibly incomplete snapshot (from answers only)
  const fromAnswersOnly = !place.formattedAddress && !place.phone && !place.website;

  checks.push(
    check({
      checkId: "google_profile",
      category: "google",
      status: "pass",
      points: 12,
      maxPoints: 12,
      severity: "none",
      title: "Google Business Profile",
      description: `Našli jsme profil „${place.name || answers.salonName || "salon"}“ na Google.`,
      recommendation: null,
      source: fromAnswersOnly ? "answers" : "places",
      value: place.placeId,
    }),
  );

  if (place.website || place.phone || place.formattedAddress) {
    const googleUrlBroken = Boolean(
      place.website && websiteProbe && !websiteProbe.ok,
    );

    if (place.website && googleUrlBroken) {
      checks.push(
        check({
          checkId: "google_website_link",
          category: "google",
          status: "fail",
          points: 0,
          maxPoints: 4,
          severity: "high",
          title: "Odkaz na web v Google profilu nefunguje",
          description: websiteProbe?.hasDiacriticsInHost
            ? `V profilu je „${place.website}“ — doména s diakritikou nejde otevřít.`
            : `V profilu je „${place.website}“, ale stránka není dostupná.`,
          recommendation: websiteProbe?.suggestedUrl
            ? `Nahraďte odkaz za ${websiteProbe.suggestedUrl} (stejně na Firmy.cz).`
            : "Opravte odkaz na web v Google Business Profile.",
          source: "website_probe",
          value: place.website,
          ease: 5,
          impact: 5,
        }),
      );
    } else {
      checks.push(
        check({
          checkId: "google_website_link",
          category: "google",
          status: place.website ? "pass" : "fail",
          points: place.website ? 4 : 0,
          maxPoints: 4,
          severity: place.website ? "none" : "medium",
          title: "Web v Google profilu",
          description: place.website
            ? "V Google profilu je uveden web."
            : "V Google profilu chybí odkaz na web.",
          recommendation: place.website
            ? null
            : "Doplňte web do Google Business Profile.",
          source: "places",
          value: place.website,
          ease: 5,
          impact: 3,
        }),
      );
    }

    checks.push(
      check({
        checkId: "google_phone",
        category: "google",
        status: place.phone ? "pass" : "partial",
        points: place.phone ? 3 : 0,
        maxPoints: 3,
        severity: place.phone ? "none" : "medium",
        title: "Telefon v Google profilu",
        description: place.phone
          ? "Telefon je v profilu vyplněný."
          : "V Google profilu chybí telefon.",
        recommendation: place.phone
          ? null
          : "Doplňte telefon, na který se zákazníci dovolají.",
        source: "places",
        ease: 5,
        impact: 3,
      }),
    );

    checks.push(
      check({
        checkId: "google_address",
        category: "google",
        status: place.formattedAddress ? "pass" : "fail",
        points: place.formattedAddress ? 3 : 0,
        maxPoints: 3,
        severity: place.formattedAddress ? "none" : "high",
        title: "Adresa",
        description: place.formattedAddress
          ? `Adresa: ${place.formattedAddress}`
          : "V profilu chybí adresa.",
        recommendation: place.formattedAddress
          ? null
          : "Doplňte a ověřte adresu salonu na Googlu.",
        source: "places",
        ease: 4,
        impact: 4,
      }),
    );
  } else {
    // Limited snapshot — don't invent fail for missing website/phone
    for (const item of [
      ["google_website_link", "Web v Google profilu", 4],
      ["google_phone", "Telefon v Google profilu", 3],
      ["google_address", "Adresa", 3],
    ] as const) {
      checks.push(
        check({
          checkId: item[0],
          category: "google",
          status: "unknown",
          points: 0,
          maxPoints: item[2],
          severity: "none",
          title: item[1],
          description: "Detail profilu jsme zatím plně nenačetli.",
          recommendation: null,
          source: "places",
        }),
      );
    }
  }

  return checks;
};

export const analyzeReviews: Analyzer = (ctx) => {
  const { place, answers } = ctx;
  const rating = place?.rating ?? answers.googleRating ?? null;
  const count =
    place?.reviewsCount ?? answers.googleReviewsCount ?? null;
  const checks = [];

  if (rating == null || count == null) {
    const placesConfigured = Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());
    checks.push(
      check({
        checkId: "reviews_presence",
        category: "reviews",
        status: "unknown",
        points: 0,
        maxPoints: 15,
        severity: "none",
        title: "Google recenze",
        description: placesConfigured
          ? "Počet a hodnocení recenzí jsme neověřili. Vyberte salon z našeptávače nebo vložte odkaz na Google Maps."
          : "Recenze jsme neověřili automaticky — chybí napojení na Google Places API. Skóre nesnižujeme.",
        recommendation: null,
        source: "places",
      }),
    );
    return checks;
  }

  const ratingPoints =
    rating >= 4.7 ? 10 : rating >= 4.3 ? 8 : rating >= 4.0 ? 5 : rating >= 3.5 ? 2 : 0;
  checks.push(
    check({
      checkId: "reviews_rating",
      category: "reviews",
      status: rating >= 4.3 ? "pass" : rating >= 3.8 ? "partial" : "fail",
      points: ratingPoints,
      maxPoints: 10,
      severity: rating >= 4.3 ? "none" : rating >= 3.8 ? "medium" : "high",
      title: "Google hodnocení",
      description: `${rating.toFixed(1)} ★ z ${count} recenzí${
        rating >= 4.5 ? " vytváří velmi dobrou důvěryhodnost." : "."
      }`,
      recommendation:
        rating < 4.3
          ? "Zaměřte se na zkušenost zákazníků a aktivní práci s ohlasy."
          : null,
      source: "places",
      value: rating,
      impact: 5,
      ease: 2,
    }),
  );

  const countPoints =
    count >= 80 ? 10 : count >= 40 ? 8 : count >= 15 ? 5 : count >= 5 ? 3 : 1;
  checks.push(
    check({
      checkId: "reviews_count",
      category: "reviews",
      status: count >= 40 ? "pass" : count >= 15 ? "partial" : "fail",
      points: countPoints,
      maxPoints: 10,
      severity: count >= 40 ? "none" : count >= 15 ? "medium" : "high",
      title: "Počet recenzí",
      description:
        count >= 40
          ? `Máte ${count} recenzí — solidní sociální důkaz.`
          : `Máte ${count} recenzí. Více hodnocení zvyšuje důvěru nových zákazníků.`,
      recommendation:
        count < 40
          ? "Po návštěvě dejte spokojeným zákazníkům jednoduchou možnost salon ohodnotit (odkaz / QR)."
          : null,
      source: "places",
      value: count,
      ease: 4,
      impact: 4,
    }),
  );

  return checks;
};
