# API Specification

> **Status:** Phase 3 complete — Auth, Brands, Categories, Products, Product
> Variants, Product Images, and Orders are documented and implemented.

Base URL: `/api`

## Conventions for Phase 3 Modules

- **Architecture:** every route flows Route → Controller → Service → Repository → Prisma.
- **Validation:** request bodies/params/queries are validated with Zod via the
  `validate` middleware before reaching the controller. Unexpected fields are
  rejected (`422`). Validation failures return `errors: [{ field, message }]`.
- **Auth guards:** `requireAuth` (valid Bearer token) and `requireAdmin` (admin
  role, runs after `requireAuth`). "Admin only" below means both are applied.
- **Money** (`price`, `total`, `unitPrice`, `lineTotal`) is serialized as a
  **string** to preserve decimal precision (e.g. `"1500"`).
- **Images** are uploaded as `multipart/form-data` and stored on Cloudinary with
  an eager 800×800 (`fill`, `f_auto`, `q_auto`) transform. Both `publicId` and
  `url` (secure_url) are persisted; the asset is destroyed when its record is.
  When Cloudinary is not configured, image uploads return `503`.

## Response Envelope

Every response uses a consistent shape.

**Success**
```json
{ "success": true, "message": "Human-readable message", "data": { }, "errors": null }
```

**Error**
```json
{ "success": false, "message": "Human-readable message", "data": null, "errors": [ ] }
```

`errors` is `null` except for validation failures, where it is an array of
`{ "field": string, "message": string }`.

### Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 401 | Authentication missing/invalid |
| 403 | Authenticated but not allowed (admin-only) |
| 409 | Conflict (e.g. duplicate email) |
| 422 | Validation failed |
| 429 | Too many requests (rate limited) |
| 500 | Unexpected server error |

### Authentication

Protected endpoints require a JWT in the header:
```
Authorization: Bearer <token>
```
Tokens are signed with `JWT_SECRET` and expire per `JWT_EXPIRES_IN`. The payload
contains `{ sub: <accountId>, role: "user" | "admin" }`. Passwords and secrets are
never returned in any response.

---

## Health

### `GET /health`
Liveness probe (not under `/api`). Returns `200` with uptime.

---

## Auth

> Rate limited: `/auth/register`, `/auth/login`, `/auth/admin/login` allow **10
> requests per 15 minutes per IP**, after which they return `429`.

### `POST /api/auth/register`
Creates a customer account and returns a token.

**Body**
| Field | Type | Rules |
|---|---|---|
| `name` | string | 2–100 chars |
| `email` | string | valid email (trimmed, lowercased) |
| `password` | string | 8–72 chars |
| `phone` | string? | optional, 7–20 chars |

Unexpected fields are rejected (`422`). Duplicate email returns `409`.

**`201`**
```json
{ "success": true, "message": "Account created successfully",
  "data": { "user": { "id": "...", "email": "...", "name": "...", "phone": "...",
    "createdAt": "...", "updatedAt": "..." }, "token": "<jwt>" }, "errors": null }
```

### `POST /api/auth/login`
Authenticates a customer. Invalid credentials return `401` with the generic message
`"Invalid email or password"` (no user enumeration).

**Body:** `{ "email": string, "password": string }`
**`200`:** same `{ user, token }` shape as register.

### `POST /api/auth/admin/login`
Authenticates the admin account. Same body/behavior as login; the returned token has
`role: "admin"`. Response `data` contains `{ admin, token }`.

### `GET /api/auth/me`
Returns the account behind the supplied token. **Requires** `Authorization: Bearer`.

**`200`**
```json
{ "success": true, "message": "Current account",
  "data": { "role": "user", "account": { "id": "...", "email": "...", "name": "...",
    "createdAt": "...", "updatedAt": "..." } }, "errors": null }
```
Missing/invalid/expired token → `401`.

---

## Authorization Middleware

- **`requireAuth`** — rejects requests without a valid Bearer token (`401`), else
  attaches `req.auth = { id, role }`.
- **`requireAdmin`** — must run after `requireAuth`; rejects non-admins with `403`.

These guard the feature/admin routes added from Phase 3 onward.

## Admin Account Provisioning

The single admin is created out-of-band (no public registration):
```
npm run create:admin -- <email> <password> "<name>"
```

---

## Brands

### `GET /api/brands` — public
Returns all brands (alphabetical), each with `logoUrl`/`logoPublicId`.

**`200`** `data`: `Brand[]` where `Brand` is
`{ id, name, slug, description, logoPublicId, logoUrl, createdAt, updatedAt }`.

