import { DemoBanner } from "@/components/demos/DemoBanner";
import { KamiyaDemo } from "@/components/demos/KamiyaDemo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kamiya Barbershop — ukázka | Hairweb.cz",
  description:
    "Ukázkový koncept Kamiya — barbershop v duchu japonského řemesla.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <DemoBanner name="Kamiya Barbershop" />
      <KamiyaDemo />
    </>
  );
}
