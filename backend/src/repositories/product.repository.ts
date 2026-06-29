import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface ProductListFilters {
  brandId?: string;
  categoryId?: string;
  search?: string;
  skip: number;
  take: number;
}

/** Builds the shared `where` clause from list filters. */
const buildWhere = (f: ProductListFilters): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = {};
  if (f.brandId) where.brandId = f.brandId;
  if (f.categoryId) where.categories = { some: { categoryId: f.categoryId } };
  if (f.search) where.name = { contains: f.search, mode: 'insensitive' };
  return where;
};

/** Data-access for the Product table (and its category links). */
export const productRepository = {
  /**
   * Paginated listing for catalog pages. Includes brand, category links, the
   * first image (gallery position 0), and variants for stock/price display.
   */
  list: (f: ProductListFilters) => {
    const where = buildWhere(f);
    return prisma.product.findMany({
      where,
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { orderBy: { price: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: f.skip,
      take: f.take,
    });
  },

  count: (f: ProductListFilters) => prisma.product.count({ where: buildWhere(f) }),

  /** Full product detail: brand, categories, all images (ordered), all variants. */
  findById: (id: string) =>
    prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { position: 'asc' } },
        variants: { orderBy: { price: 'asc' } },
      },
    }),

  /** Lightweight existence/ownership check without the heavy includes. */
  findBare: (id: string) => prisma.product.findUnique({ where: { id } }),

  create: (data: Prisma.ProductCreateInput) =>
    prisma.product.create({
      data,
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: true,
        variants: true,
      },
    }),

  update: (id: string, data: Prisma.ProductUpdateInput) =>
    prisma.product.update({
      where: { id },
      data,
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { position: 'asc' } },
        variants: { orderBy: { price: 'asc' } },
      },
    }),

  delete: (id: string) => prisma.product.delete({ where: { id } }),

  /** Cloudinary publicIds of every image under a product — for cleanup on delete. */
  findImagePublicIds: (id: string) =>
    prisma.productImage.findMany({ where: { productId: id }, select: { publicId: true } }),

  replaceCategories: (id: string, categoryIds: string[]) =>
    prisma.product.update({
      where: { id },
      data: {
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    }),
};