### `GET /api/brands/:id` — public
**`200`** single `Brand`. Unknown id → `404`.

### `POST /api/brands` — admin only
**Content-Type:** `multipart/form-data`.

| Field | Type | Rules |
|---|---|---|
| `name` | text | 2–100 chars, required |
| `description` | text | optional, ≤1000 chars |
| `logo` | file | optional image (≤10 MB); uploaded to `perfume-capsules/brands` |

`slug` is derived from `name`. **`201`** → created `Brand`. Duplicate name → `409`.

### `PUT /api/brands/:id` — admin only
`multipart/form-data`; all fields optional. Supplying a new `logo` uploads the
replacement and **deletes the previous Cloudinary asset**. **`200`** → updated `Brand`.

### `DELETE /api/brands/:id` — admin only
Deletes the brand and its Cloudinary logo. Refuses with `409` if any product still
references the brand. **`200`** on success; unknown id → `404`.

---

## Categories

### `GET /api/categories` — public
**`200`** `data`: `Category[]` = `{ id, name, slug, createdAt, updatedAt }`.

### `GET /api/categories/:id` — public
**`200`** single `Category`; unknown id → `404`.

### `POST /api/categories` — admin only
**Body** (JSON): `{ "name": string }` (2–60 chars). `slug` derived from name.
**`201`** → created `Category`. Duplicate name → `409`.

### `PUT /api/categories/:id` — admin only
**Body:** `{ "name": string }`. **`200`** → updated `Category`.

### `DELETE /api/categories/:id` — admin only
**`200`**. Removes the category and its product links (products are unaffected).

---

## Products

A product belongs to one brand, has many variants (sizes), many images, and many
categories. Sizes/prices always come from variants.

### `GET /api/products` — public
Paginated catalog listing.

**Query params**

| Param | Type | Default | Notes |
|---|---|---|---|
| `brandId` | string | — | filter by brand |
| `categoryId` | string | — | filter by category |
| `search` | string | — | case-insensitive match on product name |
| `page` | int ≥1 | 1 | |
| `limit` | int 1–100 | 20 | |

**`200`**
```json
{ "success": true, "message": "Products retrieved",
  "data": {
    "items": [ { "id": "...", "name": "...", "slug": "...", "description": "...",
      "isActive": true, "brandId": "...",
      "brand": { ... },
      "categories": [ { "productId": "...", "categoryId": "...", "category": { ... } } ],
      "images": [ { "id": "...", "url": "...", "publicId": "...", "position": 0 } ],
      "variants": [ { "id": "...", "size": "5ml", "price": "1500", "stock": 3 } ]
    } ],
    "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
  }, "errors": null }
```
`images` includes only the first gallery image on the listing endpoint.

### `GET /api/products/:id` — public
Full product with **all** variants and **all** images (ordered by `position`),
plus brand and categories. Unknown id → `404`.

### `POST /api/products` — admin only
**Body** (JSON)

| Field | Type | Rules |
|---|---|---|
| `name` | string | 2–150, required |
| `description` | string | optional, ≤5000 |
| `brandId` | string | required; must exist (`422` otherwise) |
| `categoryIds` | string[] | optional, default `[]` |
| `isActive` | boolean | optional, default `true` |

**`201`** → created product (with brand, categories, variants, images).

### `PUT /api/products/:id` — admin only
JSON; all fields optional. Supplying `categoryIds` **replaces** the full category
set. Invalid `brandId` → `422`. **`200`** → updated product.

### `DELETE /api/products/:id` — admin only
Deletes the product and cascades variants, image rows, and category links. **All
associated Cloudinary image assets are destroyed.** Order history is preserved via
snapshots (order items keep `productName`/`size`/`unitPrice`; their `variantId`
becomes `null`). **`200`** on success.

---

## Product Variants

Inventory is tracked per variant. Routes are nested under a product.

### `GET /api/products/:id/variants` — public
**`200`** `data`: `Variant[]` =
`{ id, size, price, stock, sku, productId, createdAt, updatedAt }`.

### `POST /api/products/:id/variants` — admin only
**Body** (JSON)

| Field | Type | Rules |
|---|---|---|
| `size` | string | 1–20, required (e.g. `"5ml"`) |
| `price` | number | > 0, required |
| `stock` | int | ≥ 0, default 0 |
| `sku` | string | optional, unique |

**`201`** → created variant. Duplicate `(productId, size)` or `sku` → `409`.

