"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoBookButton } from "@/components/demos/DemoBookButton";

const IMG = {
  hero: "/demos/hair-studio/hero.png",
  nora: "/demos/hair-studio/nora.png",
  eliska: "/demos/hair-studio/eliska.png",
  matyas: "/demos/hair-studio/matyas.png",
} as const;

const NAV = [
  { href: "#pribeh", label: "Příběh" },
  { href: "#sluzby", label: "Služby" },
  { href: "#tym", label: "Tým" },
  { href: "#atmosfera", label: "Ateliér" },
] as const;

const SERVICES = [
  {
    num: "01",
    title: "Střih & tvar",
    text: "Precizní střih postavený na vaší přirozené textuře a pohybu vlasů.",
    label: "Rezervovat střih a tvar",
  },
  {
    num: "02",
    title: "Barva & světlo",
    text: "Barva, která se v čase usazuje do tónu, jenž působí jako váš vlastní.",
    label: "Rezervovat barvení",
  },
  {
    num: "03",
    title: "Péče & obnova",
    text: "Koncentrovaná péče pro vlasy, které potřebují zpomalit a znovu nadechnout.",
    label: "Rezervovat péči o vlasy",
  },
] as const;

const TEAM = [
  {
    name: "Nora Vránová",
    role: "Zakladatelka & střih",
    detail:
      "Za sebou 12 let v berlínských ateliérech. Věří, že nejlepší střih je ten, který se nemusí upravovat.",
    image: IMG.nora,
  },
  {
    name: "Eliška Dvořáková",
    role: "Barva & světlo",
    detail:
      "Barví od studentských let, teď už jen tóny, které stárnou dobře. Miluje tiché blond a hluboké hnědé.",
    image: IMG.eliska,
  },
  {
    name: "Matyáš Král",
    role: "Barbering",
    detail:
      "Přišel z barbershopu pod Bořislavkou. Stříhá klasicky, ale nesnáší klišé. Během střihu mlčí, během kávy ne.",
    image: IMG.matyas,
  },
] as const;

