import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AuditLanding } from "@/components/audit/AuditLanding";

export const metadata: Metadata = {
  title: "Online audit salonu zdarma | HAIRWEB",
  description:
    "Zjistěte během pár minut, jak si váš salon vede online. HAIRWEB SCORE 0–100 a konkrétní doporučení pro web, Google, rezervace a další.",
  alternates: {
    canonical: "/audit",
  },
  openGraph: {
    title: "Online audit salonu zdarma | HAIRWEB",
    description:
      "Řekněte nám, který salon je váš. Zbytek zjistíme za vás. HAIRWEB SCORE a jasná doporučení.",
    url: "https://hairweb.cz/audit",
    siteName: "HAIRWEB",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function AuditPage() {
  return (
    <>
      <Header />
      <main>
        <AuditLanding />
      </main>
      <Footer />
    </>
  );
}
