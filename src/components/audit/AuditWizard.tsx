"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackEvent, trackMetaLead } from "@/lib/analytics";
import { getStoredAttribution, setSourceDetail } from "@/lib/attribution";
import type {
  AuditAnswers,
  BookingMethod,
  DirectoryPlatform,
  SocialPlatform,
} from "@/lib/audit/types";

type PlaceSuggestion = {
  placeId: string;
  name: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  mapsUrl: string | null;
  rating: number | null;
  reviewsCount: number | null;
};

const TOTAL_STEPS = 6;

const DIRECTORY_OPTIONS: { id: DirectoryPlatform; label: string }[] = [
  { id: "firmy_cz", label: "Firmy.cz" },
  { id: "mapy_cz", label: "Mapy.cz" },
  { id: "kdomestriha", label: "kdomestriha.cz" },
  { id: "zlate_stranky", label: "Zlaté stránky" },
  { id: "other", label: "Jiný katalog" },
  { id: "none", label: "Nikde z toho nejsme" },
];

const BOOKING_OPTIONS: { id: BookingMethod; label: string }[] = [
  { id: "online", label: "Online rezervační systém" },
  { id: "phone", label: "Telefon" },
  { id: "instagram", label: "Instagram / Messenger" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "E-mail" },
  { id: "in_person", label: "Osobně" },
  { id: "other", label: "Jinak" },
];

const BOOKING_PROVIDER_OPTIONS = [
  "Reservio",
  "Fresha",
  "Bookio",
  "Noona",
  "SimplyBook",
  "Treatwell",
  "Vlastní systém",
] as const;

function isKnownBookingProvider(value: string | undefined | null): boolean {
  return (
    !!value &&
    (BOOKING_PROVIDER_OPTIONS as readonly string[]).includes(value)
  );
}

const SOCIAL_OPTIONS: { id: SocialPlatform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "other", label: "Jinde" },
  { id: "none", label: "Sociální sítě nepoužíváme" },
];

const ANALYZE_STEPS = [
  "Kontrolujeme web",
  "Měříme rychlost webu na telefonu",
  "Hledáme vás na Googlu",
  "Kontrolujeme Firmy.cz a Mapy.cz",
  "Hodnotíme připravenost pro AI",
  "Kontrolujeme recenze",
  "Kontrolujeme sociální sítě",
  "Prověřujeme rezervace",
  "Vyhodnocujeme online prezentaci",
] as const;

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-14 rounded-[18px] px-5 py-4 text-left text-[16px] font-medium tracking-tight transition ${
        selected
          ? "bg-ink text-foam"
          : "bg-foam text-ink hover:bg-[#f0eee8]"
      }`}
    >
      {children}
    </button>
  );
}

function MultiChoice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[15px] transition ${
        selected
          ? "bg-ink text-foam"
          : "bg-foam text-ink hover:bg-[#f0eee8]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
          selected ? "border-foam/40 bg-copper text-white" : "border-ink/20"
        }`}
        aria-hidden
      >
        {selected ? "✓" : ""}
      </span>
      {children}
    </button>
  );
}

const initialAnswers: Partial<AuditAnswers> = {
  bookingMethods: [],
  socialPlatforms: [],
  directoryPlatforms: [],
  hasWebsite: null,
  consent: false as unknown as true,
};

