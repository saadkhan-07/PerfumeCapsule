# Backend tests

## Phase 3 end-to-end suite (`phase3.e2e.mjs`)

A black-box suite that exercises every Phase 3 module against a **running**
server, a **real** PostgreSQL database, and **real** Cloudinary uploads:

- **Auth** — register/login/admin-login/`/me`, duplicate→409, bad creds→401,
  invalid→422, password never exposed
- **Brands / Categories / Products / Variants / Product Images** — public reads,
  admin-only writes, authz (401/403), validation, pagination, brand filter,
  search, slug regeneration, unique constraints
- **Cloudinary** — real logo / product-image / favicon uploads (https `secure_url`
  + stored `publicId`), and asset cleanup on delete
- **Orders** — pricing + shipping math + snapshots, stock validation, oversell→409,
  owner/admin access rules, status transitions, and **concurrent oversell**
  (proves the atomic stock-decrement transaction)
- **Site Settings** — public read, admin update, favicon upload
- **Cross-cutting** — consistent error envelope, no stack-trace leakage,
  auth rate-limiting (429)

The suite creates uniquely-named records and **deletes them at the end**, which
also removes the Cloudinary assets it uploaded (no orphans, no quota creep).

### Prerequisites

1. **Server running** and reachable (default `http://localhost:5000`):
   ```bash
   npm run dev        # or: npm run build && npm start
   ```
2. **Admin account** exists (default `admin@perfume.test` / `admin12345`):
   ```bash
   npm run create:admin -- admin@perfume.test admin12345 "Test Admin"
   ```
3. **Cloudinary** credentials present in `backend/.env` (the suite performs real
   uploads). Without them the image-upload assertions will fail.

### Run

```bash
npm run test:e2e
```

Run against a **freshly-started** server so the in-memory rate-limit counter is
reset (the suite intentionally trips the limiter as its last check).

### Configuration (env, no secrets committed)

| Variable | Default | Purpose |
|---|---|---|
| `E2E_BASE_URL` | `http://localhost:5000` | Server base URL |
| `E2E_ADMIN_EMAIL` | `admin@perfume.test` | Admin login email |
| `E2E_ADMIN_PASSWORD` | `admin12345` | Admin login password |

Exit code is `0` when all checks pass, `1` otherwise.
