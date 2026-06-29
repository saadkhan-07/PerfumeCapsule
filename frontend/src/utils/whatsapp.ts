import type { Order } from '../types'

const DIVIDER = '──────────────────'

/**
 * Builds the pre-filled WhatsApp order message from the saved order returned by
 * POST /api/orders. Everything (items, prices, total, shipping) comes from the
 * server response so the message always matches what was persisted.
 */
export function buildWhatsAppMessage(order: Order): string {
  const lines: string[] = []
  lines.push(`🛒 New Order #${order.id}`)
  lines.push(DIVIDER)

  for (const item of order.items ?? []) {
    lines.push(
      `• ${item.productName} — ${item.size} x ${item.quantity} @ Rs.${Number(item.unitPrice).toLocaleString('en-PK')}`,
    )
  }

  lines.push(DIVIDER)
  lines.push(`📦 Order Total: Rs.${Number(order.total).toLocaleString('en-PK')}`)
  lines.push(DIVIDER)
  lines.push('📍 Deliver to:')
  lines.push(order.customerName)
  lines.push(order.customerPhone)
  lines.push(`${order.address}, ${order.city}`)
  lines.push(DIVIDER)
  lines.push('Payment: JazzCash / EasyPaisa (to be confirmed)')

  return lines.join('\n')
}

/** Constructs the wa.me URL with the configured business number + encoded message. */
export function buildWhatsAppUrl(order: Order): string {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''
  const text = encodeURIComponent(buildWhatsAppMessage(order))
  return `https://wa.me/${number}?text=${text}`
}

/** Opens the WhatsApp conversation in a new tab. */
export function openWhatsApp(order: Order): void {
  window.open(buildWhatsAppUrl(order), '_blank')
}
