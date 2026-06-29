import { z } from 'zod';

/** Add a product to the wishlist. */
export const addWishlistSchema = z.object({
  body: z.strictObject({
    productId: z.string().min(1, 'productId is required'),
  }),
});

/** `/wishlist/:productId` path param. */
export const wishlistProductIdParam = z.object({
  params: z.strictObject({ productId: z.string().min(1, 'productId is required') }),
});

export type AddWishlistInput = z.infer<typeof addWishlistSchema>['body'];
