# Backend Architecture

The backend is a Node.js + Express + TypeScript application using Prisma ORM against
PostgreSQL. The request flow is strictly layered:

```
Route → Controller → Service → Repository / Prisma → Database
```

- Business logic lives in **services**.
- Database queries live in **repositories** (the only layer that imports Prisma).
- Controllers stay **thin** (parse validated input, call a service, send a response).

## Current Folder Layout (`backend/src`)

```
src/
├── config/
│   ├── env.ts            # Zod-validated environment config (app refuses to boot if invalid)
│   └── prisma.ts         # Single shared PrismaClient instance
├── controllers/
│   └── auth.controller.ts
├── middleware/
│   ├── auth.middleware.ts    # requireAuth, requireAdmin
│   ├── error.middleware.ts   # notFound + global errorHandler
│   ├── rateLimit.middleware.ts
│   └── validate.middleware.ts # Zod request validation
├── repositories/
│   ├── admin.repository.ts
│   └── user.repository.ts
├── routes/
│   ├── index.ts          # mounts feature routers under /api
│   └── auth.routes.ts
├── scripts/
│   └── createAdmin.ts    # CLI to provision the single admin
├── services/
│   ├── auth.service.ts   # register/login/adminLogin/getCurrent + bcrypt hashing
│   └── token.service.ts  # JWT sign/verify
├── types/
│   ├── auth.types.ts
│   └── express.d.ts      # augments Request with `auth`
├── utils/
│   ├── ApiError.ts       # operational error with statusCode + field errors
│   ├── apiResponse.ts    # sendSuccess envelope helper
│   └── asyncHandler.ts   # forwards async errors to Express
├── app.ts                # builds the Express app (helmet, cors, json, routes, handlers)
└── index.ts              # bootstrap: connect DB, listen, graceful shutdown
```

## Cross-Cutting Concerns

- **Validation:** Zod schemas in `validators/`, applied via `validate()` middleware
  before the controller. Unknown fields are rejected (`strictObject`). Returns `422`
  with field-level messages.
- **Errors:** Anything thrown becomes an `ApiError` (or is mapped from a known Prisma
  error) and is rendered by the global `errorHandler` into the standard envelope.
  Stack traces and raw Prisma errors are never exposed in production.
- **Security:** `helmet` headers, `cors`, JSON body cap (10kb), bcrypt password
  hashing (12 rounds), JWT with mandatory expiry, rate limiting on auth endpoints.
- **Auth:** `requireAuth` verifies the Bearer token and sets `req.auth`;
  `requireAdmin` enforces the admin role (`403` otherwise).

## Tooling

- `npm run dev` — start with ts-node (uses `ts-node.files` so ambient types load).
- `npm run typecheck` — `tsc --noEmit` under strict mode.
- `npm run build` / `npm start` — compile to `dist/` and run.
- `npm run create:admin -- <email> <password> "<name>"` — provision the admin.
- `npm run prisma:migrate` / `prisma:studio` / `prisma:generate` / `prisma:validate`.

> **Module setup:** `tsconfig` uses `module`/`moduleResolution: NodeNext` (TS 6) with
> `"type": "commonjs"`, so relative imports remain extensionless.
