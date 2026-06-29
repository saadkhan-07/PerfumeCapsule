// ===========================================================================
// Shared domain types — mirror the backend Prisma models / API responses.
// NOTE: money fields (price, total, …) arrive as strings because Prisma
// serializes Decimal to string in JSON. Parse to number only at the edges.
// ===========================================================================

export type Role = 'user' | 'admin'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentMethod = 'JAZZCASH' | 'EASYPAISA'

/** Standard API envelope returned by every backend endpoint. */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors: unknown[] | null
}

export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  createdAt: string
  updatedAt: string
}

/** The authenticated principal (customer or admin) resolved from GET /auth/me. */
export interface AuthUser {
  id: string
  email: string
  name: string
  phone?: string | null
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  logoPublicId: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  size: string
  price: string
  stock: number
  sku: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  publicId: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  brandId: string
  brand?: Brand
  variants?: ProductVariant[]
  images?: ProductImage[]
  categories?: ProductCategoryLink[]
  createdAt: string
  updatedAt: string
}

/** Product↔Category join row as returned by the API (includes the nested category). */
export interface ProductCategoryLink {
  productId?: string
  categoryId: string
  category: Category
}

export interface OrderItem {
  id: string
  orderId: string
  variantId: string | null
  productName: string
  size: string
  unitPrice: string
  quantity: number
  lineTotal: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string | null
  customerName: string
  customerPhone: string
  address: string
  city: string
  paymentMethod: PaymentMethod
  status: OrderStatus
  subtotal: string
  shippingFee: string
  total: string
  whatsappUrl: string | null
  items?: OrderItem[]
  createdAt: string
  updatedAt: string
}

/** Client-side cart line item (persisted locally until checkout). */
export interface CartItem {
  product: Product
  variant: ProductVariant
  quantity: number
}
