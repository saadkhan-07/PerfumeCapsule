import { Prisma } from '@prisma/client';
import { orderRepository, StockDecrement } from '../repositories/order.repository';
import { settingsRepository } from '../repositories/settings.repository';
import { ApiError } from '../utils/ApiError';
import { calculateShipping } from '../utils/shipping';
import { AuthContext } from '../types/auth.types';
import { CreateOrderInput, UpdateOrderStatusInput } from '../validators/order.validator';

/** Business logic for orders: pricing, stock validation, ownership, status. */
export const orderService = {
  /**
   * Creates an order for the authenticated account. Validates every variant
   * exists and has sufficient stock, prices the order from variant prices, then
   * persists order + items while atomically decrementing stock.
   *
   * NOTE: this does NOT open WhatsApp — the frontend builds the wa.me message from
   * the returned order and opens it after a confirmed save.
   */
  async create(auth: AuthContext, input: CreateOrderInput) {
    const requestedIds = input.items.map((i) => i.variantId);
    const variants = await orderRepository.findVariantsByIds(requestedIds);
    const variantById = new Map(variants.map((v) => [v.id, v]));

    // 1. Every variantId must resolve to a real variant.
    const missing = requestedIds.filter((id) => !variantById.has(id));
    if (missing.length > 0) {
      throw ApiError.unprocessable('One or more items reference a variant that does not exist', [
        { field: 'items', message: `Unknown variantId(s): ${missing.join(', ')}` },
      ]);
    }

    // 2 & 3. Validate stock and build priced item snapshots + a running subtotal.
    let subtotal = new Prisma.Decimal(0);
    const itemSnapshots: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    const decrements: StockDecrement[] = [];

    for (const item of input.items) {
      const variant = variantById.get(item.variantId)!;
      if (variant.stock < item.quantity) {
        throw ApiError.conflict(
          `Insufficient stock for ${variant.product.name} (${variant.size}). ` +
            `Requested ${item.quantity}, available ${variant.stock}.`,
        );
      }

      const lineTotal = variant.price.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);

      itemSnapshots.push({
        variant: { connect: { id: variant.id } },
        productName: variant.product.name,
        size: variant.size,
        unitPrice: variant.price,
        quantity: item.quantity,
        lineTotal,
      });
      decrements.push({ variantId: variant.id, quantity: item.quantity, size: variant.size });
    }

    // 4. Resolve shipping from the (admin-editable) site settings — backend-authoritative.
    //    total = subtotal + shipping. Both are snapshotted on the order.
    const settings = await settingsRepository.getOrCreate();
    const shippingFee = calculateShipping(subtotal, input.shippingInfo.city, settings);
    const total = subtotal.add(shippingFee);

    // Only customers link to a User row (admin ids are not User FKs → guest-style).
    const ownerConnect = auth.role === 'user' ? { user: { connect: { id: auth.id } } } : {};

    const orderData: Prisma.OrderCreateInput = {
      ...ownerConnect,
      customerName: input.shippingInfo.name,
      customerPhone: input.shippingInfo.phone,
      address: input.shippingInfo.address,
      city: input.shippingInfo.city,
      paymentMethod: input.paymentMethod,
      subtotal,
      shippingFee,
      total,
    };

    return orderRepository.createWithStock(orderData, itemSnapshots, decrements);
  },

  /** Admin-only: all orders, newest first. */
  listAll() {
    return orderRepository.findAll();
  },

  /** Admin or the order's owner may view a single order. */
  async getById(id: string, auth: AuthContext) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    const isOwner = auth.role === 'user' && order.userId === auth.id;
    if (auth.role !== 'admin' && !isOwner) {
      throw ApiError.forbidden('You do not have permission to view this order');
    }
    return order;
  },

  /** Admin-only status transition. */
  async updateStatus(id: string, input: UpdateOrderStatusInput) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return orderRepository.updateStatus(id, input.status);
  },
};
