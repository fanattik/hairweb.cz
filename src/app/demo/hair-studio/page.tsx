import { DemoBanner } from "@/components/demos/DemoBanner";
import { StudioNoraDemo } from "@/components/demos/StudioNoraDemo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Nora — ukázka | Hairweb.cz",
  description:
    "Ukázkový koncept Studio Nora — kadeřnictví jako rituál.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <DemoBanner name="Studio Nora" />
      <StudioNoraDemo />
    </>
  );
}
