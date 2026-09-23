"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent, trackMetaLead } from "@/lib/analytics";
import {
  getSourceDetail,
  getStoredAttribution,
  setSourceDetail,
  type SourceDetail,
} from "@/lib/attribution";
import {
  LEAD_THANKS_PATH,
  markLeadFormSuccess,
} from "@/lib/leads/thanks-flag";
import { site } from "@/lib/site";

type FieldErrors = Partial<
  Record<"name" | "email" | "website" | "salonName" | "consent" | "form", string>
>;

function isRealLeadId(id: unknown): id is string {
  return typeof id === "string" && id.length >= 8 && id !== "ignored";
}

function LeadFormFields() {
  const searchParams = useSearchParams();
  const started = useRef(false);
  const formStartedAt = useRef(0);
  const metaLeadSent = useRef(false);
  const submitLock = useRef(false);
  const initialPlan = searchParams.get("plan") ?? "";

  const [name, setName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [pkg] = useState(() =>
    initialPlan === "start" || initialPlan === "pro" ? initialPlan : "",
  );
  const [honeypot, setHoneypot] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  useEffect(() => {
    formStartedAt.current = Date.now();
    if (initialPlan === "start") setSourceDetail("pricing_start");
    else if (initialPlan === "pro") setSourceDetail("pricing_pro");
    else if (searchParams.get("audit")) setSourceDetail("online_audit");
    else setSourceDetail("audit");

    const prefillName = searchParams.get("name");
    const prefillEmail = searchParams.get("email");
    const prefillSalon = searchParams.get("salon");
    if (prefillName) setName(prefillName);
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillSalon) setSalonName(prefillSalon);
  }, [initialPlan, searchParams]);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackEvent("lead_form_start");
  }

  function resolveWebsite(): string {
    const web = website.trim();
    if (web.length >= 2) return web;
    const ig = instagram.trim();
    if (ig.length >= 2) {
      return ig.startsWith("@") ? ig : `@${ig.replace(/^@/, "")}`;
    }
    return "";
  }

  function validateClient(): boolean {
    const next: FieldErrors = {};
    if (salonName.trim().length < 2) {
      next.salonName = "Vyplňte název salonu.";
    }
    if (name.trim().length < 2) next.name = "Vyplňte jméno (min. 2 znaky).";
    if (!email.trim()) next.email = "Vyplňte e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Zadejte platný e-mail.";
    }
    if (resolveWebsite().length < 2) {
      next.website = "Přidejte web nebo Instagram.";
    }
    if (!consent) next.consent = "Pro odeslání je potřeba souhlas.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || submitLock.current) return;
    if (!validateClient()) return;

    submitLock.current = true;
    setStatus("loading");
    setErrors({});

    const sourceDetail = (getSourceDetail() || "audit") as SourceDetail;
    const attribution = getStoredAttribution();
    const resolvedWebsite = resolveWebsite();
    const messageNote =
      instagram.trim() && website.trim()
        ? `Instagram: ${instagram.trim()}`
        : undefined;

    const buildBody = (trap: string) => ({
      name,
      salonName,
      email,
      phone,
      website: resolvedWebsite,
      message: messageNote,
      package: pkg || undefined,
      sourceDetail,
      utm: attribution.utm,
      referrer: attribution.referrer,
      landingPage: attribution.landingPage,
      fbclid: attribution.fbclid,
      attribution: {
        firstTouchAt: attribution.firstTouchAt,
        lastTouchAt: attribution.lastTouchAt,
        first: attribution.first,
        last: attribution.last,
      },
      companyWebsite: trap,
      formStartedAt: formStartedAt.current,
    });

    try {
      const post = async (trap: string) => {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildBody(trap)),
        });
        const data = (await response.json()) as {
          error?: string;
          fieldErrors?: Record<string, string>;
          ok?: boolean;
          id?: string;
          package?: string | null;
          sourceDetail?: string | null;
          utm?: {
            utm_source?: string | null;
            utm_medium?: string | null;
            utm_campaign?: string | null;
          };
        };
        return { response, data };
      };

      let { response, data } = await post(honeypot);

      // Autofill sometimes fills the honeypot — retry once without it.
      if (response.ok && data.id === "ignored" && honeypot) {
        setHoneypot("");
        ({ response, data } = await post(""));
      }

      if (!response.ok) {
        if (data.fieldErrors) {
          setErrors({
            name: data.fieldErrors.name,
            email: data.fieldErrors.email,
            website: data.fieldErrors.website,
            form: data.error,
          });
        } else {
          setErrors({ form: data.error || "Něco se nepovedlo." });
        }
        submitLock.current = false;
        setStatus("error");
        return;
      }

      if (!data.ok || !isRealLeadId(data.id)) {
        submitLock.current = false;
        setStatus("error");
        setErrors({
          form: "Něco se nepovedlo. Zkuste formulář odeslat znovu nebo mě kontaktujte e-mailem.",
        });
        return;
      }

      if (!metaLeadSent.current) {
        metaLeadSent.current = true;
        trackMetaLead({ eventId: data.id });
      }

      trackEvent("generate_lead", {
        package: data.package ?? (pkg || undefined),
        source_detail: data.sourceDetail ?? sourceDetail,
        utm_source: data.utm?.utm_source,
        utm_medium: data.utm?.utm_medium,
        utm_campaign: data.utm?.utm_campaign,
      });

      markLeadFormSuccess(data.id);
      window.location.assign(LEAD_THANKS_PATH);
    } catch {
      submitLock.current = false;
      setErrors({
        form: "Něco se nepovedlo. Zkuste formulář odeslat znovu nebo mě kontaktujte e-mailem.",
      });
      setStatus("error");
    }
  }

  const fieldClass =
    "w-full border-0 border-b border-ink/18 bg-transparent px-0 py-2 text-[17px] text-ink outline-none transition placeholder:text-ink-faint focus:border-copper disabled:opacity-60";
  const errorClass = "border-copper-deep";
  const disabled = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={markStarted}
      className="relative flex flex-col gap-6 rounded-[26px] bg-foam p-6 sm:gap-7 sm:p-8 lg:p-12"
      noValidate
    >
      <div
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      >
        <label>
          Fax number
          <input
            type="text"
            name="fax_number_hp"
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm sm:col-span-2">
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.12em] text-ink-soft">
            Název salonu
          </span>
          <input
            required
            name="salonName"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            className={`${fieldClass} ${errors.salonName ? errorClass : ""}`}
            autoComplete="organization"
            aria-invalid={Boolean(errors.salonName)}
            disabled={disabled}
          />
          {errors.salonName ? (
            <span className="text-xs text-copper-deep">{errors.salonName}</span>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm sm:col-span-2">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Web
          </span>
          <input
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="www.vas-salon.cz"
            className={`${fieldClass} ${errors.website ? errorClass : ""}`}
            aria-invalid={Boolean(errors.website)}
            disabled={disabled}
          />
          {errors.website ? (
            <span className="text-xs text-copper-deep">{errors.website}</span>
          ) : (
            <span className="text-xs text-ink-soft">
              Pokud web nemáte, stačí Instagram.
            </span>
          )}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Jméno
          </span>
          <input
            required
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${fieldClass} ${errors.name ? errorClass : ""}`}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            disabled={disabled}
          />
          {errors.name ? (
            <span className="text-xs text-copper-deep">{errors.name}</span>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            E-mail
          </span>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${fieldClass} ${errors.email ? errorClass : ""}`}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            disabled={disabled}
          />
          {errors.email ? (
            <span className="text-xs text-copper-deep">{errors.email}</span>
          ) : null}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Telefon <span className="font-normal normal-case tracking-normal">(volitelné)</span>
          </span>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            autoComplete="tel"
            disabled={disabled}
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Instagram <span className="font-normal normal-case tracking-normal">(volitelné)</span>
          </span>
          <input
            name="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@vas_salon"
            className={fieldClass}
            disabled={disabled}
          />
        </label>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm text-ink-soft">
        <input
          required
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
          disabled={disabled}
          aria-invalid={Boolean(errors.consent)}
        />
        <span>
          Souhlasím se zpracováním údajů za účelem online auditu.{" "}
          <Link
            href="/ochrana-osobnich-udaju"
            className="underline decoration-copper/40 underline-offset-2 hover:decoration-copper"
          >
            Zásady ochrany osobních údajů
          </Link>
        </span>
      </label>
      {errors.consent ? (
        <p className="mt-2 text-xs text-copper-deep">{errors.consent}</p>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="mt-2 inline-flex min-h-[60px] w-full items-center justify-center rounded-full bg-copper px-7 py-5 text-base font-medium tracking-tight text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? (
          "Odesílám…"
        ) : (
          <>
            Prověřit můj salon{" "}
            <span className="cta-arrow ml-1.5" aria-hidden>
              →
            </span>
          </>
        )}
      </button>

      {errors.form ? (
        <p className="mt-4 text-sm text-copper-deep" role="alert">
          {errors.form}{" "}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>
        </p>
      ) : null}
    </form>
  );
}

