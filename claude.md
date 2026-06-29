# CLAUDE.md

# Perfume Capsules

Welcome to the Perfume Capsules codebase.

This document is intended to quickly onboard Claude Code to the project.

It explains:

- What this project is
- Why it exists
- How the codebase is organized
- How new features should be implemented
- Where to find documentation
- How to make architectural decisions

---

# What is this project?

Perfume Capsules is a modern ecommerce platform for selling authentic branded perfume decants.

Unlike a traditional perfume store, customers purchase smaller decants (5ml, 10ml, 30ml, etc.) instead of full-size bottles.

The business operates primarily through WhatsApp ordering.

The website is responsible for:

- Showcasing products
- Managing users
- Managing the shopping cart
- Collecting shipping information
- Saving orders
- Redirecting customers to WhatsApp with a pre-filled order

Payments are handled manually through JazzCash or EasyPaisa after the WhatsApp conversation begins.

There is no online payment gateway in the current version.

---

# Project Goals

This project should prioritize:

- Premium user experience
- Fast performance
- Mobile-first responsiveness
- Clean architecture
- Easy maintainability
- Future scalability

This project is intended to be production-ready.

Do not treat it as a prototype.

---

# Tech Stack

## Frontend

React

Vite

TypeScript

Tailwind CSS

React Router

TanStack Query

Axios

React Hook Form

Framer Motion

---

## Backend

Node.js

Express.js

TypeScript

Prisma ORM

---

## Database

PostgreSQL

---

## Authentication

JWT

bcrypt

---

## Storage

Cloudinary (Free Plan)

---

# Repository Structure

```
/
│
├── frontend/
│
├── backend/
│
└── docs/
```

---

# Frontend Structure

```
frontend/

src/

assets/

components/

ui/

common/

layout/

features/

pages/

hooks/

services/

store/

routes/

types/

utils/
```

The frontend should remain component-driven.

Reusable UI belongs in `components/ui`.

Business-specific UI belongs inside `features`.

Avoid placing business logic inside presentation components.

---

# Backend Structure

```
backend/

src/

config/

controllers/

middleware/

repositories/

routes/

services/

validators/

utils/

types/

prisma/
```

Architecture flow should be:

```
Route

↓

Controller

↓

Service

↓

Repository / Prisma

↓

Database
```

Business logic belongs in services.

Database queries belong in repositories (or the Prisma layer).

Controllers should remain thin.

---

# Database

The database uses PostgreSQL with Prisma.

Core entities include:
-site_settings
- Users
- Admins
- Brands
- Products
- ProductVariants
- ProductImages
- Categories
- ProductCategories
- Wishlist
- Reviews
- Orders
- OrderItems

Do not modify the schema without updating the documentation.

---

# Documentation

All documentation lives inside `/docs`.

Important documents include:

PROJECT_OVERVIEW.md

FUNCTIONAL_REQUIREMENTS.md

DATABASE_DESIGN.md

API_SPECIFICATION.md

FRONTEND_ARCHITECTURE.md

BACKEND_ARCHITECTURE.md

Always consult these documents before implementing new features.

---

# Business Rules

Every perfume:

- belongs to one brand
- can belong to multiple categories
- has multiple variants
- has multiple images

Inventory is tracked per variant.

Products should never have hardcoded sizes.

Sizes come from variants.

---

# Checkout Flow

Customer

↓

Browse Products

↓

Add To Cart

↓

Enter Shipping Information

↓

View Payment Instructions

↓

Order Saved

↓

Redirect to WhatsApp

The backend stores every order before opening WhatsApp.

---

# Admin Responsibilities

The admin manages:

- Brands
- Products
- Inventory
- Orders

Only one admin account exists in the current version.

---

# Design Philosophy

The UI should feel:

- Premium
- Minimal
- Modern
- Elegant

Avoid unnecessary visual clutter.

Animations should be subtle.

Performance takes priority over animations.

---

# Environment Variables

Never hardcode secrets or configuration values.

All sensitive values must live in `.env` files.

`.env` files are never committed to git. Add them to `.gitignore` immediately.

## Frontend (`frontend/.env`)

```
VITE_API_URL=
VITE_CLOUDINARY_URL=
VITE_CLOUDINARY_CLOUD_NAME=
```

