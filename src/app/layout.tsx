import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { ClientBootstrap } from "@/components/ClientBootstrap";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online partner pro kadeřnictví a salony | HAIRWEB",
  description:
    "HAIRWEB dává online svět salonu do pořádku. Zjistíme, co funguje, doplníme, co chybí, vše propojíme a dlouhodobě se o to staráme. Začněte online auditem.",
  metadataBase: new URL(site.url),
  openGraph: {
    title: "Online partner pro kadeřnictví a salony | HAIRWEB",
    description:
      "Web, rezervace, Google, recenze a sociální sítě na jednom místě. Co funguje, necháme. Co chybí, doplníme. Dlouhodobě se staráme.",
    locale: "cs_CZ",
    type: "website",
    url: site.url,
    siteName: "HAIRWEB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online partner pro kadeřnictví a salony | HAIRWEB",
    description:
      "Zjistíme, co vašemu salonu online skutečně chybí. Propojíme a dlouhodobě se staráme.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "HAIRWEB",
  url: site.url,
  email: site.email,
  description:
    "Online partner pro kadeřnictví, salony a barbershopy. Audit, propojení a dlouhodobá správa online prostředí salonu.",
  areaServed: {
    "@type": "Country",
    name: "Czech Republic",
  },
  serviceType: [
    "Online partner pro kadeřnictví",
    "Online audit salonu",
    "Správa Google Business Profile",
    "Webové stránky pro salony",
    "Propojení rezervačních systémů",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      style={
        {
          "--font-manrope": "var(--font-geist-sans)",
          "--font-fraunces": "var(--font-geist-sans)",
          "--font-mono": "var(--font-geist-mono)",
        } as CSSProperties
      }
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/design/hero.jpg"
          type="image/jpeg"
          fetchPriority="high"
        />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1528123552406286');
fbq('track', 'PageView');
            `.trim(),
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1528123552406286&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
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
