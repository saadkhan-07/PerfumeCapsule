import { ProductImage } from '@prisma/client';
import { productImageRepository } from '../repositories/productImage.repository';
import { productRepository } from '../repositories/product.repository';
import { uploadImage, deleteImage } from './upload.service';
import { removeTempFile } from '../utils/tempFile';
import { ApiError } from '../utils/ApiError';

/** Business logic for product images: Cloudinary upload on add, asset cleanup on delete. */
export const productImageService = {
  /**
   * Uploads one or more files to Cloudinary (folder `products`) and stores each
   * publicId + secure_url, appending to the gallery. Temp files are always cleaned up.
   */
  async addImages(productId: string, filePaths: string[]): Promise<ProductImage[]> {
    const product = await productRepository.findBare(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    if (filePaths.length === 0) {
      throw ApiError.unprocessable('At least one image file is required');
    }

    try {
      let position = await productImageRepository.maxPosition(productId);
      const created: ProductImage[] = [];

      for (const path of filePaths) {
        const asset = await uploadImage(path, 'products');
        position += 1;
        created.push(
          await productImageRepository.create({
            productId,
            publicId: asset.publicId,
            url: asset.url,
            position,
          }),
        );
      }

      return created;
    } finally {
      await Promise.all(filePaths.map((p) => removeTempFile(p)));
    }
  },

  /** Delete the Cloudinary asset (by publicId) BEFORE removing the DB record. */
  async deleteImage(productId: string, imageId: string): Promise<void> {
    const image = await productImageRepository.findById(imageId);
    if (!image || image.productId !== productId) {
      throw ApiError.notFound('Image not found');
    }

    await deleteImage(image.publicId);
    await productImageRepository.delete(imageId);
  },
};
