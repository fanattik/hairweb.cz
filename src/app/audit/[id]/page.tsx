import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AuditResultView } from "@/components/audit/AuditResultView";
import { getSalonAudit } from "@/lib/audit/persist";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getSalonAudit(id);
  if (!audit) return { title: "Audit | HAIRWEB" };
  return {
    title: `HAIRWEB SCORE ${audit.overall_score}/100 — ${audit.salon_name}`,
    description: audit.summary || "Výsledek online auditu salonu HAIRWEB.",
    robots: { index: false, follow: false },
  };
}

export default async function AuditResultPage({ params }: Props) {
  const { id } = await params;
  const audit = await getSalonAudit(id);
  if (!audit || audit.status !== "completed") notFound();

  return (
    <>
      <Header />
      <main>
        <AuditResultView audit={audit} />
      </main>
      <Footer />
    </>
  );
}
