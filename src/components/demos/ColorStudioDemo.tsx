"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DemoBookButton } from "@/components/demos/DemoBookButton";

const IMG = {
  hero: "/demos/color-studio/hero.jpeg",
  galleryCopper: "/demos/color-studio/hero.jpeg",
  galleryCaramel: "/demos/color-studio/gallery-caramel.jpeg",
  galleryBlond: "/demos/color-studio/gallery-blond.jpeg",
  galleryPlatinum: "/demos/color-studio/gallery-platinum.jpeg",
  interior: "/demos/color-studio/interior.jpeg",
  inset: "/demos/color-studio/gallery-platinum.jpeg",
} as const;

const ICON = {
  bucket: "/demos/color-studio/icons/color-bucket.svg",
  dresser: "/demos/color-studio/icons/hair-dresser.svg",
  calendar: "/demos/color-studio/icons/calendar.svg",
  care: "/demos/color-studio/icons/body-care.svg",
  clock: "/demos/color-studio/icons/clock.svg",
  heart: "/demos/color-studio/icons/heart.svg",
  pin: "/demos/color-studio/icons/pin.svg",
  phone: "/demos/color-studio/icons/phone.svg",
} as const;

const NAV = [
  { href: "#sluzby", label: "Služby" },
  { href: "#galerie", label: "Galerie" },
  { href: "#studio", label: "Studio" },
  { href: "#kontakt", label: "Kontakt" },
] as const;

const SERVICES = [
  {
    icon: ICON.bucket,
    title: "Komplexní barvení",
    meta: "od 1 890 Kč · 2,5–4 h",
    text: "Kompletní proměna barvy od kořínků po konečky. Barvení + tonování + pečující rituál pro maximální lesk a sytost odstínu.",
  },
  {
    icon: ICON.dresser,
    title: "Melír & balayage",
    meta: "od 2 190 Kč · 2,5–3,5 h",
    text: "Volně kreslené prosvětlení technikou freehand balayage nebo klasický melír. Přirozený přechod bez viditelné hranice.",
  },
  {
    icon: ICON.calendar,
    title: "Barvení odrostu",
    meta: "od 1 290 Kč · 1,5–2 h",
    text: "Rychlé a šetrné zbarvení odrostu mezi kompletními barvením. Ideální pro udržení syté barvy každých 4–6 týdnů.",
  },
  {
    icon: ICON.care,
    title: "Tónování & péče",
    meta: "od 890 Kč · 45–75 min",
    text: "Oživení barvy mezi barvením. Tonování do studených či teplých tónů plus regenerační maska na míru vašemu typu vlasů.",
  },
  {
    icon: ICON.clock,
    title: "Poradenství & analýza",
    meta: "zdarma · 20 min",
    text: "Než se do barvení pustíme, probereme vaše představy, životní styl a stav vlasů. Vytvoříme plán barvy na míru.",
  },
  {
    icon: ICON.heart,
    title: "Svatební & příležitostné",
    meta: "od 2 490 Kč · 3–4,5 h",
    text: "Barvení + styling pro váš velký den. Soukromé prostředí, zkouška předem a dlouhotrvající lesk, který vydrží celou oslavu.",
  },
] as const;

const STEPS = [
  {
    num: "01",
    title: "Konzultace",
    text: "Probereme vaše představy, fotografie inspirací, stav vlasů i životní styl. Všechno se řídí vámi.",
  },
  {
    num: "02",
    title: "Analýza vlasů",
    text: "Testujeme porozitu, elasticitu a historii barvení. Na základě ní vybereme šetrnou techniku.",
  },
  {
    num: "03",
    title: "Barevná diagnóza",
    text: "Volíme odstín podle podtónu pleti. Barva má ladit s vámi, ne s trendem.",
  },
  {
    num: "04",
    title: "Barvení & rituál",
    text: "Aplikace, pečující esence, hloubková regenerace. Kávu nebo prosecco máte zajištěnou.",
  },
] as const;

const GALLERY = [
  {
    src: IMG.galleryCopper,
    alt: "Zrzavé vlnité vlasy",
    label: "Měděná zrzavá",
    featured: true as boolean,
  },
  {
    src: IMG.galleryCaramel,
    alt: "Hnědé vlasy s caramel balayage",
    label: "Čokoládová caramel",
    featured: false as boolean,
  },
  {
    src: IMG.galleryBlond,
    alt: "Medový blond balayage",
    label: "Medový blond",
    featured: false as boolean,
  },
  {
    src: IMG.galleryPlatinum,
    alt: "Platinový blond s růžovým nádechem",
    label: "Perleťový platinový",
    featured: false as boolean,
  },
] as const;

