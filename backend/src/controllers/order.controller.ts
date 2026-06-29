import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { orderService } from '../services/order.service';

export const createOrder = asyncHandler(async (req, res) => {
  if (!req.auth) throw ApiError.unauthorized('Authentication required');
  const order = await orderService.create(req.auth, req.body);
  sendSuccess(res, 201, 'Order placed successfully', order);
});

export const listOrders = asyncHandler(async (_req, res) => {
  const orders = await orderService.listAll();
  sendSuccess(res, 200, 'Orders retrieved', orders);
});

export const getOrder = asyncHandler(async (req, res) => {
  if (!req.auth) throw ApiError.unauthorized('Authentication required');
  const order = await orderService.getById(req.params.id as string, req.auth);
  sendSuccess(res, 200, 'Order retrieved', order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id as string, req.body);
  sendSuccess(res, 200, 'Order status updated', order);
});