export function LeadFormSection() {
  return (
    <section
      id="audit"
      className="scroll-mt-24 px-[clamp(1.25rem,4vw,3rem)] pb-[clamp(5rem,10vw,8.75rem)]"
    >
      <div id="poptavka" className="sr-only" aria-hidden tabIndex={-1} />

      <div className="mx-auto grid max-w-[1360px] gap-[clamp(1.5rem,4vw,3.5rem)] rounded-[36px] bg-sand p-[clamp(1.25rem,3vw,2.5rem)] lg:grid-cols-2">
        <div className="flex flex-col gap-7 p-[clamp(0.5rem,2vw,1.5rem)]">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[22px]">
            <Image
              src="/design/barber.jpg"
              alt="Barber při práci"
              fill
              className="object-cover object-[center_30%]"
              sizes="(max-width: 1024px) 100vw, 560px"
              quality={75}
            />
          </div>
          <p className="eyebrow">Začněte tím nejdůležitějším</p>
          <h2 className="display-title text-[clamp(2.5rem,5vw,4.5rem)]">
            Jak si vede váš salon online?
          </h2>
          <p className="max-w-[520px] text-lg leading-relaxed text-[#3d3b37]">
            Podíváme se na web, rezervace, Google, recenze, sociální sítě a
            další důležité oblasti. Zjistíme, co funguje, kde jsou slabá místa a
            co má skutečně smysl řešit.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            {["Nezávazně", "Individuální doporučení", "Žádné zbytečnosti"].map(
              (item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-copper" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <Suspense
          fallback={
            <div className="min-h-[26rem] rounded-[26px] bg-foam p-6 sm:p-8" />
          }
        >
          <div className="self-start overflow-hidden rounded-[26px] bg-foam shadow-[var(--shadow-soft)]">
            <LeadFormFields />
          </div>
        </Suspense>
      </div>
    </section>
  );
}
