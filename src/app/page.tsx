import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { AboutSection } from "@/components/sections/AboutSection";
import { AreasSection } from "@/components/sections/AreasSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { ForesightSection } from "@/components/sections/ForesightSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HubSection } from "@/components/sections/HubSection";
import { ManagedSection } from "@/components/sections/ManagedSection";
import { OneChangeSection } from "@/components/sections/OneChangeSection";
import { PartnerSection } from "@/components/sections/PartnerSection";
import { PhilosophySection } from "@/components/sections/PhilosophySection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { SocialProofSection } from "@/components/sections/SocialProofSection";

const LeadFormSection = dynamic(
  () =>
    import("@/components/sections/LeadFormSection").then(
      (m) => m.LeadFormSection,
    ),
  {
    loading: () => (
      <section
        id="audit"
        className="scroll-mt-24 border-b border-line bg-sand section-pad"
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
        <SocialProofSection />
        <PhilosophySection />
        <ProcessSection />
        <AreasSection />
        <HubSection />
        <OneChangeSection />
        <PartnerSection />
        <LeadFormSection />
        <ManagedSection />
        <ForesightSection />
        <PortfolioSection />
        <AboutSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
      <MobileStickyCta />
    </>
  );
}
