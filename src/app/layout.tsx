import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { ClientBootstrap } from "@/components/ClientBootstrap";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  adjustFontFallback: true,
  // Body font can swap — don't compete with LCP image preload.
  preload: false,
});

export const metadata: Metadata = {
  title: "Webové stránky pro kadeřnictví a barbershopy | Hairweb.cz",
  description:
    "Moderní weby pro kadeřnictví, hair salony a barbershopy. Online rezervace, galerie, ceník a lokální SEO. Získejte nezávazný návrh nového webu.",
  metadataBase: new URL(site.url),
  openGraph: {
    title: "Webové stránky pro kadeřnictví a barbershopy | Hairweb.cz",
    description:
      "Moderní weby pro kadeřnictví, hair salony a barbershopy. Online rezervace, galerie, ceník a lokální SEO.",
    locale: "cs_CZ",
    type: "website",
    url: site.url,
    siteName: "Hairweb.cz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webové stránky pro kadeřnictví a barbershopy | Hairweb.cz",
    description:
      "Moderní weby pro kadeřnictví, hair salony a barbershopy. Získejte nezávazný návrh.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Hairweb.cz",
  url: site.url,
  email: site.email,
  description:
    "Specializovaná tvorba webových stránek pro kadeřnictví, hair salony a barbershopy.",
  areaServed: {
    "@type": "Country",
    name: "Czech Republic",
  },
  serviceType: [
    "Webové stránky pro kadeřnictví",
    "Web pro barbershop",
    "Web pro hair salon",
  ],
  offers: [
    {
      "@type": "Offer",
      name: "START",
      price: "9900",
      priceCurrency: "CZK",
      description: "Jednostránkový web pro menší salon nebo hairstylistu.",
    },
    {
      "@type": "Offer",
      name: "PRO",
      price: "14900",
      priceCurrency: "CZK",
      description: "Vícestránkový web pro salony, které chtějí získávat klienty.",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/hero/color-studio-desktop.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col bg-mist text-ink">
        <AnalyticsScripts />
        <ClientBootstrap />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
