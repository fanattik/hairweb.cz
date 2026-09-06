import { Resend } from "resend";
import type { Lead } from "@/lib/leads/types";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function packageLabel(value: Lead["package"]) {
  if (value === "start") return "START";
  if (value === "pro") return "PRO";
  return "Neuvedeno";
}

export async function sendAdminNotification(lead: Lead) {
  const resend = getResend();
  const to = process.env.HAIRWEB_NOTIFICATION_EMAIL;
  const from = process.env.HAIRWEB_FROM_EMAIL;

  if (!resend || !to || !from) {
    console.warn("[email] Skipping admin notification — Resend env not configured");
    return { skipped: true as const };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hairweb.cz";
  const adminUrl = `${siteUrl}/admin/leads/${lead.id}`;
  const subjectName = lead.salon_name || lead.name;

  const text = [
    "NOVÝ HAIRWEB LEAD",
    "",
    `Jméno: ${lead.name}`,
    `Salon: ${lead.salon_name || "—"}`,
    `E-mail: ${lead.email}`,
    `Telefon: ${lead.phone || "—"}`,
    `Web / Instagram: ${lead.website}`,
    `Balíček: ${packageLabel(lead.package)}`,
    `Zdroj CTA: ${lead.source_detail || "—"}`,
    `UTM: ${[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || "—"}`,
    `Referrer: ${lead.referrer || "—"}`,
    "",
    "Zpráva:",
    lead.message || "—",
    "",
    `Otevřít lead: ${adminUrl}`,
  ].join("\n");

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Nový lead – Hairweb.cz – ${subjectName}`,
    text,
  });

  if (error) {
    console.error("[email] Admin notification failed", error);
    throw new Error("Admin notification failed");
  }

  return { skipped: false as const };
}

export async function sendCustomerConfirmation(lead: Lead) {
  const resend = getResend();
  const from = process.env.HAIRWEB_FROM_EMAIL;

  if (!resend || !from) {
    console.warn("[email] Skipping customer confirmation — Resend env not configured");
    return { skipped: true as const };
  }

  const text = [
    `Dobrý den ${lead.name},`,
    "",
    "děkuji za zprávu.",
    "",
    "Podívám se na váš současný web nebo Instagram a ozvu se vám s návrhem dalšího postupu.",
    "",
    "Pokud jste poslali jen Instagram, je to naprosto v pořádku — i podle něj si dokážu udělat představu o vašem salonu a stylu.",
    "",
    "Lukáš",
    "Hairweb.cz",
  ].join("\n");

  const { error } = await resend.emails.send({
    from,
    to: lead.email,
    subject: "Díky za zprávu – Hairweb.cz",
    text,
  });

  if (error) {
    console.error("[email] Customer confirmation failed", error);
    throw new Error("Customer confirmation failed");
  }

  return { skipped: false as const };
}
