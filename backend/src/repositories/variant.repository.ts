import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

/** Data-access for the ProductVariant table (inventory is tracked per variant). */
export const variantRepository = {
  findByProduct: (productId: string) =>
    prisma.productVariant.findMany({ where: { productId }, orderBy: { price: 'asc' } }),

  findById: (id: string) => prisma.productVariant.findUnique({ where: { id } }),

  create: (data: Prisma.ProductVariantUncheckedCreateInput) =>
    prisma.productVariant.create({ data }),

  update: (id: string, data: Prisma.ProductVariantUpdateInput) =>
    prisma.productVariant.update({ where: { id }, data }),

  delete: (id: string) => prisma.productVariant.delete({ where: { id } }),
};
