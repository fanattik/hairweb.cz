"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import {
  getSourceDetail,
  getStoredLandingPage,
  getStoredReferrer,
  getStoredUtm,
  setSourceDetail,
  type SourceDetail,
} from "@/lib/attribution";
import { site } from "@/lib/site";

type FieldErrors = Partial<
  Record<"name" | "email" | "website" | "consent" | "form", string>
>;

function LeadFormFields() {
  const searchParams = useSearchParams();
  const started = useRef(false);
  const formStartedAt = useRef(0);
  const initialPlan = searchParams.get("plan") ?? "";

  const [name, setName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [pkg, setPkg] = useState(() =>
    initialPlan === "start" || initialPlan === "pro" ? initialPlan : "",
  );
  const [honeypot, setHoneypot] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    formStartedAt.current = Date.now();
    if (initialPlan === "start") setSourceDetail("pricing_start");
    else if (initialPlan === "pro") setSourceDetail("pricing_pro");
  }, [initialPlan]);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackEvent("lead_form_start");
  }

  function validateClient(): boolean {
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = "Vyplňte jméno (min. 2 znaky).";
    if (!email.trim()) next.email = "Vyplňte e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Zadejte platný e-mail.";
    }
    if (website.trim().length < 2) {
      next.website = "Přidejte web nebo Instagram.";
    }
    if (!consent) next.consent = "Pro odeslání je potřeba souhlas.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || status === "success") return;
    if (!validateClient()) return;

    setStatus("loading");
    setErrors({});

    const sourceDetail = (getSourceDetail() || undefined) as
      | SourceDetail
      | undefined;

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          salonName,
          email,
          phone,
          website,
          message,
          package: pkg || undefined,
          sourceDetail,
          utm: getStoredUtm(),
          referrer: getStoredReferrer(),
          landingPage: getStoredLandingPage(),
          companyWebsite: honeypot,
          formStartedAt: formStartedAt.current,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        fieldErrors?: Record<string, string>;
        ok?: boolean;
        package?: string | null;
        sourceDetail?: string | null;
        utm?: {
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
        };
      };

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
        setStatus("error");
        return;
      }

      trackEvent("generate_lead", {
        package: data.package ?? (pkg || undefined),
        source_detail: data.sourceDetail ?? sourceDetail,
        utm_source: data.utm?.utm_source,
        utm_medium: data.utm?.utm_medium,
        utm_campaign: data.utm?.utm_campaign,
      });

      setStatus("success");
    } catch {
      setErrors({
        form: "Něco se nepovedlo. Zkuste formulář odeslat znovu nebo mě kontaktujte e-mailem.",
      });
      setStatus("error");
    }
  }

  const fieldClass =
    "border border-line bg-mist px-3 py-2.5 text-ink outline-none transition focus:border-copper disabled:opacity-60";
  const errorClass = "border-copper-deep";
  const disabled = status === "loading" || status === "success";

  if (status === "success") {
    return (
      <div className="border border-line bg-foam p-6 sm:p-8" role="status">
        <p className="font-[family-name:var(--font-fraunces)] text-2xl text-ink">
          Děkuji. Ozvu se vám co nejdříve.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Podívám se na váš web nebo Instagram a navrhnu další postup.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={markStarted}
      className="border border-line bg-foam p-6 sm:p-8"
      noValidate
    >
      {pkg ? (
        <p className="mb-5 text-sm text-ink-soft">
          Vybraný balíček:{" "}
          <span className="font-medium text-ink">
            {pkg === "pro" ? "PRO" : "START"}
          </span>
          <button
            type="button"
            className="ml-2 underline decoration-copper/40 underline-offset-2 hover:decoration-copper"
            onClick={() => setPkg("")}
          >
            změnit
          </button>
        </p>
      ) : null}

      {/* Honeypot — hidden from users */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label>
          Company website
          <input
            type="text"
            name="companyWebsite"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-ink">Jméno</span>
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

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-ink">
            Název salonu{" "}
            <span className="font-normal text-ink-soft">(nepovinné)</span>
          </span>
          <input
            name="salonName"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            className={fieldClass}
            autoComplete="organization"
            disabled={disabled}
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-ink">E-mail</span>
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

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-ink">
            Telefon <span className="font-normal text-ink-soft">(nepovinné)</span>
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

        <label className="grid gap-2 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Web nebo Instagram</span>
          <input
            required
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="odkaz nebo @handle"
            className={`${fieldClass} ${errors.website ? errorClass : ""}`}
            aria-invalid={Boolean(errors.website)}
            disabled={disabled}
          />
          {errors.website ? (
            <span className="text-xs text-copper-deep">{errors.website}</span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm sm:col-span-2">
          <span className="font-medium text-ink">
            Varianta{" "}
            <span className="font-normal text-ink-soft">(nepovinné)</span>
          </span>
          <select
            name="package"
            value={pkg}
            onChange={(e) => setPkg(e.target.value)}
            className={fieldClass}
            disabled={disabled}
          >
            <option value="">Ještě nevím</option>
            <option value="start">START</option>
            <option value="pro">PRO</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm sm:col-span-2">
          <span className="font-medium text-ink">
            Co byste chtěli změnit?{" "}
            <span className="font-normal text-ink-soft">(nepovinné)</span>
          </span>
          <textarea
            name="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`resize-y ${fieldClass}`}
            disabled={disabled}
          />
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm text-ink-soft">
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
          Odesláním formuláře souhlasíte se zpracováním údajů za účelem
          vyřízení vaší poptávky.{" "}
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
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center bg-copper px-6 py-3.5 text-sm font-medium tracking-wide text-foam transition hover:bg-copper-deep disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Odesílám…" : "Chci nezávazný návrh"}
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
      id="poptavka"
      className="scroll-mt-24 border-t border-line bg-[linear-gradient(165deg,#f4f5f3_0%,#e8ebe8_100%)] px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Poptávka
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-ink sm:text-4xl">
            Nezávazný návrh webu
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
            Pošlete mi odkaz na váš současný web nebo Instagram. Ozvu se vám s
            návrhem dalšího postupu.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-7 inline-block font-[family-name:var(--font-fraunces)] text-xl text-ink underline decoration-copper/40 underline-offset-4 transition hover:decoration-copper"
          >
            {site.email}
          </a>
        </div>

        <Suspense
          fallback={
            <div className="min-h-[26rem] border border-line bg-foam p-6 sm:p-8" />
          }
        >
          <div className="relative">
            <LeadFormFields />
          </div>
        </Suspense>
      </div>
    </section>
  );
}