## Backend (`backend/.env`)

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
NODE_ENV=
PORT=
WHATSAPP_NUMBER=
```

JWT_SECRET must be a long, random, unpredictable string. Never use short or obvious values.

NODE_ENV must be set to `production` in production environments.

---

# Cloudinary — Image Storage


# Cloudinary Setup

The Cloudinary account uses the free plan.

Credentials are stored in backend environment variables only:

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Configuration lives in `backend/src/config/cloudinary.ts`.

Initialize the SDK once at startup:

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

All upload logic lives in a dedicated service: `backend/src/services/upload.service.ts`.
Never import cloudinary directly in controllers or routes.

This project uses Cloudinary's **free plan** for all image storage.

Every implementation decision involving images must respect the free plan constraints.


## Free Plan Limits

| Limit | Value |
|---|---|
| Storage | 25 GB |
| Monthly bandwidth | 25 GB |
| Monthly transformations | 25,000 |
| Max file size per upload | 10 MB |

## Upload Rules

- Images are uploaded from the **backend only**. Never upload directly from the frontend.
- Use `unsigned uploads` only if a dedicated upload preset is configured in the Cloudinary dashboard. Prefer signed uploads via the backend.
- Always upload to organized folders. Use the following folder structure:

```
perfume-capsules/
├── products/
└── brands/
```

- Store the returned `public_id` and `secure_url` in the database. Never store raw file paths.
- Delete the Cloudinary asset when the corresponding database record is deleted. Do not leave orphaned files.

## Transformation Rules

Transformations consume the monthly quota. Use them conservatively.

- Apply transformations at upload time using eager transformations, not on every request.
- Use the following standard transformations per image type:

| Image Type | Width | Height | Crop | Format | Quality |
|---|---|---|---|---|---|
| Product image | 800px | 800px | fill | auto (WebP) | auto |
| Product thumbnail | 300px | 300px | fill | auto (WebP) | auto |
| Brand logo | 400px | 400px | fit | auto (WebP) | auto |

- Never generate arbitrary transformation URLs dynamically in frontend code.
- Always serve images using the `secure_url` returned by Cloudinary (HTTPS only).

## Bandwidth Conservation

- Use Cloudinary's automatic format (`f_auto`) and quality (`q_auto`) parameters to minimize bandwidth.
- Do not request full-resolution images for thumbnails or listing pages.
- Avoid fetching images that are not visible on screen.

---


# Security Rules

These rules are non-negotiable. Every implementation must follow them.

## Authentication & Authorization

- All protected routes require JWT verification middleware applied at the route level.
- Admin routes require a separate `isAdmin` middleware check in addition to JWT verification.
- Never expose user passwords, JWT secrets, or internal system IDs in API responses.
- JWT tokens must have an expiry. Use the `JWT_EXPIRES_IN` environment variable.
- Passwords must be hashed with bcrypt before storage. Never store plaintext passwords.

## Input Validation

- Validate and sanitize all incoming request data using validators before the request reaches the service layer.
- Reject requests that contain unexpected or malformed fields.
- Validate data types, lengths, and formats on both frontend and backend independently.

## Database

- Never use raw SQL with user-provided input.
- Prisma's query builder handles parameterization. Use it exclusively for database access.
- Never expose raw Prisma errors to API consumers.

## Rate Limiting

- Apply rate limiting to all authentication endpoints (`/auth/register`, `/auth/login`).
- Consider rate limiting on order submission endpoints to prevent abuse.

## HTTP Security

- Use CORS and restrict allowed origins to known frontend domains.
- Set secure HTTP headers using a library such as `helmet`.
- In production, all communication must occur over HTTPS.

## Sensitive Data

- Never log passwords, tokens, or payment-related information.
- Never include internal stack traces in API responses sent to clients.
- Sanitize error messages before returning them to the frontend.

---

# WhatsApp Redirect

The WhatsApp number is stored in the WHATSAPP_NUMBER environment variable (backend).

Format: international format, no +, no spaces, no dashes.
Example: 923001234567

The backend constructs the full wa.me URL and returns it in the order creation response.
The frontend opens it in a new tab after the order is confirmed saved.

The pre-filled message must include:
- Order ID
- Each item: product name, size, quantity, price
- Order total
- Customer shipping name, address, city, phone
- Payment method reminder (JazzCash / EasyPaisa)

Never hardcode the WhatsApp number anywhere in the codebase.

# Error Handling

## Backend

All API responses must follow a consistent JSON shape:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { } | null,
  "errors": [ ] | null
}
```

- Use a global error handler middleware in Express to catch unhandled errors.
- Never expose stack traces in production responses. Check `NODE_ENV` before including debug details.
- Use appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 409, 422, 500).
- Validation errors should return 422 with a list of field-level error messages.
- Authentication errors should return 401. Authorization errors should return 403.



