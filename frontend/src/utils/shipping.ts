import type { SiteSettings } from '../types'
import { isInsideCity } from './pakistanCities'

/**
 * Frontend shipping calculator. MUST mirror the backend `calculateShipping`
 * (backend/src/utils/shipping.ts) exactly so the total shown on the checkout
 * summary matches the total the server saves on the order.
 *
 * Rule (in order):
 *   1. subtotal >= freeShippingThreshold → free (0)   [inclusive >=, matches backend .gte()]
 *   2. inside city (settings.localCity, default Lahore) → localShippingFee
 *   3. otherwise                                        → outstationShippingFee
 *
 * Money fields arrive as strings (Prisma Decimal serialized) — parse at the edge.
 */
export function calculateShippingFee(
  subtotal: number,
  city: string,
  settings: SiteSettings,
): number {
  const threshold =
    settings.freeShippingThreshold != null ? Number(settings.freeShippingThreshold) : null

  if (threshold !== null && subtotal >= threshold) return 0

  return isInsideCity(city, settings.localCity)
    ? Number(settings.localShippingFee)
    : Number(settings.outstationShippingFee)
}
