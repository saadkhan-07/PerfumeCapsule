import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { optionalAuth } from '../middleware/optionalAuth.middleware';
import { orderLookupRateLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createOrderSchema,
  lookupOrderSchema,
  orderIdParam,
  updateOrderStatusSchema,
} from '../validators/order.validator';

const router = Router();

// Place an order — guests OR any authenticated account. A valid token links the
// order to its user; no token (or an admin token) saves it as a guest order.
router.post('/', optionalAuth, validate(createOrderSchema), orderController.createOrder);

// Admin: list every order, newest first.
router.get('/', requireAuth, requireAdmin, orderController.listOrders);

// Public guest order tracking — matched by phone + order id, rate limited.
// Declared BEFORE '/:id' so "lookup" isn't read as an id.
router.get('/lookup', orderLookupRateLimiter, validate(lookupOrderSchema), orderController.lookupOrder);

// Current user's own orders. Declared BEFORE '/:id' so "mine" isn't read as an id.
router.get('/mine', requireAuth, orderController.listMyOrders);

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
