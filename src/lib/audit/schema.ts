import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const auditAnswersSchema = z.object({
  salonName: z.string().trim().min(2).max(150),
  city: z.string().trim().min(2).max(100),
  address: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  googlePlaceId: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(200).optional(),
  ),
  googleMapsUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500).optional(),
  ),
  googleRating: z.number().min(0).max(5).nullable().optional(),
  googleReviewsCount: z.number().int().min(0).nullable().optional(),
  suggestedWebsite: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500).nullable().optional(),
  ),

  hasWebsite: z.boolean().nullable(),
  websiteUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500).optional(),
  ),
  websiteBooking: z.enum(["yes", "no", "unknown"]).optional(),

  directoryPlatforms: z
    .array(
      z.enum([
        "firmy_cz",
        "mapy_cz",
        "kdomestriha",
        "zlate_stranky",
        "other",
        "none",
      ]),
    )
    .default([]),

  bookingMethods: z
    .array(
      z.enum([
        "online",
        "phone",
        "instagram",
        "whatsapp",
        "email",
        "in_person",
        "other",
      ]),
    )
    .default([]),
  bookingProvider: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(120).optional(),
  ),
  booking247: z.enum(["yes", "no", "unknown"]).optional(),

  socialPlatforms: z
    .array(z.enum(["instagram", "facebook", "tiktok", "other", "none"]))
    .default([]),
  instagramHandle: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(100).optional(),
  ),
  facebookUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(300).optional(),
  ),
  socialConfirmed: z.boolean().optional(),

  remindVisits: z.enum(["yes", "no", "partial"]).optional(),
  reactivateCustomers: z.enum(["yes", "no"]).optional(),
  paidAds: z.enum(["regular", "occasional", "no"]).optional(),
  knowSources: z.enum(["yes", "approx", "no"]).optional(),

  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(50).optional()),
  consent: z.literal(true, {
    error: "Pro vytvoření auditu je potřeba souhlas.",
  }),
});

export const auditSubmitSchema = z.object({
  answers: auditAnswersSchema,
  companyWebsite: z.string().optional(),
  formStartedAt: z.number().optional(),
  attribution: z
    .object({
      first: z.record(z.string(), z.unknown()).optional(),
      last: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  sourceDetail: z.string().max(50).optional(),
});

export type AuditSubmitInput = z.infer<typeof auditSubmitSchema>;
