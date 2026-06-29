import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import * as variantController from '../controllers/variant.controller';
import * as imageController from '../controllers/productImage.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  listProductsSchema,
  createProductSchema,
  updateProductSchema,
  productIdParam,
} from '../validators/product.validator';
import {
  listVariantsParam,
  createVariantSchema,
  updateVariantSchema,
  variantParam,
} from '../validators/variant.validator';
import { addImagesParam, deleteImageParam } from '../validators/productImage.validator';

const router = Router();

// Admin guard chain reused across all write routes in this module.
const admin = [requireAuth, requireAdmin];

// ── Products ──────────────────────────────────────────────────────────────
router.get('/', validate(listProductsSchema), productController.listProducts);
router.get('/:id', validate(productIdParam), productController.getProduct);

router.post('/', ...admin, validate(createProductSchema), productController.createProduct);
router.put('/:id', ...admin, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', ...admin, validate(productIdParam), productController.deleteProduct);

// ── Product Variants (nested) ────────────────────────────────────────────
router.get('/:id/variants', validate(listVariantsParam), variantController.listVariants);
router.post(
  '/:id/variants',
  ...admin,
  validate(createVariantSchema),
  variantController.createVariant,
);
router.put(
  '/:productId/variants/:variantId',
  ...admin,
  validate(updateVariantSchema),
  variantController.updateVariant,
);
router.delete(
  '/:productId/variants/:variantId',
  ...admin,
  validate(variantParam),
  variantController.deleteVariant,
);

// ── Product Images (nested) ──────────────────────────────────────────────
router.post(
  '/:id/images',
  ...admin,
  upload.array('images', 10),
  validate(addImagesParam),
  imageController.addProductImages,
);
router.delete(
  '/:productId/images/:imageId',
  ...admin,
  validate(deleteImageParam),
  imageController.deleteProductImage,
);

export default router;
