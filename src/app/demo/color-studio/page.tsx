import { DemoBanner } from "@/components/demos/DemoBanner";
import { ColorStudioDemo } from "@/components/demos/ColorStudioDemo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Studio — ukázka | Hairweb.cz",
  description:
    "Ukázkový koncept Color Studio — kadeřnické studio zaměřené na barvení vlasů.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <DemoBanner name="Color Studio" />
      <ColorStudioDemo />
    </>
  );
}
