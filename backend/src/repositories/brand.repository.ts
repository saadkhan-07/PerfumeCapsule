import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

/**
 * Data-access for the Brand table. The only layer that talks to Prisma for brands.
 */
export const brandRepository = {
  findAll: () => prisma.brand.findMany({ orderBy: { name: 'asc' } }),

  findById: (id: string) => prisma.brand.findUnique({ where: { id } }),

  create: (data: Prisma.BrandCreateInput) => prisma.brand.create({ data }),

  update: (id: string, data: Prisma.BrandUpdateInput) =>
    prisma.brand.update({ where: { id }, data }),

  delete: (id: string) => prisma.brand.delete({ where: { id } }),

  /** Number of products under a brand — used to block deletion of non-empty brands. */
  countProducts: (id: string) => prisma.product.count({ where: { brandId: id } }),
};
