import { z } from 'zod';

export const addImagesParam = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Product id is required') }),
});

export const deleteImageParam = z.object({
  params: z.strictObject({
    productId: z.string().min(1, 'Product id is required'),
    imageId: z.string().min(1, 'Image id is required'),
  }),
});
