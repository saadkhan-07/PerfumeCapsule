import { Router } from 'express';
import * as brandController from '../controllers/brand.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  createBrandSchema,
  updateBrandSchema,
  brandIdParam,
} from '../validators/brand.validator';

const router = Router();

// Public reads.
router.get('/', brandController.listBrands);
router.get('/:id', validate(brandIdParam), brandController.getBrand);

// Admin-only writes. `upload.single('logo')` runs first so multipart text fields
// populate req.body before validation; then validate; then the controller.
router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.single('logo'),
  validate(createBrandSchema),
  brandController.createBrand,
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  upload.single('logo'),
  validate(updateBrandSchema),
  brandController.updateBrand,
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(brandIdParam),
  brandController.deleteBrand,
);

export default router;
