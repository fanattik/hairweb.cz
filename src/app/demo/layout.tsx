import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Instrument_Serif } from "next/font/google";

const demoDisplay = Cormorant_Garamond({
  variable: "--font-demo-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const demoAccent = Instrument_Serif({
  variable: "--font-demo-accent",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const demoSans = DM_Sans({
  variable: "--font-demo-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ukázkový koncept | Hairweb.cz",
  description:
    "Fiktivní ukázkový web připravený jako klikací model. Nejde o klientskou realizaci.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${demoDisplay.variable} ${demoAccent.variable} ${demoSans.variable} min-h-full bg-white font-[family-name:var(--font-demo-sans)] text-[#1a1714] antialiased`}
    >
      {children}
    </div>
  );
}