### `PUT /api/products/:productId/variants/:variantId` — admin only
JSON; all fields optional. **`200`** → updated variant. Variant not under the
product → `404`.

### `DELETE /api/products/:productId/variants/:variantId` — admin only
**`200`**. Order-item snapshots are retained (`variantId` set to `null`).

---

## Product Images

### `POST /api/products/:id/images` — admin only
**Content-Type:** `multipart/form-data`. Field `images` accepts **1–10** image
files (≤10 MB each). Each is uploaded to `perfume-capsules/products` and appended
to the gallery (next `position`).

**`201`** `data`: array of created `ProductImage`
`{ id, publicId, url, position, productId, createdAt, updatedAt }`.
Non-image file → `422`. No file → `422`. Cloudinary not configured → `503`.

### `DELETE /api/products/:productId/images/:imageId` — admin only
**Destroys the Cloudinary asset (by `publicId`) before** removing the DB record.
**`200`**. Image not under the product → `404`.

---

## Orders

Orders are saved by the backend before the frontend opens WhatsApp. The backend
does **not** open/redirect to WhatsApp — the frontend builds the wa.me message
from the returned order. (See note below on `whatsappUrl`.)

### `POST /api/orders` — optional auth (guest **or** logged-in)
Uses the **`optionalAuth`** middleware so both guests and authenticated accounts
can place orders:

- **No `Authorization` header** → the order is saved as a **guest order**
  (`userId: null`).
- **Valid Bearer token** → the order links to that account (`userId` set for a
  `user`; an `admin` token creates an unowned/guest-style order).
- **Present but invalid/expired token** → `401` (a broken token is **not**
  silently downgraded to a guest order).

Required shipping fields (`shippingInfo.name/phone/address/city`) are validated
**regardless of auth state**.

Validates every variant exists and has sufficient stock, prices the order from
current variant prices, **resolves shipping from `SiteSettings`** (see Settings),
then atomically decrements stock and saves the order with item + money snapshots.

**Shipping** is computed server-side: `subtotal` = Σ line totals; `shippingFee` is
free when `subtotal >= freeShippingThreshold`, else `localShippingFee` when
`shippingInfo.city` matches `localCity` (case/whitespace-insensitive), else
`outstationShippingFee`; `total = subtotal + shippingFee`. The client cannot
override these — any price/shipping value it sends is ignored.

**Body** (JSON)
```json
{
  "items": [ { "variantId": "...", "quantity": 2 } ],
  "shippingInfo": { "name": "...", "phone": "...", "address": "...", "city": "..." },
  "paymentMethod": "JAZZCASH"
}
```

| Field | Rules |
|---|---|
| `items` | non-empty array; `quantity` is a positive integer |
| `shippingInfo.name` | 2–100 |
| `shippingInfo.phone` | 7–20 |
| `shippingInfo.address` | 5–300 |
| `shippingInfo.city` | 2–100 |
| `paymentMethod` | `JAZZCASH` or `EASYPAISA` |

**`201`**
```json
{ "success": true, "message": "Order placed successfully",
  "data": { "id": "...", "userId": "...", "customerName": "...", "customerPhone": "...",
    "address": "...", "city": "Lahore", "paymentMethod": "JAZZCASH", "status": "PENDING",
    "subtotal": "3000", "shippingFee": "200", "total": "3200",
    "whatsappUrl": null, "createdAt": "...", "updatedAt": "...",
    "items": [ { "id": "...", "orderId": "...", "variantId": "...", "productName": "Sauvage",
      "size": "5ml", "unitPrice": "1500", "quantity": 2, "lineTotal": "3000" } ] },
  "errors": null }
```

**Errors:** unknown `variantId` → `422` (with `errors[]`); insufficient stock →
`409` with a human-readable message naming the product/size.

### `GET /api/orders/lookup` — public (guest order tracking)
Lets a guest retrieve their order without an account. Matched on **both** the
order id **and** the phone number used at checkout — the phone is the security
gate. **Rate limited:** 10 requests / 15 minutes per IP (`429` after).

**Query params**

| Param | Type | Rules |
|---|---|---|
| `orderId` | string | required |
| `phone` | string | required, 7–20 chars |

Returns the order **with `items`** (no `user` relation is exposed). Declared
before `/:id` so `lookup` is not parsed as an order id.

- **`200`** → the matching `Order` (same shape as the create response, `items` included).
- **`404`** → generic `"Order not found"` on **any** mismatch. The response never
  reveals whether the `orderId` or the `phone` was wrong (anti-enumeration).
