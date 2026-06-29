import { Router } from 'express';
import authRoutes from './auth.routes';
import brandRoutes from './brand.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import settingsRoutes from './settings.routes';

/**
 * Aggregates all feature route modules under the /api prefix.
 * Product variants and images are nested within the product routes.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/settings', settingsRoutes);

export default router;