const TICKER = [
  "Personalizované konzultace",
  "Experti na barvení",
  "Prémiové produkty",
  "Zdravé a lesklé vlasy",
  "Barva na míru",
] as const;

export function ColorStudioDemo() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[var(--cs-cream)] font-[family-name:var(--font-cs-sans)] text-[var(--cs-cocoa)] antialiased"
      style={{ fontFamily: "var(--font-cs-sans), 'Helvetica Neue', sans-serif" }}
    >
      <header className="sticky top-[41px] z-50 border-b border-[var(--cs-line)] bg-[color-mix(in_srgb,var(--cs-cream)_85%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link
            href="#uvod"
            className="font-[family-name:var(--font-cs-display)] text-xl tracking-[0.18em] text-[var(--cs-cocoa)] md:text-2xl"
            onClick={() => setMenuOpen(false)}
          >
            COLOR&nbsp;STUDIO
          </Link>

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Hlavní navigace"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--cs-ink-soft)] transition-colors hover:text-[var(--cs-clay)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <DemoBookButton
            salonName="Color Studio"
            className="hidden bg-[var(--cs-clay)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cs-cream)] transition-colors hover:bg-[var(--cs-cocoa)] md:inline-block"
          >
            Rezervovat
          </DemoBookButton>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className={`h-0.5 w-6 bg-[var(--cs-cocoa)] transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-[var(--cs-cocoa)] transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-[var(--cs-cocoa)] transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>

        {menuOpen ? (
          <nav
            className="border-t border-[var(--cs-line)] px-5 py-5 md:hidden"
            aria-label="Mobilní navigace"
          >
            <ul className="mx-auto flex max-w-6xl flex-col gap-4">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--cs-ink-soft)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <DemoBookButton
                  salonName="Color Studio"
                  className="inline-flex bg-[var(--cs-clay)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cs-cream)]"
                >
                  Rezervovat
                </DemoBookButton>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>

      <section id="uvod" className="relative overflow-hidden scroll-mt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 md:min-h-[560px] md:grid-cols-[1.1fr_1fr] md:gap-8 md:px-8 md:pb-24 md:pt-20">
          <div className="cs-fade-up">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cs-clay)]">
              Kadeřnické studio zaměřené na barvení vlasů
            </p>
            <h1 className="font-[family-name:var(--font-cs-display)] text-[3.4rem] leading-[0.95] font-light text-[var(--cs-cocoa)] sm:text-7xl md:text-[5.5rem]">
              Barva
              <br />
              vytváří
              <br />
              <em className="font-[family-name:var(--font-cs-display)] italic text-[var(--cs-caramel)]">
                sebevědomí
              </em>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[var(--cs-ink-soft)]">
              Barva na míru, navržená podle vaší pleti, stylu i příběhu. Šetrné
              techniky, prémiové barvy a řemeslo, které máme rádi.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <DemoBookButton
                salonName="Color Studio"
                className="inline-flex items-center gap-3 bg-[var(--cs-clay)] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cs-cream)] transition-colors hover:bg-[var(--cs-cocoa)]"
              >
                Objednat se
              </DemoBookButton>
              <Link
                href="#sluzby"
                className="inline-flex items-center gap-3 border border-[var(--cs-clay)] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cs-clay)] transition-colors hover:bg-[var(--cs-clay)] hover:text-[var(--cs-cream)]"
              >
                Prohlédnout služby
              </Link>
            </div>
          </div>

          <div className="relative cs-fade-up-delay">
            <div
              className="absolute -top-10 -right-6 hidden h-40 w-40 rounded-full border border-[var(--cs-clay)]/30 md:block"
              aria-hidden
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-full shadow-xl shadow-[var(--cs-clay)]/15">
              <Image
                src={IMG.hero}
                alt="Klientka s dlouhými zrzavými vlnitými vlasy v krémovém svetru"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-[color-mix(in_srgb,var(--cs-cream)_95%,transparent)] px-6 py-4 shadow-lg shadow-[var(--cs-clay)]/10 backdrop-blur md:block">
              <p className="font-[family-name:var(--font-cs-display)] text-2xl text-[var(--cs-clay)]">4,9</p>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--cs-ink-soft)]">
                z 380 recenzí
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-[var(--cs-line)] bg-[color-mix(in_srgb,var(--cs-sand)_40%,var(--cs-cream))] py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--cs-ink-soft)] md:justify-between md:px-8">
          {TICKER.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <section
        id="sluzby"
        className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20 md:px-8 md:py-28"
      >
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cs-clay)]">
            Služby a ceník
          </p>
          <h2 className="font-[family-name:var(--font-cs-display)] text-4xl font-light text-[var(--cs-cocoa)] md:text-5xl">
            Každá barva začíná{" "}
            <em className="italic text-[var(--cs-caramel)]">rozhovorem</em>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--cs-ink-soft)]">
            Zaměřujeme se výhradně na barvení, proto v něm vidíme do hloubky.
            Ceny jsou orientační, přesnou nabídku dostanete po konzultaci.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="group flex flex-col rounded-2xl border border-[var(--cs-line)] bg-[var(--cs-cream)] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--cs-clay)]/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={service.icon} alt="" className="mb-5 h-10 w-10" />
              <h3 className="font-[family-name:var(--font-cs-display)] text-2xl text-[var(--cs-cocoa)]">
                {service.title}
              </h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cs-clay)]">
                {service.meta}
              </p>
              <p className="mt-4 leading-relaxed text-[var(--cs-ink-soft)]">
                {service.text}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-[var(--cs-ink-soft)]">
          Ceny se mohou lišit podle délky a hustoty vlasů. Konečnou cenu vždy
          potvrdíme předem, žádná nepříjemná překvapení.
        </p>
      </section>

      <section
        id="galerie"
        className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20 md:px-8 md:py-28"
      >
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cs-clay)]">
              Galerie
            </p>
            <h2 className="font-[family-name:var(--font-cs-display)] text-4xl font-light text-[var(--cs-cocoa)] md:text-5xl">
              Odstíny, které jsme{" "}
              <em className="italic text-[var(--cs-caramel)]">vytvořili</em>
            </h2>
          </div>
          <p className="max-w-sm text-[var(--cs-ink-soft)]">
            Inspirace z našeho salonu. Každý odstín vzniká na míru, ale rádi z
            něj uděláme výchozí bod pro vaši proměnu.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {GALLERY.map((item) => (
            <figure
              key={item.label}
              className={`group relative overflow-hidden rounded-2xl ${
                item.featured ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.featured ? 900 : 600}
                height={item.featured ? 1100 : 500}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  item.featured
                    ? "h-full min-h-[320px]"
                    : "h-64"
                }`}
                sizes={
                  item.featured
                    ? "(max-width: 768px) 100vw, 50vw"
                    : "(max-width: 768px) 100vw, 25vw"
                }
              />
              <figcaption className="absolute inset-x-4 bottom-4 rounded-xl bg-[color-mix(in_srgb,var(--cs-cream)_90%,transparent)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cs-cocoa)] backdrop-blur">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-[var(--cs-clay)] text-[var(--cs-cream)]">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="mb-14 max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cs-cream)]/70">
              Jak pracujeme
            </p>
            <h2 className="font-[family-name:var(--font-cs-display)] text-4xl font-light md:text-5xl">
              Cesta ke správné barvě ve{" "}
              <em className="italic text-[var(--cs-sand)]">čtyřech krocích</em>
            </h2>
          </div>
          <ol className="grid gap-8 md:grid-cols-4">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="border-t border-[var(--cs-cream)]/30 pt-6"
              >
                <p className="font-[family-name:var(--font-cs-display)] text-4xl text-[var(--cs-sand)]">
                  {step.num}
                </p>
                <h3 className="mt-4 font-[family-name:var(--font-cs-display)] text-xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--cs-cream)]/80">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[var(--cs-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-16 gap-y-8 px-5 py-14 text-center md:justify-between md:px-8">
          <div>
            <p className="font-[family-name:var(--font-cs-display)] text-5xl font-light text-[var(--cs-clay)]">
              12+
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--cs-ink-soft)]">
              let zkušeností s barvením
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-cs-display)] text-5xl font-light text-[var(--cs-clay)]">
              4 200+
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--cs-ink-soft)]">
              spokojených klientek
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-cs-display)] text-5xl font-light text-[var(--cs-clay)]">
              98 %
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--cs-ink-soft)]">
              se vrací znovu
            </p>
          </div>
        </div>
      </section>

      <section
        id="studio"
        className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20 md:px-8 md:py-28"
      >
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl shadow-[var(--cs-clay)]/10">
              <Image
                src={IMG.interior}
                alt="Světlý interiér studia s obloukovými zrcadly a terakotovými křesly"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-10 -right-6 hidden h-48 w-48 overflow-hidden rounded-2xl border-8 border-[var(--cs-cream)] shadow-lg md:block">
              <Image
                src={IMG.inset}
                alt="Detail platinového blond"
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cs-clay)]">
              O studiu
            </p>
            <h2 className="font-[family-name:var(--font-cs-display)] text-4xl font-light text-[var(--cs-cocoa)] md:text-5xl">
              Malé studio, velká{" "}
              <em className="italic text-[var(--cs-caramel)]">vášeň</em>
            </h2>
            <p className="mt-6 leading-relaxed text-[var(--cs-ink-soft)]">
              Color Studio vzniklo z lásky k barvě. Věříme, že správný odstín
              dokáže změnit nejen vzhled, ale i pocit ze sebe samé. Proto si na
              každého klienta bereme čas.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--cs-ink-soft)]">
              Pracujeme výhradně s prémiovými šetrnými barvami bez amoniaku a
              dbáme na zdraví vlasů. Barvení u nás není rychloobsluha, ale
              rituál, na který se budete těšit.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Barvy bez amoniaku a veganské produkty",
                "Konzultace a analýza vlasů zdarma",
                "Individuální přístup, žádné spěchání",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ICON.heart}
                    alt=""
                    className="mt-1 h-5 w-5 shrink-0"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="kontakt"
        className="scroll-mt-28 bg-[color-mix(in_srgb,var(--cs-sand)_60%,transparent)]"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cs-clay)]">
                Kontakt
              </p>
              <h2 className="font-[family-name:var(--font-cs-display)] text-4xl font-light text-[var(--cs-cocoa)] md:text-5xl">
                Pojďme spolu vybrat{" "}
                <em className="italic text-[var(--cs-caramel)]">váš odstín</em>
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-[var(--cs-ink-soft)]">
                Napište nám nebo se zastavte. Rádi vám poradíme s výběrem barvy i
                termínu, který vám bude vyhovovat.
              </p>
              <DemoBookButton
                salonName="Color Studio"
                className="mt-8 inline-flex items-center gap-3 bg-[var(--cs-clay)] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cs-cream)] transition-colors hover:bg-[var(--cs-cocoa)]"
              >
                Napsat e-mail
              </DemoBookButton>
            </div>

            <dl className="grid gap-8 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cs-clay)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ICON.pin} alt="" className="h-5 w-5" /> Adresa
                </dt>
                <dd className="mt-3 leading-relaxed text-[var(--cs-ink-soft)]">
                  Vinohradská 1234/45
                  <br />
                  120 00 Praha 2
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cs-clay)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ICON.phone} alt="" className="h-5 w-5" /> Telefon
                </dt>
                <dd className="mt-3 leading-relaxed text-[var(--cs-ink-soft)]">
                  <a href="tel:+420777123456" className="hover:text-[var(--cs-clay)]">
                    +420 777 123 456
                  </a>
                  <br />
                  <a
                    href="mailto:objednanky@colorstudio.cz"
                    className="hover:text-[var(--cs-clay)]"
                  >
                    objednanky@colorstudio.cz
                  </a>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cs-clay)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ICON.clock} alt="" className="h-5 w-5" /> Otevírací
                  doba
                </dt>
                <dd className="mt-3 leading-relaxed text-[var(--cs-ink-soft)]">
                  Út–Pá: 9:00–19:00
                  <br />
                  So: 9:00–14:00
                  <br />
                  Ne &amp; Po: zavřeno
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cs-clay)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ICON.calendar} alt="" className="h-5 w-5" />{" "}
                  Rezervace
                </dt>
                <dd className="mt-3 leading-relaxed text-[var(--cs-ink-soft)]">
                  Objednávku potvrdíme do 24 hodin e-mailem i telefonicky.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--cs-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs uppercase tracking-[0.14em] text-[var(--cs-ink-soft)] md:px-8">
          <p className="font-[family-name:var(--font-cs-display)] text-base normal-case tracking-[0.18em] text-[var(--cs-cocoa)]">
            COLOR STUDIO
          </p>
          <p>© {new Date().getFullYear()} Color Studio · Všechna práva vyhrazena</p>
        </div>
      </footer>
    </div>
  );
}
