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
