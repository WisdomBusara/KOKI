# KOKI

Luxury cosmetics & designer-perfume storefront for the Kenyan market, with an
admin to manage stock and sales and M-Pesa (Daraja STK push) checkout.

One Next.js 16 app: public storefront, a protected `/admin`, and the API routes
(including the M-Pesa callback) all run in the same process.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **Tailwind 4**
- **MongoDB** via **Mongoose** (Atlas or self-hosted)
- Admin auth: JWT cookie (`jose` + `bcryptjs`), gated by `src/proxy.ts`
- Payments: **M-Pesa Daraja** STK push + callback, with an STK-query reconcile fallback
- Images: **Cloudinary** unsigned upload (optional; falls back to a URL field)

## Getting started

```bash
npm install
cp .env.local.example .env.local      # fill in the values
npm run db:seed                        # seed the 8 starter products
npm run db:seed:admin                  # create the admin user from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev                            # http://localhost:3000
```

Admin: `/admin/login`.

### M-Pesa in local dev

STK callbacks need a public HTTPS URL. Run `ngrok http 3000`, set
`MPESA_CALLBACK_URL=https://<id>.ngrok-free.app/api/mpesa/callback` in
`.env.local`, restart, then checkout with the sandbox test number `254708374149`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:seed` | Seed/refresh products |
| `npm run db:seed:admin` | Create/update the admin user |

## Environment

See `.env.local.example` (local) and `deploy/.env.production.example` (server).
`NEXT_PUBLIC_*` values are inlined at **build** time, so set them before
`npm run build`. Secrets live only in `.env.local` / `.env.production`, which are
gitignored.

## Deployment

Deploying to the VPS behind nginx + Cloudflare at `koki.wisdombusara.com`:
see **[deploy/DEPLOY-VPS.md](deploy/DEPLOY-VPS.md)** plus the nginx block and
systemd unit under `deploy/`.
