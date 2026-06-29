import { Prisma } from '@prisma/client';

/**
 * The subset of SiteSettings needed to price shipping. Kept as a narrow interface
 * so the calculator is pure and easy to test independently of Prisma/DB.
 */
export interface ShippingConfig {
  localCity: string;
  localShippingFee: Prisma.Decimal;
  outstationShippingFee: Prisma.Decimal;
  freeShippingThreshold: Prisma.Decimal | null;
}

/** Normalize a city for comparison — case/whitespace insensitive ("lahore " === "Lahore"). */
const normalizeCity = (city: string): string => city.trim().toLowerCase();

/**
 * Resolves the shipping fee for an order, backend-authoritative.
 * Rule (in order):
 *   1. subtotal greater than freeShippingThreshold → free (0)
 *   2. destination city matches the configured local city → localShippingFee
 *   3. otherwise → outstationShippingFee
 */
export const calculateShipping = (
  subtotal: Prisma.Decimal,
  city: string,
  config: ShippingConfig,
): Prisma.Decimal => {
  if (config.freeShippingThreshold !== null && subtotal.gt(config.freeShippingThreshold)) {
    return new Prisma.Decimal(0);
  }
  if (normalizeCity(city) === normalizeCity(config.localCity)) {
    return config.localShippingFee;
  }
  return config.outstationShippingFee;
};
