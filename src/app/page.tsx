import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { AboutSection } from "@/components/sections/AboutSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ReservationsSection } from "@/components/sections/ReservationsSection";

const LeadFormSection = dynamic(
  () =>
    import("@/components/sections/LeadFormSection").then(
      (m) => m.LeadFormSection,
    ),
  {
    loading: () => (
      <section
        id="poptavka"
        className="scroll-mt-24 border-t border-line bg-mist px-5 py-16 sm:px-8 sm:py-20"
        aria-busy="true"
      >
        <div className="mx-auto h-64 max-w-xl animate-pulse bg-foam/60" />
      </section>
    ),
  },
);

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <BeforeAfterSection />
        <PortfolioSection />
        <FeaturesSection />
        <ReservationsSection />
        <ProcessSection />
        <PricingSection />
        <AboutSection />
        <FaqSection />
        <FinalCtaSection />
        <LeadFormSection />
      </main>
      <Footer />
      <MobileStickyCta />
    </>
  );
}
