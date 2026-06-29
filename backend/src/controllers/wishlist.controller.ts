import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { wishlistService } from '../services/wishlist.service';

export const getWishlist = asyncHandler(async (req, res) => {
  if (!req.auth) throw ApiError.unauthorized('Authentication required');
  const products = await wishlistService.list(req.auth);
  sendSuccess(res, 200, 'Wishlist retrieved', products);
});

export const addToWishlist = asyncHandler(async (req, res) => {
  if (!req.auth) throw ApiError.unauthorized('Authentication required');
  const product = await wishlistService.add(req.auth, req.body.productId);
  sendSuccess(res, 201, 'Added to wishlist', product);
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  if (!req.auth) throw ApiError.unauthorized('Authentication required');
  await wishlistService.remove(req.auth, req.params.productId as string);
  sendSuccess(res, 200, 'Removed from wishlist', null);
});
