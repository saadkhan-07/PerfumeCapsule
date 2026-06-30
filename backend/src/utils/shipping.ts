import { Prisma } from '@prisma/client';

/**
 * The subset of SiteSettings needed to price shipping. Kept as a narrow interface
 * so the calculator is pure and easy to test independently of Prisma/DB.
 *
 * NOTE: `localCity` is the admin-configurable inside city (default "Lahore");
 * `localShippingFee` is its rate; `outstationShippingFee` applies to every other city.
 */
export interface ShippingConfig {
  localCity: string;
  localShippingFee: Prisma.Decimal;
  outstationShippingFee: Prisma.Decimal;
  freeShippingThreshold: Prisma.Decimal | null;
}

/** Default inside city when none is configured. Admin sets the real one via SiteSettings.localCity. */
const DEFAULT_INSIDE_CITY = 'Lahore';

/**
 * Inside-city determination — the SINGLE source of truth on the backend. Kept
 * logically equivalent to the frontend `isInsideCity`
 * (frontend/src/utils/pakistanCities.ts) so the displayed total and the saved
 * order total can never disagree on the shipping fee for the same city. The
 * inside city is admin-configurable, so callers pass it in.
 */
export const isInsideCity = (city: string, insideCity: string = DEFAULT_INSIDE_CITY): boolean =>
  city.trim().toLowerCase() === insideCity.trim().toLowerCase();

/**
 * Resolves the shipping fee for an order, backend-authoritative.
 * Rule (in order):
 *   1. subtotal >= freeShippingThreshold → free (0)   [inclusive; mirrored on the frontend]
 *   2. inside city (config.localCity, default Lahore) → localShippingFee
 *   3. otherwise → outstationShippingFee
 */
export const calculateShipping = (
  subtotal: Prisma.Decimal,
  city: string,
  config: ShippingConfig,
): Prisma.Decimal => {
  if (config.freeShippingThreshold !== null && subtotal.gte(config.freeShippingThreshold)) {
    return new Prisma.Decimal(0);
  }
  return isInsideCity(city, config.localCity) ? config.localShippingFee : config.outstationShippingFee;
};
