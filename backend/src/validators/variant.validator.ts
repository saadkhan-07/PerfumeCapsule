import { z } from 'zod';

// Sizes always come from variants (never hardcoded) — `size` is free-form text
// like "5ml", "10ml", "30ml".
const sizeField = z.string().trim().min(1, 'Size is required').max(20);
const priceField = z
  .number({ message: 'Price is required' })
  .positive('Price must be greater than 0')
  .max(99999999.99);
const stockField = z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative');
const skuField = z.string().trim().min(1).max(60).optional();

export const listVariantsParam = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Product id is required') }),
});

export const createVariantSchema = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Product id is required') }),
  body: z.strictObject({
    size: sizeField,
    price: priceField,
    stock: stockField.optional(),
    sku: skuField,
  }),
});

export const updateVariantSchema = z.object({
  params: z.strictObject({
    productId: z.string().min(1, 'Product id is required'),
    variantId: z.string().min(1, 'Variant id is required'),
  }),
  body: z.strictObject({
    size: sizeField.optional(),
    price: priceField.optional(),
    stock: stockField.optional(),
    sku: skuField,
  }),
});

export const variantParam = z.object({
  params: z.strictObject({
    productId: z.string().min(1, 'Product id is required'),
    variantId: z.string().min(1, 'Variant id is required'),
  }),
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>['body'];
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>['body'];
