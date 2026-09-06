import type { ReactNode } from "react";
import { Cormorant_Garamond, IBM_Plex_Sans, Shippori_Mincho } from "next/font/google";
import "@/components/demos/kamiya.css";

const display = Cormorant_Garamond({
  variable: "--font-kamiya-display",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = IBM_Plex_Sans({
  variable: "--font-kamiya-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const mincho = Shippori_Mincho({
  variable: "--font-kamiya-mincho",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function BarberLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${sans.variable} ${mincho.variable}`}>
      {children}
    </div>
  );
}
