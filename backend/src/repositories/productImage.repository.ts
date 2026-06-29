import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

/** Data-access for the ProductImage table (Cloudinary publicId + secure_url). */
export const productImageRepository = {
  findByProduct: (productId: string) =>
    prisma.productImage.findMany({ where: { productId }, orderBy: { position: 'asc' } }),

  findById: (id: string) => prisma.productImage.findUnique({ where: { id } }),

  create: (data: Prisma.ProductImageUncheckedCreateInput) =>
    prisma.productImage.create({ data }),

  delete: (id: string) => prisma.productImage.delete({ where: { id } }),

  /** Highest gallery position currently used, or -1 if none (so next is 0). */
  async maxPosition(productId: string): Promise<number> {
    const result = await prisma.productImage.aggregate({
      where: { productId },
      _max: { position: true },
    });
    return result._max.position ?? -1;
  },
};
