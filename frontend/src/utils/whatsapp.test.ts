import { describe, it, expect, vi } from 'vitest'
import { buildWhatsAppMessage, buildWhatsAppUrl } from './whatsapp'
import type { Order } from '../types'

const order: Order = {
  id: 'ORD123',
  userId: 'u1',
  customerName: 'Ali Khan',
  customerPhone: '03001234567',
  address: '12 Mall Road',
  city: 'Lahore',
  paymentMethod: 'JAZZCASH',
  status: 'PENDING',
  subtotal: '3000',
  shippingFee: '200',
  total: '3200',
  whatsappUrl: null,
  items: [
    {
      id: 'i1', orderId: 'ORD123', variantId: 'v1', productName: 'Sauvage',
      size: '5ml', unitPrice: '1500', quantity: 2, lineTotal: '3000',
      createdAt: '', updatedAt: '',
    },
  ],
  createdAt: '',
  updatedAt: '',
}

describe('buildWhatsAppMessage', () => {
  it('formats the order message exactly per spec', () => {
    const msg = buildWhatsAppMessage(order)
    expect(msg).toContain('🛒 New Order #ORD123')
    expect(msg).toContain('• Sauvage — 5ml x 2 @ Rs.1,500')
    expect(msg).toContain('📦 Order Total: Rs.3,200')
    expect(msg).toContain('📍 Deliver to:')
    expect(msg).toContain('Ali Khan')
    expect(msg).toContain('03001234567')
    expect(msg).toContain('12 Mall Road, Lahore')
    expect(msg).toContain('Payment: JazzCash / EasyPaisa (to be confirmed)')
  })
})

describe('buildWhatsAppUrl', () => {
  it('builds an encoded wa.me URL with the configured number', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '923001234567')
    const url = buildWhatsAppUrl(order)
    expect(url.startsWith('https://wa.me/923001234567?text=')).toBe(true)
    const decoded = decodeURIComponent(url.split('text=')[1])
    expect(decoded).toContain('New Order #ORD123')
    expect(decoded).toContain('Order Total: Rs.3,200')
    vi.unstubAllEnvs()
  })
})
