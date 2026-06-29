import { ProductVariant, Prisma } from '@prisma/client';
import { variantRepository } from '../repositories/variant.repository';
import { productRepository } from '../repositories/product.repository';
import { ApiError } from '../utils/ApiError';
import { CreateVariantInput, UpdateVariantInput } from '../validators/variant.validator';

const ensureProduct = async (productId: string): Promise<void> => {
  const product = await productRepository.findBare(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
};

/** Fetches a variant and verifies it belongs to the given product. */
const getOwnedVariant = async (productId: string, variantId: string): Promise<ProductVariant> => {
  const variant = await variantRepository.findById(variantId);
  if (!variant || variant.productId !== productId) {
    throw ApiError.notFound('Variant not found');
  }
  return variant;
};

/** Business logic for product variants (sizes, pricing, inventory). */
export const variantService = {
  async list(productId: string): Promise<ProductVariant[]> {
    await ensureProduct(productId);
    return variantRepository.findByProduct(productId);
  },

  async create(productId: string, input: CreateVariantInput): Promise<ProductVariant> {
    await ensureProduct(productId);
    return variantRepository.create({
      productId,
      size: input.size,
      price: input.price,
      stock: input.stock ?? 0,
      sku: input.sku ?? null,
    });
  },

  async update(
    productId: string,
    variantId: string,
    input: UpdateVariantInput,
  ): Promise<ProductVariant> {
    await getOwnedVariant(productId, variantId);
    const data: Prisma.ProductVariantUpdateInput = {};
    if (input.size !== undefined) data.size = input.size;
    if (input.price !== undefined) data.price = input.price;
    if (input.stock !== undefined) data.stock = input.stock;
    if (input.sku !== undefined) data.sku = input.sku;
    return variantRepository.update(variantId, data);
  },

  async delete(productId: string, variantId: string): Promise<void> {
    await getOwnedVariant(productId, variantId);
    // OrderItem.variantId is SetNull, so order history is preserved via snapshots.
    await variantRepository.delete(variantId);
  },
};
