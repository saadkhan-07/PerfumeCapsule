import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addWishlistSchema, wishlistProductIdParam } from '../validators/wishlist.validator';

const router = Router();

// All wishlist routes require an authenticated customer.
router.get('/', requireAuth, wishlistController.getWishlist);
router.post('/', requireAuth, validate(addWishlistSchema), wishlistController.addToWishlist);
router.delete(
  '/:productId',
  requireAuth,
  validate(wishlistProductIdParam),
  wishlistController.removeFromWishlist,
);

export default router;