export function AuditWizard() {
  const router = useRouter();
  const formStartedAt = useRef(Date.now());
  const startedTracked = useRef(false);

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<AuditAnswers>>(initialAnswers);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"form" | "analyzing" | "done">("form");
  const [analyzeIndex, setAnalyzeIndex] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placesAvailable, setPlacesAvailable] = useState<boolean | null>(null);
  const [placesHint, setPlacesHint] = useState<string | null>(null);
  const [placeSelected, setPlaceSelected] = useState(false);
  const [bookingProviderOther, setBookingProviderOther] = useState(false);

  useEffect(() => {
    setSourceDetail("online_audit");
    if (!startedTracked.current) {
      startedTracked.current = true;
      trackEvent("audit_started", { location: "wizard" });
    }
  }, []);

  useEffect(() => {
    const q = [answers.salonName, answers.city].filter(Boolean).join(" ").trim();
    if (step !== 1 || q.length < 3 || placeSelected) {
      if (step !== 1) setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/audit/places?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setPlacesAvailable(Boolean(data.available));
        setSuggestions(data.suggestions || []);
        if (data.error === "api_blocked" || data.error === "missing_key") {
          setPlacesHint(
            data.message ||
              "Automatické hledání na Google teď nefunguje. Vložte odkaz na Google Maps.",
          );
        } else if (data.available && (data.suggestions || []).length === 0) {
          setPlacesHint(null);
        } else {
          setPlacesHint(null);
        }
      } catch {
        setPlacesAvailable(false);
        setSuggestions([]);
        setPlacesHint("Nepodařilo se spojit s Google hledáním.");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [answers.salonName, answers.city, step, placeSelected]);

  function patch(partial: Partial<AuditAnswers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
    setError(null);
  }

  function selectPlace(place: PlaceSuggestion) {
    patch({
      salonName: place.name || answers.salonName || "",
      city: place.city || answers.city || "",
      address: place.address || undefined,
      googlePlaceId: place.placeId,
      googleMapsUrl: place.mapsUrl || undefined,
      googleRating: place.rating,
      googleReviewsCount: place.reviewsCount,
      suggestedWebsite: place.website,
      websiteUrl: answers.websiteUrl || place.website || undefined,
      hasWebsite:
        answers.hasWebsite ?? (place.website ? true : answers.hasWebsite),
    });
    setPlaceSelected(true);
    trackEvent("audit_business_selected");
    setSuggestions([]);
  }

  function clearSelectedPlace() {
    setPlaceSelected(false);
    patch({
      googlePlaceId: undefined,
      googleMapsUrl: undefined,
      googleRating: null,
      googleReviewsCount: null,
      suggestedWebsite: null,
    });
  }

  function toggleBooking(id: BookingMethod) {
    const current = answers.bookingMethods || [];
    const next = current.includes(id)
      ? current.filter((m) => m !== id)
      : [...current, id];
    if (id === "online" && !next.includes("online")) {
      setBookingProviderOther(false);
      patch({ bookingMethods: next, bookingProvider: undefined });
      return;
    }
    patch({ bookingMethods: next });
  }

  function selectBookingProvider(name: string) {
    setBookingProviderOther(false);
    patch({ bookingProvider: name });
  }

  function selectBookingProviderOther() {
    setBookingProviderOther(true);
    if (isKnownBookingProvider(answers.bookingProvider)) {
      patch({ bookingProvider: "" });
    }
  }

  function toggleSocial(id: SocialPlatform) {
    let current = answers.socialPlatforms || [];
    if (id === "none") {
      patch({ socialPlatforms: current.includes("none") ? [] : ["none"] });
      return;
    }
    current = current.filter((p) => p !== "none");
    const next = current.includes(id)
      ? current.filter((p) => p !== id)
      : [...current, id];
    patch({ socialPlatforms: next });
  }

  function validateStep(): boolean {
    if (step === 1) {
      if (!answers.salonName || answers.salonName.trim().length < 2) {
        setError("Vyplňte název salonu.");
        return false;
      }
      if (!answers.city || answers.city.trim().length < 2) {
        setError("Vyplňte město.");
        return false;
      }
    }
    if (step === 2) {
      if (answers.hasWebsite === null) {
        setError("Vyberte, zda má salon vlastní web.");
        return false;
      }
      if (answers.hasWebsite && !answers.websiteUrl?.trim()) {
        setError("Doplňte adresu webu.");
        return false;
      }
    }
    if (step === 3) {
      if (!answers.bookingMethods?.length) {
        setError("Vyberte alespoň jeden způsob rezervace.");
        return false;
      }
    }
    if (step === 4) {
      if (!answers.socialPlatforms?.length) {
        setError("Vyberte alespoň jednu možnost.");
        return false;
      }
    }
    if (step === 5) {
      if (!answers.remindVisits || !answers.reactivateCustomers || !answers.paidAds || !answers.knowSources) {
        setError("Odpovězte prosím na všechny otázky.");
        return false;
      }
    }
    if (step === 6) {
      if (!answers.name || answers.name.trim().length < 2) {
        setError("Vyplňte jméno.");
        return false;
      }
      if (!answers.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) {
        setError("Vyplňte platný e-mail.");
        return false;
      }
      if (!answers.consent) {
        setError("Pro vytvoření auditu je potřeba souhlas.");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    trackEvent("audit_step_completed", { step });
    if (step === 5) trackEvent("audit_contact_reached");
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    void submit();
  }

  function back() {
    setError(null);
    if (step > 1) setStep((s) => s - 1);
  }

  async function submit() {
    if (!validateStep()) return;
    setPhase("analyzing");
    setAnalyzeIndex(0);

    const timers: number[] = [];
    // PageSpeed often takes 20–40s — pace the checklist so it feels busy.
    const stepMs = 2800;
    ANALYZE_STEPS.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setAnalyzeIndex(i + 1), stepMs * (i + 1)),
      );
    });

    try {
      const attribution = getStoredAttribution();
      const payload = {
        answers: {
          ...answers,
          salonName: answers.salonName!.trim(),
          city: answers.city!.trim(),
          name: answers.name!.trim(),
          email: answers.email!.trim(),
          consent: true as const,
          bookingMethods: answers.bookingMethods || [],
          socialPlatforms: answers.socialPlatforms || [],
          directoryPlatforms: answers.directoryPlatforms || [],
          hasWebsite: answers.hasWebsite ?? null,
        },
        companyWebsite: honeypot,
        formStartedAt: formStartedAt.current,
        sourceDetail: "online_audit",
        attribution: attribution
          ? { first: attribution.first, last: attribution.last }
          : undefined,
      };

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok || !data.id || data.id === "ignored") {
        timers.forEach(clearTimeout);
        setPhase("form");
        setError(data.error || "Něco se nepovedlo. Zkuste to znovu.");
        return;
      }

      trackEvent("audit_completed", { score: data.score });
      if (typeof data.leadId === "string") {
        trackMetaLead({ eventId: data.leadId });
      }

      // Let animation finish briefly if API returned early
      await new Promise((r) =>
        setTimeout(r, Math.max(0, stepMs * (ANALYZE_STEPS.length + 1) - 8000)),
      );
      setPhase("done");
      router.push(`/audit/${data.id}`);
    } catch {
      timers.forEach(clearTimeout);
      setPhase("form");
      setError("Něco se nepovedlo. Zkuste to znovu.");
    }
  }

  if (phase === "analyzing" || phase === "done") {
    const checklistDone = analyzeIndex >= ANALYZE_STEPS.length;
    const finalDone = phase === "done";
    const finalActive = checklistDone && !finalDone;

    return (
      <section className="px-[clamp(1.25rem,4vw,3rem)] py-[clamp(4rem,10vw,8rem)]">
        <div className="mx-auto max-w-[560px]">
          <p className="eyebrow mb-4">HAIRWEB Audit</p>
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold tracking-tight text-ink">
            {phase === "done" ? "Audit je připraven." : "Analyzujeme váš salon…"}
          </h1>
          <ul className="mt-10 space-y-4">
            {ANALYZE_STEPS.map((label, index) => {
              const done = analyzeIndex > index;
              const active = analyzeIndex === index;
              return (
                <li
                  key={label}
                  className={`flex items-center gap-3 text-[16px] transition ${
                    done
                      ? "text-ink"
                      : active
                        ? "text-ink"
                        : "text-ink-muted"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      done
                        ? "bg-copper text-white"
                        : active
                          ? "bg-mist text-copper"
                          : "bg-mist text-ink-muted"
                    }`}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  {label}
                </li>
              );
            })}
            <li
              className={`flex items-center gap-3 text-[16px] transition ${
                finalDone || finalActive ? "text-ink" : "text-ink-muted"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  finalDone
                    ? "bg-copper text-white"
                    : finalActive
                      ? "bg-mist text-copper"
                      : "bg-mist text-ink-muted"
                }`}
                aria-hidden
              >
                {finalDone ? (
                  "✓"
                ) : finalActive ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-copper/25 border-t-copper" />
                ) : (
                  ANALYZE_STEPS.length + 1
                )}
              </span>
              Vytváříme analýzu…
            </li>
          </ul>
          <p className="mt-8 text-sm text-ink-muted">
            Kontrolujeme jen to, co dokážeme ověřit. Neověřené body skóre
            nesnižují.
          </p>
        </div>
      </section>
    );
  }

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <section className="px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2.5rem,6vw,4.5rem)]">
      <div className="mx-auto max-w-[640px]">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-sm text-ink-soft">
            <span>Audit salonu</span>
            <span className="font-[family-name:var(--font-geist-mono)] text-xs tabular-nums">
              {step} / {TOTAL_STEPS}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-copper transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {step === 1 ? (
          <div className="flex flex-col gap-6">
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Začněme vaším salonem.
            </h1>
            <p className="text-[16px] text-ink-soft">
              Řekněte nám, který salon je váš. Zbytek zjistíme za vás.
            </p>
            <div className="relative flex flex-col gap-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink">Název salonu *</span>
                <input
                  className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                  value={answers.salonName || ""}
                  onChange={(e) => {
                    setPlaceSelected(false);
                    patch({ salonName: e.target.value, googlePlaceId: undefined });
                  }}
                  placeholder="Začněte psát název salonu…"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={
                    Boolean(
                      placesAvailable &&
                        suggestions.length > 0 &&
                        !placeSelected,
                    )
                  }
                  aria-controls="salon-suggestions"
                  aria-autocomplete="list"
                />
              </label>

              {placesAvailable && suggestions.length > 0 && !placeSelected ? (
                <ul
                  id="salon-suggestions"
                  role="listbox"
                  className="z-20 -mt-1 max-h-72 overflow-auto rounded-[18px] border border-ink/10 bg-foam p-2 shadow-[var(--shadow-soft)]"
                >
                  {suggestions.map((s) => (
                    <li key={s.placeId} role="option">
                      <button
                        type="button"
                        onClick={() => selectPlace(s)}
                        className="w-full rounded-[14px] px-3 py-3 text-left transition hover:bg-mist"
                      >
                        <span className="block font-medium text-ink">
                          {s.name}
                        </span>
                        <span className="block text-sm text-ink-soft">
                          {s.address}
                          {s.rating != null
                            ? ` · ${s.rating.toFixed(1)} ★ (${s.reviewsCount ?? 0})`
                            : ""}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {placeSelected && answers.googlePlaceId ? (
                <div className="rounded-[18px] border border-copper/25 bg-mist px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {answers.salonName}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {answers.address || answers.city}
                        {answers.googleRating != null
                          ? ` · ${answers.googleRating.toFixed(1)} ★`
                          : ""}
                        {answers.googleReviewsCount != null
                          ? ` · ${answers.googleReviewsCount} recenzí`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedPlace}
                      className="shrink-0 text-sm font-medium text-copper"
                    >
                      Změnit
                    </button>
                  </div>
                </div>
              ) : null}

              {placesAvailable === false || placesHint ? (
                <p className="text-sm text-ink-muted">
                  {placesHint ||
                    "Automatické hledání na Google teď není aktivní."}
                </p>
              ) : null}
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Město *</span>
              <input
                className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                value={answers.city || ""}
                onChange={(e) => {
                  setPlaceSelected(false);
                  patch({ city: e.target.value, googlePlaceId: undefined });
                }}
                placeholder="Např. Praha"
                autoComplete="address-level2"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">
                Adresa <span className="text-ink-muted">(nepovinné)</span>
              </span>
              <input
                className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                value={answers.address || ""}
                onChange={(e) => {
                  setPlaceSelected(false);
                  patch({ address: e.target.value });
                }}
                placeholder="Ulice a číslo"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">
                Odkaz na Google Maps{" "}
                <span className="text-ink-muted">(nepovinné)</span>
              </span>
              <input
                className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                value={answers.googleMapsUrl || ""}
                onChange={(e) => {
                  setPlaceSelected(false);
                  patch({
                    googleMapsUrl: e.target.value,
                    googlePlaceId: undefined,
                  });
                }}
                placeholder="https://maps.google.com/…"
                inputMode="url"
              />
            </label>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-ink">
                Kde jinde vás zákazníci hledají?
              </p>
              <p className="text-sm text-ink-soft">
                Firmy.cz, Mapy.cz, kdomestriha.cz… Označte, kde máte zápis.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {DIRECTORY_OPTIONS.map((opt) => {
                  const selected = (answers.directoryPlatforms || []).includes(
                    opt.id,
                  );
                  return (
                    <MultiChoice
                      key={opt.id}
                      selected={selected}
                      onClick={() => {
                        const current = answers.directoryPlatforms || [];
                        if (opt.id === "none") {
                          patch({
                            directoryPlatforms: selected ? [] : ["none"],
                          });
                          return;
                        }
                        const withoutNone = current.filter((p) => p !== "none");
                        patch({
                          directoryPlatforms: selected
                            ? withoutNone.filter((p) => p !== opt.id)
                            : [...withoutNone, opt.id],
                        });
                      }}
                    >
                      {opt.label}
                    </MultiChoice>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-6">
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Má váš salon vlastní web?
            </h1>
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceButton
                selected={answers.hasWebsite === true}
                onClick={() =>
                  patch({
                    hasWebsite: true,
                    websiteUrl:
                      answers.websiteUrl ||
                      answers.suggestedWebsite ||
                      undefined,
                  })
                }
              >
                Ano
              </ChoiceButton>
              <ChoiceButton
                selected={answers.hasWebsite === false}
                onClick={() =>
                  patch({
                    hasWebsite: false,
                    websiteUrl: undefined,
                    websiteBooking: undefined,
                  })
                }
              >
                Ne
              </ChoiceButton>
            </div>
            {answers.hasWebsite ? (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">
                    Adresa webu
                    {answers.suggestedWebsite ? " — potvrďte nebo upravte" : ""}
                  </span>
                  <input
                    className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                    value={answers.websiteUrl || ""}
                    onChange={(e) => patch({ websiteUrl: e.target.value })}
                    placeholder="www.vas-salon.cz"
                    inputMode="url"
                  />
                </label>
                <div>
                  <p className="mb-3 text-sm font-medium text-ink">
                    Můžou se zákazníci přes web dostat přímo k rezervaci?
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["yes", "Ano"],
                        ["no", "Ne"],
                        ["unknown", "Nevím"],
                      ] as const
                    ).map(([value, label]) => (
                      <ChoiceButton
                        key={value}
                        selected={answers.websiteBooking === value}
                        onClick={() => patch({ websiteBooking: value })}
                      >
                        {label}
                      </ChoiceButton>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-6">
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Jak dnes zákazníci nejčastěji rezervují termín?
            </h1>
            <p className="text-[15px] text-ink-soft">Můžete vybrat více možností.</p>
            <div className="grid gap-2">
              {BOOKING_OPTIONS.map((opt) => (
                <MultiChoice
                  key={opt.id}
                  selected={(answers.bookingMethods || []).includes(opt.id)}
                  onClick={() => toggleBooking(opt.id)}
                >
                  {opt.label}
                </MultiChoice>
              ))}
            </div>
            {(answers.bookingMethods || []).includes("online") ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-ink">
                  Jaký rezervační systém používáte?
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BOOKING_PROVIDER_OPTIONS.map((name) => (
                    <ChoiceButton
                      key={name}
                      selected={
                        !bookingProviderOther &&
                        answers.bookingProvider === name
                      }
                      onClick={() => selectBookingProvider(name)}
                    >
                      {name}
                    </ChoiceButton>
                  ))}
                  <ChoiceButton
                    selected={
                      bookingProviderOther ||
                      (!!answers.bookingProvider &&
                        !isKnownBookingProvider(answers.bookingProvider))
                    }
                    onClick={selectBookingProviderOther}
                  >
                    Jiný
                  </ChoiceButton>
                </div>
                {bookingProviderOther ||
                (!!answers.bookingProvider &&
                  !isKnownBookingProvider(answers.bookingProvider)) ? (
                  <input
                    className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                    value={
                      isKnownBookingProvider(answers.bookingProvider)
                        ? ""
                        : answers.bookingProvider || ""
                    }
                    onChange={(e) =>
                      patch({ bookingProvider: e.target.value })
                    }
                    placeholder="Název systému…"
                    autoFocus
                  />
                ) : null}
              </div>
            ) : null}
            <div>
              <p className="mb-3 text-sm font-medium text-ink">
                Mohou zákazníci rezervovat termín online 24/7?
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["yes", "Ano"],
                    ["no", "Ne"],
                    ["unknown", "Nevím"],
                  ] as const
                ).map(([value, label]) => (
                  <ChoiceButton
                    key={value}
                    selected={answers.booking247 === value}
                    onClick={() => patch({ booking247: value })}
                  >
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="flex flex-col gap-6">
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Kde je váš salon aktivní?
            </h1>
            <div className="grid gap-2">
              {SOCIAL_OPTIONS.map((opt) => (
                <MultiChoice
                  key={opt.id}
                  selected={(answers.socialPlatforms || []).includes(opt.id)}
                  onClick={() => toggleSocial(opt.id)}
                >
                  {opt.label}
                </MultiChoice>
              ))}
            </div>
            {(answers.socialPlatforms || []).includes("instagram") ? (
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink">Instagram</span>
                <input
                  className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                  value={answers.instagramHandle || ""}
                  onChange={(e) => patch({ instagramHandle: e.target.value })}
                  placeholder="@vas_salon"
                />
              </label>
            ) : null}
            {(answers.socialPlatforms || []).includes("facebook") ? (
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink">
                  Facebook stránka
                </span>
                <input
                  className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                  value={answers.facebookUrl || ""}
                  onChange={(e) => patch({ facebookUrl: e.target.value })}
                  placeholder="URL nebo název stránky"
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="flex flex-col gap-8">
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Zákazníci & marketing
            </h1>
            <div>
              <p className="mb-3 text-sm font-medium text-ink">
                Připomínáte zákazníkům pravidelně další návštěvu?
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["yes", "Ano"],
                    ["no", "Ne"],
                    ["partial", "Částečně"],
                  ] as const
                ).map(([value, label]) => (
                  <ChoiceButton
                    key={value}
                    selected={answers.remindVisits === value}
                    onClick={() => patch({ remindVisits: value })}
                  >
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-ink">
                Pracujete nějak se zákazníky, kteří se dlouho nevrátili?
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["yes", "Ano"],
                    ["no", "Ne"],
                  ] as const
                ).map(([value, label]) => (
                  <ChoiceButton
                    key={value}
                    selected={answers.reactivateCustomers === value}
                    onClick={() => patch({ reactivateCustomers: value })}
                  >
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-ink">
                Používáte placenou online reklamu?
              </p>
              <div className="grid gap-3">
                {(
                  [
                    ["regular", "Ano, pravidelně"],
                    ["occasional", "Občas"],
                    ["no", "Ne"],
                  ] as const
                ).map(([value, label]) => (
                  <ChoiceButton
                    key={value}
                    selected={answers.paidAds === value}
                    onClick={() => patch({ paidAds: value })}
                  >
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-ink">
                Víte, odkud k vám přicházejí noví zákazníci?
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["yes", "Ano"],
                    ["approx", "Přibližně"],
                    ["no", "Ne"],
                  ] as const
                ).map(([value, label]) => (
                  <ChoiceButton
                    key={value}
                    selected={answers.knowSources === value}
                    onClick={() => patch({ knowSources: value })}
                  >
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="flex flex-col gap-6">
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              Kam vám máme poslat kompletní výsledek auditu?
            </h1>
            <p className="text-[16px] text-ink-soft">
              Za e-mail dostanete HAIRWEB SCORE a konkrétní doporučení — ne
              obecný newsletter.
            </p>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Jméno *</span>
              <input
                className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                value={answers.name || ""}
                onChange={(e) => patch({ name: e.target.value })}
                autoComplete="name"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">E-mail *</span>
              <input
                className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                value={answers.email || ""}
                onChange={(e) => patch({ email: e.target.value })}
                type="email"
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">
                Telefon <span className="text-ink-muted">(nepovinné)</span>
              </span>
              <input
                className="min-h-14 rounded-[16px] border border-ink/10 bg-foam px-4 text-[16px] outline-none focus:border-copper"
                value={answers.phone || ""}
                onChange={(e) => patch({ phone: e.target.value })}
                type="tel"
                autoComplete="tel"
              />
            </label>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
              <input
                type="checkbox"
                className="mt-1"
                checked={Boolean(answers.consent)}
                onChange={(e) =>
                  patch({ consent: e.target.checked as unknown as true })
                }
              />
              <span>
                Souhlasím se zpracováním údajů za účelem online auditu dle{" "}
                <Link
                  href="/ochrana-osobnich-udaju"
                  className="underline decoration-copper/40 underline-offset-2"
                >
                  ochrany osobních údajů
                </Link>
                .
              </span>
            </label>
            <input
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              aria-hidden
            />
          </div>
        ) : null}

        {error ? (
          <p className="mt-6 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="min-h-12 rounded-full px-6 text-[15px] font-medium text-ink-soft transition hover:text-ink"
            >
              Zpět
            </button>
          ) : null}
          <button
            type="button"
            onClick={next}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-copper px-8 text-[15px] font-medium text-white transition hover:brightness-110"
          >
            {step === TOTAL_STEPS ? "Vytvořit můj audit →" : "Pokračovat →"}
          </button>
        </div>
      </div>
    </section>
  );
}
