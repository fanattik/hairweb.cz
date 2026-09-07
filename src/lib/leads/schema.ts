import { z } from "zod";
import {
  BUSINESS_SIZES,
  INSTAGRAM_QUALITIES,
  LEAD_PACKAGES,
  LEAD_SOURCE_DETAILS,
  LEAD_STATUSES,
} from "@/lib/leads/types";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const emptyToNull = (value: unknown) => {
  if (value === "" || value === undefined) return null;
  return value;
};

const optionalTrimmed = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(500).optional(),
);

const nullableTrimmed = z.preprocess(
  emptyToNull,
  z.string().trim().max(5000).nullable().optional(),
);

const optionalBool = z
  .union([z.boolean(), z.null()])
  .optional()
  .nullable();

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
  companyWebsite: z.string().max(200).optional().nullable(),
  formStartedAt: z.number().int().positive().optional(),
});

export type LeadSubmitInput = z.infer<typeof leadSubmitSchema>;

const scoreInt = (max: number) =>
  z.number().int().min(0).max(max).nullable().optional();

/** Shared qualification fields for outbound create + CRM update. */
export const leadQualificationSchema = z.object({
  salon_name: z.preprocess(emptyToNull, z.string().trim().max(150).nullable().optional()),
  contact_person: z.preprocess(emptyToNull, z.string().trim().max(100).nullable().optional()),
  city: z.preprocess(emptyToNull, z.string().trim().max(100).nullable().optional()),
  region: z.preprocess(emptyToNull, z.string().trim().max(100).nullable().optional()),
  phone: z.preprocess(emptyToNull, z.string().trim().max(50).nullable().optional()),
  website: z.preprocess(emptyToNull, z.string().trim().max(500).nullable().optional()),

  google_rating: z.number().min(0).max(5).nullable().optional(),
  google_reviews_count: z.number().int().min(0).nullable().optional(),
  google_maps_url: z.preprocess(emptyToNull, z.string().trim().max(1000).nullable().optional()),
  google_place_id: z.preprocess(emptyToNull, z.string().trim().max(200).nullable().optional()),

  instagram_url: z.preprocess(emptyToNull, z.string().trim().max(500).nullable().optional()),
  instagram_handle: z.preprocess(emptyToNull, z.string().trim().max(100).nullable().optional()),
  instagram_active: optionalBool,
  instagram_followers: z.number().int().min(0).nullable().optional(),
  instagram_quality: z.enum(INSTAGRAM_QUALITIES).nullable().optional(),
  instagram_media_count: z.number().int().min(0).nullable().optional(),
  instagram_name: z.preprocess(emptyToNull, z.string().trim().max(200).nullable().optional()),
  instagram_biography: z.preprocess(emptyToNull, z.string().trim().max(2000).nullable().optional()),
  instagram_suggested_quality: z.enum(INSTAGRAM_QUALITIES).nullable().optional(),

  has_online_booking: optionalBool,
  booking_provider: z.preprocess(emptyToNull, z.string().trim().max(100).nullable().optional()),
  booking_url: z.preprocess(emptyToNull, z.string().trim().max(500).nullable().optional()),

  business_size: z.enum(BUSINESS_SIZES).nullable().optional(),
  premium_impression: optionalBool,
  professional_photos: optionalBool,
  professional_branding: optionalBool,
  paid_marketing: optionalBool,

  has_website: optionalBool,
  website_design_score: scoreInt(20),
  website_mobile_score: scoreInt(15),
  website_cta_score: scoreInt(15),
  website_content_score: scoreInt(15),
  website_trust_score: scoreInt(10),
  website_seo_score: scoreInt(15),
  website_performance_score: scoreInt(10),

  website_outdated: optionalBool,
  website_mobile_problem: optionalBool,
  website_clear_booking_cta: optionalBool,
  website_has_prices: optionalBool,
  website_has_gallery: optionalBool,
  website_has_team: optionalBool,
  website_has_reviews: optionalBool,

  website_audit: nullableTrimmed,
  opportunity_note: nullableTrimmed,
});

export const leadCrmUpdateSchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    notes: z.string().max(5000).nullable().optional(),
    last_contact_at: z.string().datetime().nullable().optional(),
    next_followup_at: z.string().datetime().nullable().optional(),
    won_value: z.number().nonnegative().nullable().optional(),
    lost_reason: z.string().max(1000).nullable().optional(),
    name: z.string().trim().min(2).max(100).optional(),
    email: z.preprocess(
      emptyToNull,
      z.string().trim().email().max(255).nullable().optional(),
    ),
  })
  .merge(leadQualificationSchema);

export const outboundLeadSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    salonName: optionalTrimmed,
    email: z.preprocess(
      emptyToNull,
      z.string().trim().email().max(255).nullable().optional(),
    ),
    phone: optionalTrimmed,
    website: z.preprocess((value) => {
      if (value === "" || value == null) return undefined;
      return value;
    }, websiteSchema.optional()),
    notes: optionalTrimmed,
  })
  .merge(
    leadQualificationSchema.omit({
      salon_name: true,
      phone: true,
      website: true,
    }),
  );
