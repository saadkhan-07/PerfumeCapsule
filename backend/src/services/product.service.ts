import { Prisma } from '@prisma/client';
import { productRepository } from '../repositories/product.repository';
import { brandRepository } from '../repositories/brand.repository';
import { deleteImage } from './upload.service';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slug';
import {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
} from '../validators/product.validator';

export interface PaginatedProducts {
  items: Awaited<ReturnType<typeof productRepository.list>>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/** Business logic for products: filtering/pagination, slug, brand/category integrity, image cleanup. */
export const productService = {
  async list(query: ListProductsQuery): Promise<PaginatedProducts> {
    const { page, limit, brandId, categoryId, search } = query;
    const filters = { brandId, categoryId, search, skip: (page - 1) * limit, take: limit };

    const [items, total] = await Promise.all([
      productRepository.list(filters),
      productRepository.count(filters),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  },

  async create(input: CreateProductInput) {
    const brand = await brandRepository.findById(input.brandId);
    if (!brand) {
      throw ApiError.unprocessable('Invalid brandId: brand does not exist');
    }

    return productRepository.create({
      name: input.name,
      slug: slugify(input.name),
      description: input.description ?? null,
      isActive: input.isActive ?? true,
      brand: { connect: { id: input.brandId } },
      categories: {
        create: (input.categoryIds ?? []).map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
    });
  },

  async update(id: string, input: UpdateProductInput) {
    const existing = await productRepository.findBare(id);
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    if (input.brandId) {
      const brand = await brandRepository.findById(input.brandId);
      if (!brand) {
        throw ApiError.unprocessable('Invalid brandId: brand does not exist');
      }
    }

    const data: Prisma.ProductUpdateInput = {};
    if (input.name !== undefined) {
      data.name = input.name;
      data.slug = slugify(input.name);
    }
    if (input.description !== undefined) data.description = input.description;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.brandId !== undefined) data.brand = { connect: { id: input.brandId } };

    // Replace the full category set when provided.
    if (input.categoryIds !== undefined) {
      data.categories = {
        deleteMany: {},
        create: input.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      };
    }

    return productRepository.update(id, data);
  },

  /** Delete a product and clean up every Cloudinary image asset it owns. */
  async delete(id: string): Promise<void> {
    const existing = await productRepository.findBare(id);
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    const images = await productRepository.findImagePublicIds(id);

    // Remove DB row first (cascades variants, image rows, category links)...
    await productRepository.delete(id);

    // ...then delete the Cloudinary assets so none are orphaned.
    for (const { publicId } of images) {
      await deleteImage(publicId);
    }
  },
};
