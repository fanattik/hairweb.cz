import { z } from "zod";
import { LEAD_PACKAGES, LEAD_SOURCE_DETAILS } from "@/lib/leads/types";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

/** Accepts URL, domain, Instagram path, or @handle. */
export const websiteSchema = z
  .string()
  .trim()
  .min(2, "Přidejte web nebo Instagram.")
  .max(500, "Web / Instagram je příliš dlouhý.")
  .refine((value) => {
    if (value.startsWith("@") && value.length >= 2) return true;
    if (/^https?:\/\//i.test(value)) {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    // domain, path, or handle-like string without spaces
    return !/\s/.test(value) && /[a-z0-9]/i.test(value);
  }, "Zadejte platný web, Instagram nebo @handle.");

export const leadSubmitSchema = z.object({
  name: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: "Vyplňte jméno." })
      .trim()
      .min(2, "Jméno musí mít alespoň 2 znaky.")
      .max(100, "Jméno je příliš dlouhé."),
  ),
  salonName: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(150, "Název salonu je příliš dlouhý.").optional(),
  ),
  email: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: "Vyplňte e-mail." })
      .trim()
      .email("Zadejte platný e-mail.")
      .max(255),
  ),
  phone: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(50, "Telefon je příliš dlouhý.").optional(),
  ),
  website: z.preprocess(emptyToUndefined, websiteSchema),
  message: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000, "Zpráva je příliš dlouhá.").optional(),
  ),
  package: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "string") return value.toLowerCase();
    return value;
  }, z.enum(LEAD_PACKAGES).optional()),
  sourceDetail: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  }, z.enum(LEAD_SOURCE_DETAILS).optional()),
  utm: z
    .object({
      utm_source: z.string().max(200).optional().nullable(),
      utm_medium: z.string().max(200).optional().nullable(),
      utm_campaign: z.string().max(200).optional().nullable(),
      utm_content: z.string().max(200).optional().nullable(),
      utm_term: z.string().max(200).optional().nullable(),
    })
    .optional(),
  referrer: z.string().max(1000).optional().nullable(),
  landingPage: z.string().max(1000).optional().nullable(),
  /** Honeypot — must stay empty. */
  companyWebsite: z.string().max(200).optional().nullable(),
  /** Form load timestamp (ms). */
  formStartedAt: z.number().int().positive().optional(),
});

export type LeadSubmitInput = z.infer<typeof leadSubmitSchema>;

export const leadCrmUpdateSchema = z.object({
  status: z
    .enum([
      "new",
      "contacted",
      "interested",
      "meeting",
      "proposal",
      "won",
      "lost",
    ])
    .optional(),
  score: z.number().int().min(0).max(100).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  last_contact_at: z.string().datetime().nullable().optional(),
  next_followup_at: z.string().datetime().nullable().optional(),
  won_value: z.number().nonnegative().nullable().optional(),
  lost_reason: z.string().max(1000).nullable().optional(),
});

export const outboundLeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  salonName: z.string().trim().max(150).optional(),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional(),
  website: websiteSchema,
  score: z.number().int().min(0).max(100).optional(),
  notes: z.string().trim().max(5000).optional(),
});
