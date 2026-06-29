import { z } from 'zod';

export const categoryIdParam = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Category id is required') }),
});

export const createCategorySchema = z.object({
  body: z.strictObject({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  }),
});

export const updateCategorySchema = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Category id is required') }),
  body: z.strictObject({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
