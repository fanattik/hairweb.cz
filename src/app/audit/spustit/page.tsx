import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AuditWizard } from "@/components/audit/AuditWizard";

export const metadata: Metadata = {
  title: "Spustit online audit salonu | HAIRWEB",
  description:
    "Několik jednoduchých otázek. Zbytek zjistíme za vás. Výsledek během několika minut.",
  alternates: {
    canonical: "/audit/spustit",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuditStartPage() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh]">
        <AuditWizard />
      </main>
      <Footer />
    </>
  );
}
