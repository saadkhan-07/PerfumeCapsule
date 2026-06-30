# Database Design

Authoritative description of the Perfume Capsules data model. The source of truth is
the Prisma schema at [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).
**Do not change the schema without updating this document.**

- **Database:** PostgreSQL
- **ORM:** Prisma (6.x)
- **Primary keys:** `cuid()` strings (non-sequential, not enumerable) — except
  `SiteSettings`, which uses a fixed singleton key.
- **Timestamps:** every model has `createdAt` (`@default(now())`) and `updatedAt`
  (`@updatedAt`).
- **Money:** stored as `Decimal(10,2)` — never floating point.
- **Indexes:** added on every foreign key and on frequently queried fields.
- **Cloudinary assets:** store both `publicId` and `url` (secure_url).

---

## Enums

| Enum | Values |
|---|---|
| `OrderStatus` | `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `PaymentMethod` | `JAZZCASH`, `EASYPAISA` |

---

## Entity Relationship Overview

```
SiteSettings  (singleton — no relations)

Brand 1───* Product 1───* ProductVariant 1───* OrderItem *───1 Order *───0..1 User
                │                                              
                ├──* ProductImage                              
                ├──* ProductCategory *──1 Category            
                ├──* Review *──1 User                          
                └──* Wishlist *──1 User                        