## Frontend

- All API calls must handle loading, success, and error states explicitly.
- Display user-friendly error messages. Never show raw API error objects to users.
- Use TanStack Query's error and loading states consistently across all data-fetching components.
- Avoid silent failures. Always surface errors to the user in a clear, non-alarming way.

---

# Development Phases

Follow this build sequence **strictly and in order**.

> ⚠️ Do not begin a new phase until the current phase is fully complete and manually verified.
> Auth must be airtight before anything else is built on top of it.
> The WhatsApp checkout flow is the single most important user journey — it must be end-to-end functional before Phase 6 begins.

---

## 〔 PHASE 1 〕 Database Foundation

> **Goal:** Establish the full data model. Everything else depends on this.

### Tasks

- [ ] Initialize Prisma with PostgreSQL connection
- [ ] Define all schema models:
  - `User`, `Admin`
  - `Brand`
  - `Product`, `ProductVariant`, `ProductImage`
  - `Category`, `ProductCategory`
  - `Wishlist`
  - `Review`
  - `Order`, `OrderItem`
- [ ] Add all relations, constraints, and indexes
- [ ] Run initial migration (`prisma migrate dev`)
- [ ] Verify schema with `prisma studio`
- [ ] Update `DATABASE_DESIGN.md`

### Exit Criteria

All models exist in the database. Relations are correct. No migration errors.

---

## 〔 PHASE 2 〕 Authentication & Authorization

> **Goal:** Secure the entire application before any feature is built. This phase is non-negotiable.

### Tasks

- [ ] `POST /auth/register` — hash password with bcrypt, return JWT
- [ ] `POST /auth/login` — validate credentials, return JWT
- [ ] `GET /auth/me` — return current user from JWT
- [ ] `verifyToken` middleware — protect all non-public routes
- [ ] `isAdmin` middleware — protect all admin routes
- [ ] Rate limiting on `/auth/register` and `/auth/login`
- [ ] Input validation on all auth endpoints
- [ ] Confirm no passwords or secrets are ever returned in responses

### Exit Criteria

Register, login, and token verification all work correctly.
Protected routes reject unauthenticated requests with `401`.
Admin routes reject non-admin users with `403`.
Passwords are never stored or returned in plaintext.

---

## 〔 PHASE 3 〕 Backend Feature Modules

> **Goal:** Build all backend API modules in dependency order.

### Build order within this phase:

```
Brands  →  Categories  →  Products  →  ProductVariants  →  ProductImages  →  Orders
```

### Tasks

**Brands**
- [ ] CRUD endpoints for brands
- [ ] Brand logo upload via Cloudinary

**Categories**
- [ ] CRUD endpoints for categories

**Products**
- [ ] CRUD endpoints for products
- [ ] Filter by brand, category, search term
- [ ] Pagination on listing endpoints

**Product Variants**
- [ ] CRUD endpoints for variants (size, price, stock)
- [ ] Inventory tracking per variant

**Product Images**
- [ ] Upload via Cloudinary (backend only)
- [ ] Store `public_id` and `secure_url` in database
- [ ] Delete Cloudinary asset when image record is deleted

**Orders**
- [ ] `POST /orders` — save a complete order (user, items, shipping info)
- [ ] `GET /orders` — list orders (admin only)
- [ ] `GET /orders/:id` — order detail (admin or order owner)
- [ ] Validate stock availability before saving order

### Exit Criteria

All endpoints are reachable, protected by appropriate middleware, and return consistent response shapes.
Cloudinary uploads and deletions work correctly.
Orders are saved before any WhatsApp redirect occurs.

---

## 〔 PHASE 4 〕 Frontend Foundation

> **Goal:** Build the structural shell of the frontend before any features.

### Tasks

- [ ] Configure Vite + React + TypeScript + Tailwind CSS
- [ ] Set up React Router with route structure:
  - Public routes (home, catalog, product detail, cart, checkout)
  - Protected routes (wishlist, order history)
  - Admin routes (dashboard, products, orders)
- [ ] Build global layout components: `Navbar`, `Footer`, `PageWrapper`
- [ ] Configure Axios instance with base URL and JWT interceptor
- [ ] Set up TanStack Query client with default config
- [ ] Implement auth store (login state, user data, token persistence)
- [ ] Build `ProtectedRoute` and `AdminRoute` guard components
- [ ] Configure `.env` variables

### Exit Criteria

App loads without errors. Routing works. Auth store persists login state across refreshes. Axios sends JWT on authenticated requests.

