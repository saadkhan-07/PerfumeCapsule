import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParam,
} from '../validators/category.validator';

const router = Router();

// Public reads.
router.get('/', categoryController.listCategories);
router.get('/:id', validate(categoryIdParam), categoryController.getCategory);

// Admin-only writes.
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(createCategorySchema),
  categoryController.createCategory,
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(updateCategorySchema),
  categoryController.updateCategory,
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(categoryIdParam),
  categoryController.deleteCategory,
);

export default router;
