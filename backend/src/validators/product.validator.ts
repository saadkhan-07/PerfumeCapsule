import { z } from 'zod';

export const productIdParam = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Product id is required') }),
});

/**
 * Query schema for `GET /products`. Coerces page/limit to bounded integers.
 * Exported separately so the controller can re-parse `req.query` to obtain the
 * coerced values (Express 5 query is read-only, so `validate` can't write back).
 */
export const listProductsQuery = z.strictObject({
  brandId: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const listProductsSchema = z.object({ query: listProductsQuery });

export const createProductSchema = z.object({
  body: z.strictObject({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
    description: z.string().trim().max(5000).optional(),
    brandId: z.string().min(1, 'brandId is required'),
    categoryIds: z.array(z.string().min(1)).optional().default([]),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Product id is required') }),
  body: z.strictObject({
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().max(5000).optional(),
    brandId: z.string().min(1).optional(),
    categoryIds: z.array(z.string().min(1)).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListProductsQuery = z.infer<typeof listProductsQuery>;
