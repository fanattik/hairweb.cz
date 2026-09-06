import type { CSSProperties, ReactNode } from "react";
import { Fraunces, Jost } from "next/font/google";

const fraunces = Fraunces({
  variable: "--font-cs-display",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-cs-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const csVars = {
  "--cs-cream": "#f9f6f0",
  "--cs-cocoa": "#3c2920",
  "--cs-clay": "#af5931",
  "--cs-caramel": "#ca9e72",
  "--cs-ink-soft": "#876d5e",
  "--cs-sand": "#e6efe7",
  "--cs-line": "rgba(184, 147, 122, 0.35)",
} as CSSProperties;

export default function ColorStudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`${fraunces.variable} ${jost.variable}`} style={csVars}>
      {children}
    </div>
  );
}