```

- A **Brand** has many **Products**; a Product belongs to exactly one Brand.
- A **Product** has many **ProductVariants** (sizes), **ProductImages**, **Reviews**,
  **Wishlist** entries, and Category links.
- **Product ↔ Category** is many-to-many via the explicit **ProductCategory** join table.
- An **Order** has many **OrderItems**; each OrderItem optionally references a
  **ProductVariant** and stores price/name/size snapshots.
- A **User** may own Orders, Reviews, and Wishlist entries. Orders may be guest
  (nullable `userId`).

---

## Models

### SiteSettings (singleton)
Editable, site-wide presentation/details. Enforced as a single row via the fixed
primary key default `"singleton"` (a second insert violates the PK). The WhatsApp
order-redirect number is **not** stored here — it lives in the `WHATSAPP_NUMBER` env
var. Payment account details are intentionally excluded.

| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, `@default("singleton")` |
| `siteName` | String | required |
| `tagline` | String? | |
| `logoUrl` | String? | Cloudinary secure_url |
| `logoPublicId` | String? | Cloudinary public_id |
| `faviconUrl` | String? | Cloudinary secure_url |
| `faviconPublicId` | String? | Cloudinary public_id |
| `contactEmail` | String? | |
| `contactPhone` | String? | |
| `addressLine` | String? | |
| `city` | String? | |
| `instagramUrl` | String? | |
| `facebookUrl` | String? | |
| `tiktokUrl` | String? | |
| `currency` | String | `@default("PKR")` |
| `localCity` | String | `@default("Lahore")` — destination matched (case/space-insensitive) for the local rate |
| `localShippingFee` | Decimal | `Decimal(10,2)`, `@default(200)` |
| `outstationShippingFee` | Decimal | `Decimal(10,2)`, `@default(400)` — used for any city other than `localCity` |
| `freeShippingThreshold` | Decimal? | `Decimal(10,2)`, `@default(5000)` — subtotal at or above this ships free (inclusive) |
| `announcementBar` | String? | |
| `maintenanceMode` | Boolean | `@default(false)` |
| `createdAt` / `updatedAt` | DateTime | |

**Shipping rule** (resolved in `order.service` at checkout — backend-authoritative;
the values are admin-editable but the rule is fixed in code):

1. `subtotal >= freeShippingThreshold` → **free** (0)
2. destination `city` matches `localCity` (case/whitespace-insensitive) → `localShippingFee`
3. otherwise → `outstationShippingFee`

### User
| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `email` | String | `@unique` |
| `password` | String | bcrypt hash — never plaintext |
| `name` | String | required |
| `phone` | String? | |
| `createdAt` / `updatedAt` | DateTime | |

**Relations:** `wishlist` → Wishlist[], `reviews` → Review[], `orders` → Order[].
**Indexes:** `email`.

### Admin
Single admin account in the current version.

| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `email` | String | `@unique` |
| `password` | String | bcrypt hash |
| `name` | String | required |
| `createdAt` / `updatedAt` | DateTime | |

**Indexes:** `email`.

### Brand
| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `name` | String | `@unique` |
| `slug` | String | `@unique` |
| `description` | String? | |
| `logoPublicId` | String? | Cloudinary public_id |
| `logoUrl` | String? | Cloudinary secure_url |
| `createdAt` / `updatedAt` | DateTime | |

**Relations:** `products` → Product[].
**Indexes:** `slug`.

### Product
| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `name` | String | required |
| `slug` | String | `@unique` |
| `description` | String? | |
| `isActive` | Boolean | `@default(true)` |
| `brandId` | String | FK → Brand, `onDelete: Restrict` |
| `createdAt` / `updatedAt` | DateTime | |

**Relations:** `brand` → Brand, `variants` → ProductVariant[], `images` →
ProductImage[], `categories` → ProductCategory[], `reviews` → Review[],
`wishlistedBy` → Wishlist[].
**Indexes:** `brandId`, `slug`, `name`, `isActive`.

### ProductVariant
Inventory is tracked per variant. Sizes always come from variants (never hardcoded).

| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `size` | String | e.g. "5ml", "10ml", "30ml" |
| `price` | Decimal | `Decimal(10,2)` |
| `stock` | Int | `@default(0)` |
| `sku` | String? | `@unique` |
| `productId` | String | FK → Product, `onDelete: Cascade` |
| `createdAt` / `updatedAt` | DateTime | |

**Relations:** `product` → Product, `orderItems` → OrderItem[].
**Constraints:** `@@unique([productId, size])`. **Indexes:** `productId`.

### ProductImage
| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `publicId` | String | Cloudinary public_id |
| `url` | String | Cloudinary secure_url |
| `position` | Int | `@default(0)` — gallery ordering |
| `productId` | String | FK → Product, `onDelete: Cascade` |
| `createdAt` / `updatedAt` | DateTime | |

**Indexes:** `productId`.

### Category
| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `name` | String | `@unique` |
| `slug` | String | `@unique` |
| `createdAt` / `updatedAt` | DateTime | |

**Relations:** `products` → ProductCategory[]. **Indexes:** `slug`.

### ProductCategory (join table)
Explicit many-to-many between Product and Category.

| Field | Type | Notes |
|---|---|---|
| `productId` | String | FK → Product, `onDelete: Cascade` |
| `categoryId` | String | FK → Category, `onDelete: Cascade` |
| `createdAt` / `updatedAt` | DateTime | |

**Primary key:** `@@id([productId, categoryId])` (composite).
**Indexes:** `productId`, `categoryId`.

### Wishlist
| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `userId` | String | FK → User, `onDelete: Cascade` |
| `productId` | String | FK → Product, `onDelete: Cascade` |
| `createdAt` / `updatedAt` | DateTime | |

**Constraints:** `@@unique([userId, productId])`. **Indexes:** `userId`, `productId`.

### Review
| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `rating` | Int | 1–5, enforced in validator/service layer |
| `comment` | String? | |
| `userId` | String | FK → User, `onDelete: Cascade` |
| `productId` | String | FK → Product, `onDelete: Cascade` |
| `createdAt` / `updatedAt` | DateTime | |

**Constraints:** `@@unique([userId, productId])` (one review per user per product).
**Indexes:** `productId`, `userId`.

### Order
Shipping details are captured per order. `userId` is nullable to support guest
checkout; an order is retained if the owning user is deleted (`onDelete: SetNull`).

| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `userId` | String? | FK → User, `onDelete: SetNull` |
| `customerName` | String | required |
| `customerPhone` | String | required |
| `address` | String | required |
| `city` | String | required |
| `paymentMethod` | PaymentMethod | `JAZZCASH` / `EASYPAISA` |
| `status` | OrderStatus | `@default(PENDING)` |
| `subtotal` | Decimal | `Decimal(10,2)` — sum of line totals, snapshot |
| `shippingFee` | Decimal | `Decimal(10,2)` — resolved from SiteSettings at checkout, snapshot |
| `total` | Decimal | `Decimal(10,2)` — `subtotal + shippingFee` |
| `whatsappUrl` | String? | wa.me URL built by backend at creation |
| `createdAt` / `updatedAt` | DateTime | |

**Relations:** `items` → OrderItem[]. **Indexes:** `userId`, `status`, `createdAt`.

`subtotal` and `shippingFee` are **snapshots** (like OrderItem prices): the shipping
fee is resolved from `SiteSettings` at checkout and frozen on the order, so editing
the shipping config later never alters historical orders.

### OrderItem
Stores price/name/size **snapshots** so historical orders stay correct even if a
variant's price changes or the variant/product is later deleted. `variantId` is
nullable + `onDelete: SetNull` so admins can delete variants without destroying order
history.

| Field | Type | Notes |
|---|---|---|
| `id` | String | PK, cuid |
| `orderId` | String | FK → Order, `onDelete: Cascade` |
| `variantId` | String? | FK → ProductVariant, `onDelete: SetNull` |
| `productName` | String | snapshot |
| `size` | String | snapshot |
| `unitPrice` | Decimal | `Decimal(10,2)` snapshot |
| `quantity` | Int | |
| `lineTotal` | Decimal | `Decimal(10,2)` |
| `createdAt` / `updatedAt` | DateTime | |

**Indexes:** `orderId`, `variantId`.

---

## Referential Actions Summary

| Relation | onDelete |
|---|---|
| Product → Brand | `Restrict` (can't delete a brand with products) |
| ProductVariant → Product | `Cascade` |
| ProductImage → Product | `Cascade` |
| ProductCategory → Product / Category | `Cascade` |
| Wishlist → User / Product | `Cascade` |
| Review → User / Product | `Cascade` |
| Order → User | `SetNull` (keep order, drop owner) |
| OrderItem → Order | `Cascade` |
| OrderItem → ProductVariant | `SetNull` (keep history via snapshots) |

---

## Migrations

- Initial migration: `prisma migrate dev --name init` (creates all tables above).
- Migrations live in `backend/prisma/migrations/` and **are committed** to git.
