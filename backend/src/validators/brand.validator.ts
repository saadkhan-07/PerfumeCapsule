import { z } from 'zod';

/** Reusable cuid path-param schema for `/brands/:id`. */
export const brandIdParam = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Brand id is required') }),
});

/**
 * Brand create/update. The logo arrives as a multipart file (handled by multer),
 * so only text fields are validated here. `name` is required on create; update
 * allows changing the name and/or replacing the logo, but must change something.
 */
export const createBrandSchema = z.object({
  body: z.strictObject({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().trim().max(1000).optional(),
  }),
});

export const updateBrandSchema = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Brand id is required') }),
  body: z.strictObject({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
    description: z.string().trim().max(1000).optional(),
  }),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>['body'];
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>['body'];