- **`422`** → missing/malformed query params.

### `GET /api/orders` — admin only
All orders, newest first, each including `items` and a non-sensitive `user`
(`{ id, name, email, phone }` — never the password). **`200`**.

### `GET /api/orders/mine` — authenticated (customer)
The current user's own orders, newest first, each including `items`. Scoped to the
token's user id, so a customer only ever sees their own orders. Declared before
`/:id` so "mine" is not parsed as an order id. **`200`** → `data: Order[]`.

### `GET /api/orders/:id` — admin OR the order's owner
Returns the full order (`items` + `user`). A non-owner customer → `403`; unknown
id → `404`. **`200`** otherwise.

### `PUT /api/orders/:id/status` — admin only
**Body:** `{ "status": OrderStatus }` where `OrderStatus` ∈ `PENDING`,
`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`. Invalid value →
`422`. **`200`** → updated order.

> **`whatsappUrl` note:** the field exists on the order and is currently returned
> as `null`. Per the Phase 3 brief, WhatsApp message construction/redirect is
> handled on the frontend. CLAUDE.md also describes the backend building the wa.me
> URL from `WHATSAPP_NUMBER`; if that behavior is desired server-side, it can be
> added in the checkout phase without changing the order contract.

---

## Site Settings

A **singleton** resource holding editable, site-wide organization details (identity,
contact, social, commerce/shipping config) that the frontend renders dynamically.
The row is materialized with schema defaults on first access. Secrets are **not**
here — the WhatsApp number and payment details live in backend env vars only.

### `GET /api/settings` — public
Returns the settings singleton. **`200`**
```json
{ "success": true, "message": "Settings retrieved",
  "data": { "id": "singleton", "siteName": "Perfume Capsules", "tagline": null,
    "logoUrl": null, "logoPublicId": null, "faviconUrl": null, "faviconPublicId": null,
    "contactEmail": null, "contactPhone": null, "addressLine": null, "city": null,
    "instagramUrl": null, "facebookUrl": null, "tiktokUrl": null,
    "currency": "PKR", "localCity": "Lahore", "localShippingFee": "200",
    "outstationShippingFee": "400", "freeShippingThreshold": "5000",
    "announcementBar": null, "maintenanceMode": false,
    "createdAt": "...", "updatedAt": "..." },
  "errors": null }
```

### `PUT /api/settings` — admin only
Partial update of the singleton (`multipart/form-data`). All fields optional; only
the provided fields change. The `logo` and `favicon` **file** parts are uploaded to
Cloudinary (folder `perfume-capsules/site`) and the previous asset of each is
deleted afterward. `logoUrl` / `logoPublicId` / `faviconUrl` / `faviconPublicId`
are server-managed and **not** accepted from the body.

| Field | Rules |
|---|---|
| `siteName` | 1–100 |
| `tagline` | ≤ 200 |
| `contactEmail` | valid email |
| `contactPhone` | ≤ 30 |
| `addressLine` | ≤ 300 |
| `city` | ≤ 100 |
| `instagramUrl` / `facebookUrl` / `tiktokUrl` | valid URL, ≤ 500 |
| `currency` | 1–10 |
| `localCity` | 1–100 |
| `localShippingFee` / `outstationShippingFee` / `freeShippingThreshold` | number ≥ 0 |
| `announcementBar` | ≤ 300 |
| `maintenanceMode` | boolean (`true`/`false`) |
| `logo` | image file ≤ 10 MB (multipart) |
| `favicon` | image file ≤ 10 MB (multipart) |

Unknown fields → `422`. Non-admin → `403`. **`200`** → the updated settings object
(same shape as `GET`).

> **Shipping values** set here take effect on the **next** order; existing orders
> keep their snapshotted `subtotal`/`shippingFee`/`total`.

---

## Wishlist

Per-user saved products. All routes require an authenticated **customer** (User)
token — admin tokens are rejected with `403` (admins are not User rows).

### `GET /api/wishlist` — customer only
Returns the current user's wishlisted products (each with `brand`, the first
`images` entry, and `variants` for price display — same shape as the catalog).
**`200`** → `data: Product[]`.

### `POST /api/wishlist` — customer only
**Body:** `{ "productId": "..." }`. Idempotent — adding an already-wishlisted
product is a no-op. Unknown `productId` → `422`. **`201`** → the added product.

### `DELETE /api/wishlist/:productId` — customer only
Removes the product from the wishlist (no-op if absent). **`200`** → `data: null`.
