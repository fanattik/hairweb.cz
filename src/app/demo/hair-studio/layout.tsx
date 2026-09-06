import type { CSSProperties, ReactNode } from "react";
import { DM_Mono, Instrument_Serif, Manrope } from "next/font/google";
import "@/components/demos/studio-nora.css";

const display = Instrument_Serif({
  variable: "--font-sn-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  variable: "--font-sn-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = DM_Mono({
  variable: "--font-sn-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export default function HairStudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
