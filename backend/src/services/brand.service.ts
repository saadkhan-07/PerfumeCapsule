import { Brand, Prisma } from '@prisma/client';
import { brandRepository } from '../repositories/brand.repository';
import { uploadImage, deleteImage, UploadResult } from './upload.service';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slug';
import { CreateBrandInput, UpdateBrandInput } from '../validators/brand.validator';

/**
 * Business logic for brands. Owns slug generation, Cloudinary lifecycle
 * (upload on create/replace, delete on removal), and integrity checks.
 */
export const brandService = {
  list: (): Promise<Brand[]> => brandRepository.findAll(),

  async getById(id: string): Promise<Brand> {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw ApiError.notFound('Brand not found');
    }
    return brand;
  },

  /** Create a brand, optionally uploading a logo (temp file path from multer). */
  async create(input: CreateBrandInput, logoPath?: string): Promise<Brand> {
    let logo: UploadResult | null = null;
    if (logoPath) {
      logo = await uploadImage(logoPath, 'brands', 'logo');
    }

    return brandRepository.create({
      name: input.name,
      slug: slugify(input.name),
      description: input.description ?? null,
      logoUrl: logo?.url ?? null,
      logoPublicId: logo?.publicId ?? null,
    });
  },

  /** Update name/description and/or replace the logo (deleting the old asset). */
  async update(id: string, input: UpdateBrandInput, logoPath?: string): Promise<Brand> {
    const existing = await brandRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Brand not found');
    }

    const data: Prisma.BrandUpdateInput = {};

    if (input.name !== undefined) {
      data.name = input.name;
      data.slug = slugify(input.name);
    }
    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (logoPath) {
      const logo = await uploadImage(logoPath, 'brands', 'logo');
      data.logoUrl = logo.url;
      data.logoPublicId = logo.publicId;
      // Remove the previous asset only after the new one is safely stored.
      if (existing.logoPublicId) {
        await deleteImage(existing.logoPublicId);
      }
    }

    return brandRepository.update(id, data);
  },

  /** Delete a brand (and its logo). Refuses if products still reference it. */
  async delete(id: string): Promise<void> {
    const existing = await brandRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Brand not found');
    }

    const productCount = await brandRepository.countProducts(id);
    if (productCount > 0) {
      throw ApiError.conflict('Cannot delete a brand that still has products');
    }

    await brandRepository.delete(id);

    if (existing.logoPublicId) {
      await deleteImage(existing.logoPublicId);
    }
  },
};
