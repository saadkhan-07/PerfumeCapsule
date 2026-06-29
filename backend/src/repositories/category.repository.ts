import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

/** Data-access for the Category table. */
export const categoryRepository = {
  findAll: () => prisma.category.findMany({ orderBy: { name: 'asc' } }),

  findById: (id: string) => prisma.category.findUnique({ where: { id } }),

  create: (data: Prisma.CategoryCreateInput) => prisma.category.create({ data }),

  update: (id: string, data: Prisma.CategoryUpdateInput) =>
    prisma.category.update({ where: { id }, data }),

  delete: (id: string) => prisma.category.delete({ where: { id } }),
};
