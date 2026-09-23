import { Resend } from "resend";
import {
  getMailFrom,
  getMailNotifyTo,
  getMailReplyTo,
  getMailSiteUrl,
} from "@/lib/leads/mail-config";
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
  const to = getMailNotifyTo();
  const from = getMailFrom();

  if (!resend || !to || !from) {
    console.warn("[email] Skipping admin notification — Resend env not configured");
    return { skipped: true as const };
  }

  const siteUrl = getMailSiteUrl();
  const adminUrl = `${siteUrl}/admin/leads/${lead.id}`;
  const subjectName = lead.salon_name || lead.name;

  const text = [
    "NOVÝ HAIRWEB LEAD",
    "",
    `Jméno: ${lead.name}`,
    `Salon: ${lead.salon_name || "—"}`,
    `E-mail: ${lead.email || "—"}`,
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
    replyTo: lead.email || getMailReplyTo(),
    subject: `Nový audit – HAIRWEB – ${subjectName}`,
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
  const from = getMailFrom();
  const replyTo = getMailReplyTo();

  if (!lead.email) {
    return { skipped: true as const };
  }

  if (!resend || !from) {
    console.warn("[email] Skipping customer confirmation — Resend env not configured");
    return { skipped: true as const };
  }

  const text = [
    `Dobrý den ${lead.name},`,
    "",
    "děkuji za zájem o online audit salonu.",
    "",
    "Podívám se na web, rezervace, Google, recenze a další oblasti — a ozvu se vám s tím, co funguje, kde jsou slabá místa a co má smysl řešit.",
    "",
    "Pokud jste poslali jen Instagram, je to v pořádku. I podle něj si dokážu udělat představu o salonu.",
    "",
    "S pozdravem",
    "",
    "Lukáš Ptáčník",
    "HAIRWEB.cz",
  ].join("\n");

  const { error } = await resend.emails.send({
    from,
    to: lead.email,
    replyTo,
    subject: "Online audit — HAIRWEB",
    text,
  });

  if (error) {
    console.error("[email] Customer confirmation failed", error);
    throw new Error("Customer confirmation failed");
  }

  return { skipped: false as const };
}

/** Client from audit result wants to discuss findings. */
export async function sendAuditDiscussNotification(input: {
  auditId: string;
  leadId: string | null;
  salonName: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  overallScore: number | null;
}) {
  const resend = getResend();
  const to = getMailNotifyTo();
  const from = getMailFrom();

  if (!resend || !to || !from) {
    console.warn(
      "[email] Skipping audit discuss notification — Resend env not configured",
    );
    return { skipped: true as const };
  }

  const siteUrl = getMailSiteUrl();
  const auditUrl = `${siteUrl}/audit/${input.auditId}`;
  const adminUrl = input.leadId
    ? `${siteUrl}/admin/leads/${input.leadId}`
    : null;

  const text = [
    "KLIENT CHCE PROBRAT AUDIT",
    "",
    "Tento klient z výsledku online auditu chce domluvit konzultaci / probrat výsledek.",
    "",
    `Salon: ${input.salonName}`,
    `Jméno: ${input.name}`,
    `E-mail: ${input.email}`,
    `Telefon: ${input.phone || "—"}`,
    `HAIRWEB SCORE: ${input.overallScore != null ? `${input.overallScore}/100` : "—"}`,
    `Audit: ${auditUrl}`,
    adminUrl ? `Lead v CRM: ${adminUrl}` : null,
    "",
    "Zpráva od klienta:",
    input.message.trim() ||
      "(bez doplňující zprávy — chce probrat výsledek auditu)",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: input.email,
    subject: `Chce probrat audit – ${input.salonName}`,
    text,
  });

  if (error) {
    console.error("[email] Audit discuss notification failed", error);
    throw new Error("Audit discuss notification failed");
  }

  return { skipped: false as const };
}
