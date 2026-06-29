import { Prisma, Order, OrderItem } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

// Public user shape on orders — never expose password.
const userSelect = { select: { id: true, name: true, email: true, phone: true } };

export interface StockDecrement {
  variantId: string;
  quantity: number;
  size: string;
}

/** Data-access for the Order table. */
export const orderRepository = {
  /** Variants (with parent product) for the requested ids — used to price/snapshot. */
  findVariantsByIds: (ids: string[]) =>
    prisma.productVariant.findMany({ where: { id: { in: ids } }, include: { product: true } }),

  findAll: () =>
    prisma.order.findMany({
      include: { items: true, user: userSelect },
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: string) =>
    prisma.order.findUnique({ where: { id }, include: { items: true, user: userSelect } }),

  updateStatus: (id: string, status: Order['status']) =>
    prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, user: userSelect },
    }),

  /**
   * Atomically decrements stock and creates the order + items in one transaction.
   * Each decrement is a conditional `updateMany` (stock >= quantity); a zero
   * affected-row count means another request consumed the stock first, so we abort
   * and the whole transaction rolls back — preventing oversell under concurrency.
   */
  createWithStock: (
    data: Prisma.OrderCreateInput,
    items: Prisma.OrderItemCreateWithoutOrderInput[],
    decrements: StockDecrement[],
  ): Promise<Order & { items: OrderItem[] }> =>
    prisma.$transaction(async (tx) => {
      for (const dec of decrements) {
        const result = await tx.productVariant.updateMany({
          where: { id: dec.variantId, stock: { gte: dec.quantity } },
          data: { stock: { decrement: dec.quantity } },
        });
        if (result.count === 0) {
          throw ApiError.conflict(`Insufficient stock for size ${dec.size}`);
        }
      }

      return tx.order.create({
        data: { ...data, items: { create: items } },
        include: { items: true },
      });
    }),
};
