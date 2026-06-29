import { z } from 'zod';

/**
 * Site settings update (admin only). Every field is optional — this is a partial
 * update (PATCH semantics over PUT) on the singleton row.
 *
 * The request arrives as multipart/form-data (logo + favicon are file uploads),
 * so numbers and booleans come in as strings and are coerced here. `logoUrl` /
 * `faviconUrl` are NOT accepted from the client — they are set by the upload
 * service from the uploaded files. strictObject rejects any other unexpected field.
 */

// Money: coerced from form strings, non-negative, capped to Decimal(10,2) range.
const money = z.coerce.number().nonnegative('Must be zero or greater').max(99999999.99);

// Multipart booleans: accept real booleans (JSON) and the strings "true"/"false".
// (z.coerce.boolean is unsafe here — Boolean("false") === true.)
const formBoolean = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => v === true || v === 'true');

const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalUrl = z.string().trim().url('Must be a valid URL').max(500).optional();

export const updateSettingsSchema = z.object({
  body: z.strictObject({
    // Identity
    siteName: z.string().trim().min(1, 'Site name is required').max(100).optional(),
    tagline: optionalText(200),

    // Contact
    contactEmail: z.preprocess(
      (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
      z.email('Must be a valid email').optional(),
    ),
    contactPhone: optionalText(30),

    // Address
    addressLine: optionalText(300),
    city: optionalText(100),

    // Social
    instagramUrl: optionalUrl,
    facebookUrl: optionalUrl,
    tiktokUrl: optionalUrl,

    // Commerce + shipping rule (editable values; the rule itself lives in code)
    currency: z.string().trim().min(1).max(10).optional(),
    localCity: z.string().trim().min(1, 'Local city is required').max(100).optional(),
    localShippingFee: money.optional(),
    outstationShippingFee: money.optional(),
    freeShippingThreshold: money.optional(),

    // Ops
    announcementBar: optionalText(300),
    maintenanceMode: formBoolean.optional(),
  }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
