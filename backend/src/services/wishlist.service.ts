import { wishlistRepository } from '../repositories/wishlist.repository';
import { productRepository } from '../repositories/product.repository';
import { ApiError } from '../utils/ApiError';
import { AuthContext } from '../types/auth.types';

/**
 * Business logic for the per-user wishlist. Wishlists belong to customer (User)
 * accounts only — admin tokens are not User rows, so they're rejected.
 */
export const wishlistService = {
  /** The current user's wishlisted products (flattened from join rows). */
  async list(auth: AuthContext) {
    ensureCustomer(auth);
    const rows = await wishlistRepository.findByUser(auth.id);
    return rows.map((row) => row.product);
  },

  /** Add a product to the wishlist (idempotent). Returns the wishlisted product. */
  async add(auth: AuthContext, productId: string) {
    ensureCustomer(auth);

    const product = await productRepository.findBare(productId);
    if (!product) {
      throw ApiError.unprocessable('Invalid productId: product does not exist');
    }

    await wishlistRepository.add(auth.id, productId);
    return productRepository.findById(productId);
  },

  /** Remove a product from the wishlist (no-op if not present). */
  async remove(auth: AuthContext, productId: string): Promise<void> {
    ensureCustomer(auth);
    await wishlistRepository.remove(auth.id, productId);
  },
};

function ensureCustomer(auth: AuthContext): void {
  if (auth.role !== 'user') {
    throw ApiError.forbidden('Wishlist is available to customer accounts only');
  }
}
