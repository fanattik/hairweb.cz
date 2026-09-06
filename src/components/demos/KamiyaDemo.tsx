"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DemoBookButton } from "@/components/demos/DemoBookButton";

const IMG = {
  hero: "/demos/barber/hero.png",
  salon: "/demos/barber/salon.png",
  tools: "/demos/barber/tools.png",
} as const;

const ICON = {
  scissors: "/demos/barber/scissors.svg",
  razor: "/demos/barber/razor.svg",
  chair: "/demos/barber/chair.svg",
  clock: "/demos/barber/clock.svg",
} as const;

const NAV = [
  { href: "#philosophy", label: "Filozofie" },
  { href: "#sluzby", label: "Služby" },
  { href: "#salon", label: "Salon" },
  { href: "#rezervace", label: "Rezervace" },
] as const;

const SERVICES = [
  {
    icon: ICON.scissors,
    jp: "カット",
    title: "Střih",
    text: "Konzultace, přesný střih nůžkami i břitem, styling a rada, jak si účes udržet doma.",
    price: "890",
  },
  {
    icon: ICON.razor,
    jp: "剃髪",
    title: "Holení břitem",
    text: "Horký ručník, japonský břit, proužek a balzám. Hladká pokožka a chvíle klidu.",
    price: "590",
  },
  {
    icon: ICON.chair,
    jp: "刈上げ",
    title: "Klasické holení",
    text: "Úprava vousů a kontur břitem i strojkem. Přesné linie bez kompromisů.",
    price: "390",
  },
  {
    icon: ICON.clock,
    jp: "全身",
    title: "Komplet",
    text: "Střih, holení břitem a horký ručník. Plný rituál pro toho, kdo nemá spěch.",
    price: "1 290",
  },
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ jp, label }: { jp: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mincho text-sm tracking-[0.4em] text-[hsl(var(--gold)/0.9)]">
        {jp}
      </span>
      <span className="h-px w-14 bg-[hsl(var(--gold)/0.5)]" />
      <span className="text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--washi-dim))]">
        {label}
      </span>
    </div>
  );
}