export function StudioNoraDemo() {
  return (
    <main
      className="studio-page"
      data-testid="studio-page"
      style={{
        fontFamily: "var(--font-sn-sans), Manrope, sans-serif",
      }}
    >
      <style>{`
        .studio-page .brand-name,
        .studio-page .brand-subtitle,
        .studio-page .main-nav,
        .studio-page .booking-link,
        .studio-page .eyebrow,
        .studio-page .note-number,
        .studio-page .service-number,
        .studio-page .image-index,
        .studio-page .text-link,
        .studio-page .team-role,
        .studio-page .footer-mark {
          font-family: var(--font-sn-mono), "DM Mono", monospace !important;
        }
        .studio-page .hero-title,
        .studio-page .hero-note p,
        .studio-page .manifesto-main h2,
        .studio-page .section-heading h2,
        .studio-page .service-item h3,
        .studio-page .team-card h3,
        .studio-page .visit-visual span,
        .studio-page .visit-copy h2,
        .studio-page .footer-cta,
        .studio-page .manifesto-quote p {
          font-family: var(--font-sn-display), "Instrument Serif", serif !important;
        }
      `}</style>

      <div className="grain" aria-hidden />
      <div className="orbital orbital-one" aria-hidden />
      <div className="orbital orbital-two" aria-hidden />

      <header className="site-header">
        <Link className="brand" href="#uvod" aria-label="Studio Nora, úvod">
          <span className="brand-name">STUDIO NORA</span>
          <span className="brand-subtitle">hair studio</span>
        </Link>

        <nav className="main-nav" aria-label="Hlavní navigace">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <DemoBookButton salonName="Studio Nora" className="booking-link">
          Rezervace <span aria-hidden>↗</span>
        </DemoBookButton>
      </header>

      <section className="hero" id="uvod" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow reveal">Kadeřnictví jako rituál</p>
          <h1 id="hero-title" className="hero-title">
            <span className="reveal delay-1">Tvarujeme</span>
            <span className="hero-title-accent reveal delay-2">charakter,</span>
            <span className="reveal delay-3">ne jen vlasy.</span>
          </h1>
          <div className="hero-intro reveal delay-4">
            <p>
              Klidný studio v centru Brna pro střih, který sedí vašemu rytmu. Bez
              spěchu, bez kompromisů.
            </p>
            <Link className="text-link" href="#pribeh">
              Poznat náš přístup <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="hero-visual reveal delay-2">
          <div className="image-frame">
            <Image
              src={IMG.hero}
              alt="Kadeřnice při precizním střihu dlouhých vlasů v intimním salonu"
              width={900}
              height={1100}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="image-index" aria-hidden>
            <span>01</span>
            <i />
            <span>Studio</span>
          </div>
          <div className="seal" aria-hidden>
            <svg viewBox="0 0 160 160" role="presentation">
              <defs>
                <path
                  id="sealPath"
                  d="M80,80 m-57,0 a57,57 0 1,1 114,0 a57,57 0 1,1 -114,0"
                />
              </defs>
              <text>
                <textPath href="#sealPath">
                  STUDIO NORA · BRNO · STUDIO NORA ·{" "}
                </textPath>
              </text>
            </svg>
            <span>Ø</span>
          </div>
        </div>

        <aside className="hero-note reveal delay-4">
          <span className="note-number">/ 01</span>
          <p>
            Krása nevzniká podle předlohy. Vzniká ve chvíli, kdy se v ní
            poznáte.
          </p>
        </aside>
      </section>

      <section
        className="manifesto"
        id="pribeh"
        aria-labelledby="manifesto-title"
      >
        <p className="eyebrow">Studio Nora</p>
        <div className="manifesto-main">
          <h2 id="manifesto-title">Střih, který nezačne u zrcadla.</h2>
          <p>
            Začíná rozhovorem. Nasloucháme tomu, jak žijete, co si ráno stíháte
            a kde se chcete cítit nejvíc sami sebou.
          </p>
        </div>
        <div className="manifesto-quote">
          <span className="quote-mark" aria-hidden>
            „
          </span>
          <p>Váš přirozený výraz je vždycky ten nejzajímavější.</p>
        </div>
      </section>

      <section className="services" id="sluzby" aria-labelledby="services-title">
        <div className="section-heading">
          <p className="eyebrow">Co umíme</p>
          <h2 id="services-title">
            Vše podstatné.
            <br />
            Nic navíc.
          </h2>
        </div>
        <div className="service-list">
          {SERVICES.map((service) => (
            <article key={service.num} className="service-item">
              <span className="service-number">{service.num}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
              <DemoBookButton
                salonName="Studio Nora"
                className="service-arrow"
                aria-label={service.label}
              >
                ↗
              </DemoBookButton>
            </article>
          ))}
        </div>
      </section>

      <section className="team" id="tym" aria-labelledby="team-title">
        <div className="section-heading">
          <p className="eyebrow">Tým</p>
          <h2 id="team-title">
            Lidé za
            <br />
            židlí.
          </h2>
        </div>
        <div className="team-grid">
          {TEAM.map((member) => (
            <article key={member.name} className="team-card">
              <div className="team-photo">
                <Image
                  src={member.image}
                  alt={`Portrét člena týmu: ${member.name}`}
                  width={600}
                  height={750}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-detail">{member.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="visit"
        id="atmosfera"
        aria-labelledby="visit-title"
      >
        <div className="visit-visual" aria-hidden>
          <div className="hair-line hair-line-one" />
          <div className="hair-line hair-line-two" />
          <div className="hair-line hair-line-three" />
          <span>
            Pomalu
            <br />
            &amp; dobře
          </span>
        </div>
        <div className="visit-copy">
          <p className="eyebrow">Návštěva</p>
          <h2 id="visit-title">
            Devadesát minut jen pro váš další dobrý den.
          </h2>
          <p>
            Káva, hudba, ticho, když ho chcete. Každý termín je vyhrazený
            výhradně pro vás.
          </p>
        </div>
      </section>

      <footer className="site-footer" id="kontakt">
        <div>
          <p className="eyebrow">Najdete nás</p>
          <p className="address">
            Údolní 18, Brno
            <br />
            Po–So / na objednání
          </p>
        </div>
        <DemoBookButton salonName="Studio Nora" className="footer-cta">
          Chci svůj termín <span aria-hidden>↗</span>
        </DemoBookButton>
        <p className="footer-mark">
          STUDIO
          <br />
          NORA
        </p>
      </footer>
    </main>
  );
}
