import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  LeadThanksContent,
  LeadThanksGuard,
} from "@/components/LeadThanksPage";

export const metadata: Metadata = {
  title: "Poptávka odeslána | Hairweb.cz",
  description:
    "Děkujeme za poptávku. Ozveme se co nejdříve ohledně webu pro váš salon.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/poptavka-odeslana",
  },
};

export default function LeadThanksRoutePage() {
  return (
    <>
      <Header />
      <main className="flex-1 border-t border-line bg-mist">
        <LeadThanksGuard>
          <LeadThanksContent />
        </LeadThanksGuard>
      </main>
      <Footer />
    </>
  );
}