export function KamiyaDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="kamiya-page paper-grain min-h-screen">
      <header
        data-testid="header"
        className={`fixed inset-x-0 top-[41px] z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[hsl(var(--sumi)/0.92)] py-4 backdrop-blur-md"
            : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-10">
          <Link
            href="#top"
            className="flex items-center gap-3"
            aria-label="KAMIYA Barbershop, domů"
            onClick={() => setMenuOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ICON.scissors} alt="" className="h-7 w-7" />
            <span className="leading-none">
              <span className="font-display block text-xl tracking-[0.35em] text-[hsl(var(--washi))]">
                KAMIYA
              </span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--gold)/0.8)]">
                Barbershop
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-9 md:flex"
            aria-label="Hlavní navigace"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--washi-dim))] transition-colors hover:text-[hsl(var(--washi))]"
              >
                {item.label}
              </Link>
            ))}
            <DemoBookButton
              salonName="Kamiya Barbershop"
              className="border border-[hsl(var(--gold)/0.4)] px-5 py-2.5 text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--gold))] transition-colors hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--sumi))]"
            >
              Rezervovat
            </DemoBookButton>
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className={`block h-px w-6 bg-[hsl(var(--washi))] transition-transform duration-300 ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-6 bg-[hsl(var(--washi))] transition-transform duration-300 ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>

        {menuOpen ? (
          <nav
            className="border-t border-[hsl(var(--gold)/0.15)] bg-[hsl(var(--sumi))] px-5 py-6 md:hidden"
            aria-label="Mobilní navigace"
          >
            <ul className="mx-auto flex max-w-7xl flex-col gap-4">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--washi-dim))]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <DemoBookButton
                  salonName="Kamiya Barbershop"
                  className="border border-[hsl(var(--gold)/0.4)] px-5 py-2.5 text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--gold))]"
                >
                  Rezervovat
                </DemoBookButton>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="top">
        <section
          className="relative min-h-svh overflow-hidden"
          data-testid="hero"
        >
          <div className="absolute inset-0">
            <Image
              src={IMG.hero}
              alt="Ruce holiče s japonskými nůžkami"
              fill
              priority
              className="object-cover object-[70%_center] opacity-80"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--sumi))] via-[hsl(var(--sumi)/0.7)] to-[hsl(var(--sumi)/0.2)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--sumi))] via-transparent to-[hsl(var(--sumi)/0.6)]" />
          </div>

          <div className="absolute top-28 right-6 hidden select-none flex-col items-center gap-6 md:flex lg:right-12">
            <span className="text-vertical font-mincho text-6xl leading-none text-[hsl(var(--washi)/0.9)] lg:text-7xl">
              理髪
            </span>
            <span className="text-vertical font-mincho text-sm leading-loose text-[hsl(var(--washi-dim))]">
              伝統の技、普遍の美しさ。
            </span>
            <span
              className="hanko anim-stamp h-14 w-14 text-lg"
              style={{ animationDelay: "1.6s" }}
            >
              匠
            </span>
          </div>

          <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col justify-center px-5 md:px-10">
            <div className="max-w-2xl">
              <p
                className="anim-fade text-[11px] uppercase tracking-[0.5em] text-[hsl(var(--gold))]"
                style={{ animationDelay: "0.3s" }}
              >
                Barbershop · 理容室
              </p>
              <h1
                className="anim-rise font-display mt-7 text-6xl leading-[1.02] text-[hsl(var(--washi))] sm:text-7xl lg:text-8xl"
                style={{ animationDelay: "0.5s" }}
              >
                Umění
                <br />
                <em className="font-light italic">holičství.</em>
              </h1>
              <p
                className="anim-rise mt-8 max-w-md text-sm leading-relaxed tracking-wider text-[hsl(var(--washi-dim))] md:text-base"
                style={{ animationDelay: "0.75s" }}
              >
                Tradice, preciznost a klid. Střih, který nese ducha japonského
                řemesla.
              </p>
              <p
                className="anim-fade font-mincho mt-4 text-sm tracking-[0.3em] text-[hsl(var(--washi-dim)/0.8)]"
                style={{ animationDelay: "0.95s" }}
              >
                伝統の技、普遍の美しさ。
              </p>
              <div
                className="anim-rise mt-12 flex flex-wrap items-center gap-6"
                style={{ animationDelay: "1.1s" }}
              >
                <DemoBookButton
                  salonName="Kamiya Barbershop"
                  className="group border border-[hsl(var(--washi)/0.7)] px-9 py-4 text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--washi))] transition-colors hover:bg-[hsl(var(--washi))] hover:text-[hsl(var(--sumi))]"
                >
                  Rezervovat termín
                  <span className="ml-4 inline-block transition-transform group-hover:translate-x-1.5">
                    —
                  </span>
                </DemoBookButton>
                <Link
                  href="#sluzby"
                  className="text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--washi-dim))] underline-offset-8 transition-colors hover:text-[hsl(var(--washi))] hover:underline"
                >
                  Prohlédnout služby
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="philosophy"
          className="border-t border-[hsl(var(--gold)/0.1)]"
          data-testid="philosophy"
        >
          <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2">
            <div className="flex flex-col justify-center px-5 py-20 md:px-14 md:py-32">
              <Reveal>
                <SectionLabel jp="哲学" label="Filozofie" />
                <h2 className="font-display mt-8 text-4xl leading-tight text-[hsl(var(--washi))] md:text-5xl">
                  Upravovat vlasy
                  <br />
                  znamená uklidnit mysl.
                  <br />
                  <em className="font-light italic text-[hsl(var(--washi-dim))]">
                    心を整える。
                  </em>
                </h2>
                <p className="mt-8 max-w-md text-sm leading-loose text-[hsl(var(--washi-dim))]">
                  V KAMIYA nevěříme na spěch. Každý střih je tichý rituál:
                  důkladná konzultace, přesný řez, horký ručník a břit. Věnujeme
                  se vám tak, jak se v Japonsku věnují řemeslu po generace,
                  pomalu, soustředěně a s respektem k detailu.
                </p>
              </Reveal>
            </div>
            <div className="relative min-h-[320px] md:min-h-[560px]">
              <Image
                src={IMG.salon}
                alt="Interiér salonu KAMIYA s křeslem a noren závěsem"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-[hsl(var(--sumi)/0.2)]" />
              <span className="text-vertical font-mincho absolute top-8 left-6 select-none text-2xl text-[hsl(var(--washi)/0.7)]">
                匠の技
              </span>
            </div>
          </div>
        </section>

        <section
          id="sluzby"
          className="border-t border-[hsl(var(--gold)/0.1)] py-20 md:py-32"
          data-testid="services"
        >
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <Reveal>
              <SectionLabel jp="服务" label="Služby" />
              <h2 className="font-display mt-8 max-w-xl text-4xl leading-tight text-[hsl(var(--washi))] md:text-5xl">
                Ceník v duchu
                <br />
                japonského řemesla
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-px border border-[hsl(var(--gold)/0.15)] bg-[hsl(var(--gold)/0.1)] sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service, index) => (
                <Reveal key={service.title} delay={index * 120}>
                  <article className="group flex h-full flex-col bg-[hsl(var(--sumi))] p-8 transition-colors duration-500 hover:bg-[hsl(var(--sumi-2))]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.icon}
                      alt=""
                      className="h-8 w-8 opacity-70 transition-opacity group-hover:opacity-100"
                    />
                    <span className="font-mincho mt-6 text-xs tracking-[0.4em] text-[hsl(var(--gold)/0.7)]">
                      {service.jp}
                    </span>
                    <h3 className="font-display mt-3 text-2xl text-[hsl(var(--washi))]">
                      {service.title}
                    </h3>
                    <p className="mt-4 flex-1 text-[13px] leading-relaxed text-[hsl(var(--washi-dim))]">
                      {service.text}
                    </p>
                    <p className="font-display mt-8 text-xl text-[hsl(var(--washi)/0.9)]">
                      {service.price}
                      <span className="ml-1 text-xs tracking-widest text-[hsl(var(--washi-dim))]">
                        Kč
                      </span>
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--washi-dim)/0.7)]">
                Všechny služby zahrnují konzultaci a Cochiny sirup
              </p>
            </Reveal>
          </div>
        </section>

        <section
          id="salon"
          className="border-t border-[hsl(var(--gold)/0.1)] py-20 md:py-32"
          data-testid="salon"
        >
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <Reveal>
              <SectionLabel jp="店" label="Salon" />
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-5">
              <Reveal className="md:col-span-3">
                <figure className="hairline-frame relative overflow-hidden">
                  <Image
                    src={IMG.salon}
                    alt="Interiér salonu KAMIYA"
                    width={1200}
                    height={800}
                    className="h-[300px] w-full object-cover transition-transform duration-700 hover:scale-[1.03] md:h-[480px]"
                  />
                  <figcaption className="font-mincho absolute bottom-8 left-8 text-sm tracking-[0.3em] text-[hsl(var(--washi)/0.85)]">
                    のれん · Vstup do salonu
                  </figcaption>
                </figure>
              </Reveal>
              <Reveal className="md:col-span-2" delay={150}>
                <figure className="hairline-frame relative overflow-hidden">
                  <Image
                    src={IMG.tools}
                    alt="Tradicionální holičské nástroje"
                    width={800}
                    height={800}
                    className="h-[300px] w-full object-cover transition-transform duration-700 hover:scale-[1.03] md:h-[480px]"
                  />
                  <figcaption className="font-mincho absolute bottom-8 left-8 text-sm tracking-[0.3em] text-[hsl(var(--washi)/0.85)]">
                    道具 · Nástroje řemesla
                  </figcaption>
                </figure>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-10 border-t border-[hsl(var(--gold)/0.15)] pt-12 sm:grid-cols-3">
              {[
                { jp: "炭酸シャンプー", title: "Uhlíková sprcha" },
                { jp: "熟練の技術", title: "15 let praxe" },
                { jp: "完全予約制", title: "Pouze s rezervací" },
              ].map((item, index) => (
                <Reveal key={item.title} delay={index * 120}>
                  <p className="font-mincho text-sm tracking-[0.3em] text-[hsl(var(--gold)/0.8)]">
                    {item.jp}
                  </p>
                  <p className="font-display mt-3 text-2xl text-[hsl(var(--washi))]">
                    {item.title}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="rezervace"
          className="border-t border-[hsl(var(--gold)/0.1)] py-20 md:py-32"
          data-testid="reservation"
        >
          <div className="mx-auto grid max-w-7xl gap-16 px-5 md:grid-cols-2 md:px-10">
            <Reveal>
              <SectionLabel jp="予約" label="Rezervace" />
              <h2 className="font-display mt-8 text-4xl leading-tight text-[hsl(var(--washi))] md:text-5xl">
                Rezervujte
                <br />
                svůj rituál.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-loose text-[hsl(var(--washi-dim))]">
                Pracujeme pouze na objednání, abychom vám mohli věnovat plnou
                pozornost. Zavolejte nebo napište, domluvíme termín i střih ještě
                před vaším příchodem.
              </p>
              <div className="mt-10">
                <DemoBookButton
                  salonName="Kamiya Barbershop"
                  aria-label="Rezervovat — +420 777 123 456"
                  className="group inline-flex items-center gap-4 border border-[hsl(var(--gold)/0.4)] px-8 py-4 text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--gold))] transition-colors hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--sumi))]"
                >
                  +420 777 123 456
                  <span className="inline-block transition-transform group-hover:translate-x-1.5">
                    —
                  </span>
                </DemoBookButton>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <dl className="divide-y divide-[hsl(var(--gold)/0.1)] border-y border-[hsl(var(--gold)/0.1)]">
                {[
                  ["Adresa", "Japonská 8, Praha 2 · 120 00"],
                  ["Otevírací doba", "Út–So · 9:00–19:00"],
                  ["Zavřeno", "Ne & Po"],
                  ["Kontakt", "ahoj@kamiya-barbershop.cz"],
                  ["Instagram", "@kamiya.barbershop"],
                ].map(([dt, dd]) => (
                  <div
                    key={dt}
                    className="flex items-baseline justify-between gap-6 py-5"
                  >
                    <dt className="text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--washi-dim))]">
                      {dt}
                    </dt>
                    <dd className="font-display text-right text-lg text-[hsl(var(--washi))]">
                      {dd}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex items-center gap-4">
                <span className="hanko h-12 w-12 text-base">予約</span>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--washi-dim)/0.7)]">
                  Rezervace potvrdíme do 24 hodin
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer
        className="border-t border-[hsl(var(--gold)/0.15)] py-10"
        data-testid="footer"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 text-center md:flex-row md:px-10 md:text-left">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ICON.scissors} alt="" className="h-6 w-6" />
            <span className="font-display text-lg tracking-[0.3em] text-[hsl(var(--washi))]">
              KAMIYA
            </span>
            <span className="font-mincho text-xs tracking-[0.4em] text-[hsl(var(--gold)/0.7)]">
              理容室
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--washi-dim)/0.6)]">
            © {new Date().getFullYear()} Kamiya Barbershop · Japonská 8, Praha
          </p>
          <Link
            href="#top"
            className="text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--washi-dim)/0.6)] transition-colors hover:text-[hsl(var(--washi))]"
          >
            Zpět nahoru
          </Link>
        </div>
      </footer>
    </div>
  );
}
