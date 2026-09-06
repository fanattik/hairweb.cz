import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { AboutSection } from "@/components/sections/AboutSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { LeadFormSection } from "@/components/sections/LeadFormSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ReservationsSection } from "@/components/sections/ReservationsSection";

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
