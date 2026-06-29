import { prisma } from '../config/prisma';

/**
 * Data-access for the Wishlist table. Each row links a User to a Product
 * (unique per pair). Listing returns the wishlisted products with the same
 * includes the catalog uses (brand, first image, variants for price display).
 */
export const wishlistRepository = {
  findByUser: (userId: string) =>
    prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
            images: { orderBy: { position: 'asc' }, take: 1 },
            variants: { orderBy: { price: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

  /** Idempotent add — a repeated add for the same pair is a no-op (unique upsert). */
  add: (userId: string, productId: string) =>
    prisma.wishlist.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    }),

  /** Remove by pair. deleteMany avoids a not-found error when the row is absent. */
  remove: (userId: string, productId: string) =>
    prisma.wishlist.deleteMany({ where: { userId, productId } }),
};
