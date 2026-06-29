import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createOrderSchema,
  orderIdParam,
  updateOrderStatusSchema,
} from '../validators/order.validator';

const router = Router();

// Place an order — any authenticated account.
router.post('/', requireAuth, validate(createOrderSchema), orderController.createOrder);

// Admin: list every order, newest first.
router.get('/', requireAuth, requireAdmin, orderController.listOrders);

// Admin or the order's owner — ownership enforced in the service.
router.get('/:id', requireAuth, validate(orderIdParam), orderController.getOrder);

// Admin: update status.
router.put(
  '/:id/status',
  requireAuth,
  requireAdmin,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

export default router;
