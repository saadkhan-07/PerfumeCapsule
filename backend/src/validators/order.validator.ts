import { z } from 'zod';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

const PAYMENT_METHODS = ['JAZZCASH', 'EASYPAISA'] as const;

export const orderIdParam = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Order id is required') }),
});

export const createOrderSchema = z.object({
  body: z.strictObject({
    items: z
      .array(
        z.strictObject({
          variantId: z.string().min(1, 'variantId is required'),
          quantity: z.number().int('Quantity must be a whole number').positive('Quantity must be at least 1'),
        }),
      )
      .min(1, 'At least one item is required'),
    shippingInfo: z.strictObject({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
      phone: z.string().trim().min(7, 'A valid phone number is required').max(20),
      address: z.string().trim().min(5, 'Address must be at least 5 characters').max(300),
      city: z.string().trim().min(2, 'City is required').max(100),
    }),
    paymentMethod: z.enum(PAYMENT_METHODS, { message: 'Payment method must be JAZZCASH or EASYPAISA' }),
  }),
});

export const lookupOrderSchema = z.object({
  query: z.strictObject({
    orderId: z.string().trim().min(1, 'Order ID is required'),
    phone: z.string().trim().min(7, 'A valid phone number is required').max(20),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.strictObject({ id: z.string().min(1, 'Order id is required') }),
  body: z.strictObject({
    status: z.enum(ORDER_STATUSES, { message: 'Invalid order status' }),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type LookupOrderInput = z.infer<typeof lookupOrderSchema>['query'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