---

## 〔 PHASE 5 〕 Frontend Features

> **Goal:** Implement all customer-facing features. This is the core product experience.

### Build order within this phase:

```
Product Catalog  →  Product Detail  →  Cart  →  Checkout  →  WhatsApp Redirect
```

### Tasks

**Product Catalog**
- [ ] Fetch and display products with brand/category filters
- [ ] Search input with debounce
- [ ] Pagination or infinite scroll
- [ ] Loading skeletons during fetch

**Product Detail**
- [ ] Image gallery (served via Cloudinary `secure_url`)
- [ ] Variant selector (size, price, stock status)
- [ ] Add to cart action
- [ ] Wishlist toggle (authenticated users)

**Shopping Cart**
- [ ] Persistent cart state (localStorage or store)
- [ ] Add, remove, update quantity
- [ ] Display subtotal per item and order total
- [ ] Stock validation before checkout

**Checkout**
- [ ] Shipping information form (React Hook Form + validation)
- [ ] Payment instructions display (JazzCash / EasyPaisa details)
- [ ] Order summary review
- [ ] Submit order to backend (`POST /orders`)
- [ ] On success: redirect to WhatsApp with pre-filled message

**WhatsApp Redirect**
- [ ] Construct WhatsApp URL with order ID, items, sizes, and total
- [ ] Open WhatsApp in a new tab after order is confirmed saved
- [ ] Display confirmation screen to the user

### Exit Criteria

A customer can browse products, add to cart, fill in shipping info, save an order, and be redirected to WhatsApp with a correctly formatted pre-filled message.

---

## 〔 PHASE 6 〕 Admin Panel

> **Goal:** Give the admin full control over the catalog and orders.

### Tasks

**Dashboard**
- [ ] Overview stats: total orders, total products, low stock alerts

**Brand Management**
- [ ] Create, edit, delete brands
- [ ] Upload brand logo via Cloudinary

**Product Management**
- [ ] Create, edit, delete products
- [ ] Manage variants (size, price, stock)
- [ ] Upload and reorder product images via Cloudinary

**Order Management**
- [ ] View all orders with status
- [ ] View order detail (items, shipping info, customer)
- [ ] Update order status

### Exit Criteria

Admin can fully manage brands, products, variants, images, and orders through the UI. All actions are protected by `isAdmin` middleware.

---

## 〔 PHASE 7 〕 Polish & Production Readiness

> **Goal:** Elevate the experience to production quality. Do not start this phase until all features are functional.

### Tasks

**Animations**
- [ ] Page transition animations (Framer Motion)
- [ ] Micro-interactions on buttons, cards, and modals
- [ ] Smooth cart open/close and drawer transitions

**Loading & Error States**
- [ ] Skeleton screens on all data-fetching pages
- [ ] Empty states for cart, wishlist, and no-results pages
- [ ] Global error boundary
- [ ] Toast notifications for success and error actions

**Performance**
- [ ] Lazy-load route components
- [ ] Optimize Cloudinary image delivery (WebP, `q_auto`, `f_auto`)
- [ ] Minimize unnecessary re-renders

**Final Checks**
- [ ] Test on mobile viewports (primary use case)
- [ ] Verify all `.env` variables are documented
- [ ] Confirm no secrets are exposed in frontend bundle
- [ ] Review all error messages shown to users

### Exit Criteria

The application is fast, visually polished, and handles all edge cases gracefully. It is ready for real users.

---

# Development Workflow

When implementing a feature:

1. Understand the requirement.
2. Check existing documentation.
3. Reuse existing components.
4. Keep architecture consistent.
5. Implement.
6. Verify functionality.
7. Update documentation if necessary.

Never duplicate functionality if it already exists.

---

# Making Decisions

When multiple solutions are possible:

Choose the solution that is:

- simpler
- more maintainable
- easier to understand
- consistent with the existing architecture

Avoid introducing unnecessary abstractions.

---

# Before Adding New Code

Before creating:

- a component
- a hook
- a utility
- a service
- middleware
- a validator

first check whether something similar already exists.

Prefer extending existing code over duplicating it.

---

# Documentation First

If a feature requires changing:

- database structure
- API contract
- architecture
- folder organization

update the corresponding documentation before or alongside the implementation.

Documentation should always reflect the current state of the project.

---

# Success Criteria

The project should remain:

- Easy to understand
- Easy to maintain
- Easy to scale

Every implementation should improve the overall quality of the codebase rather than simply adding functionality.
