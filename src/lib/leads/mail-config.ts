import { site } from "@/lib/site";

const MAIL_FROM_NAME = "Lukáš z HAIRWEB";

/**
 * Shared Resend From header — same display name for every outbound mail.
 * Accepts either a bare address or an already-formatted `Name <email>`.
 */
export function getMailFrom(): string | null {
  const raw = process.env.HAIRWEB_FROM_EMAIL?.trim();
  if (!raw) return null;
  if (raw.includes("<") && raw.includes(">")) {
    const address = raw.slice(raw.indexOf("<") + 1, raw.indexOf(">")).trim();
    if (!address) return null;
    return `${MAIL_FROM_NAME} <${address}>`;
  }
  return `${MAIL_FROM_NAME} <${raw}>`;
}

export function getMailReplyTo(): string | undefined {
  return (
    process.env.HAIRWEB_REPLY_TO_EMAIL?.trim() ||
    process.env.HAIRWEB_NOTIFICATION_EMAIL?.trim() ||
    undefined
  );
}

export function getMailNotifyTo(): string | null {
  return process.env.HAIRWEB_NOTIFICATION_EMAIL?.trim() || null;
}

/** Public site URL for links in outbound emails — never localhost. */
export function getMailSiteUrl(): string {
  const candidates = [
    process.env.HAIRWEB_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    site.url,
  ];

  for (const raw of candidates) {
    const value = raw?.trim().replace(/\/$/, "");
    if (!value) continue;
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      const host = url.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.endsWith(".local")
      ) {
        continue;
      }
      return url.origin;
    } catch {
      continue;
    }
  }

  return site.url;
}
