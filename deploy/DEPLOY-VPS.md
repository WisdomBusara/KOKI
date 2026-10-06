# Deploying KOKI to `koki.wisdombusara.com`

KOKI on the shared `ianprojects` VPS, behind the existing nginx + Cloudflare
setup. This reuses the model in the repo-root `CLOUDFLARE-SUBDOMAIN.md` (zone,
TLS, Cloudflare proxy) — read that for the DNS/TLS layer. This file covers only
what is specific to KOKI.

## What makes KOKI different from LoadForge

- **One process.** Pages, server actions, and `/api/*` (including the M-Pesa
  callback) are all one Next.js app. nginx proxies everything to a single
  loopback port — no split frontend/backend.
- **Dynamic, not a static export.** It needs a running Node process
  (`next start`). Do **not** turn on a Cloudflare "Cache Everything" rule — it
  would cache dynamic HTML and the `/api/*` responses. Default caching is fine.
- **DB is MongoDB Atlas** (external). Nothing to run locally; just allow the VPS
  IP in Atlas → Network Access. Do not set `MONGODB_DNS_SERVERS` in production.
- **`NEXT_PUBLIC_*` are inlined at build time** — `NEXT_PUBLIC_SITE_URL`,
  `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CLOUDINARY_*` must be set in
  `.env.production` BEFORE `npm run build`, not just at start.

## Prerequisites on the box

- Node 20.9+ (`node -v`) — Next 16 requires it.
- A free loopback port (this guide uses **3010**; check `ss -ltnp | grep 3010`).

## 1. DNS (Cloudflare)

Add an `A` record: name `koki`, value = the VPS public IP (`curl -4 -s ifconfig.me`),
**Proxied** (orange cloud). See `CLOUDFLARE-SUBDOMAIN.md` §4.

## 2. Code + build

```bash
sudo git clone <your-remote> /opt/koki     # or deploy your preferred way
cd /opt/koki
cp deploy/.env.production.example .env.production   # then edit it
npm ci
NODE_OPTIONS=--max-old-space-size=1536 npm run build   # memory cap: this box has OOM history
```

Seed the database (run once, from the box or anywhere with the prod `MONGODB_URI`):

```bash
npm run db:seed          # products
npm run db:seed:admin    # admin user from ADMIN_EMAIL/ADMIN_PASSWORD
```

## 3. Run it under systemd

```bash
sudo cp deploy/koki.service /etc/systemd/system/koki.service
# edit WorkingDirectory/User if not /opt/koki + www-data
sudo systemctl daemon-reload
sudo systemctl enable --now koki
systemctl status koki        # should be active (running)
curl -sI http://127.0.0.1:3010 | head -1   # Next answering locally
```

## 4. nginx

TLS reuses the shared Cloudflare wildcard origin cert already on the box
(`/etc/ssl/cloudflare/wisdombusara.*`). If it isn't there, see
`CLOUDFLARE-SUBDOMAIN.md` §5.

```bash
sudo cp deploy/nginx/koki.wisdombusara.com.conf /etc/nginx/sites-available/koki.wisdombusara.com
sudo ln -s /etc/nginx/sites-available/koki.wisdombusara.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx    # nginx -t FIRST — shared box
```

## 5. M-Pesa callback

In the Daraja portal set the STK callback to
`https://koki.wisdombusara.com/api/mpesa/callback`, and keep it in
`.env.production` as `MPESA_CALLBACK_URL`. Sandbox (174379 + sandbox passkey)
only simulates; real money needs a production Daraja app + real shortcode/passkey
+ Safaricom go-live, then flip `MPESA_ENV=production` and rebuild.

## 6. Verify (each step isolates one layer)

```bash
dig +short koki.wisdombusara.com                 # Cloudflare IPs, not the VPS IP
curl -sI https://koki.wisdombusara.com | head -1 # 200/3xx from the edge
curl -s https://koki.wisdombusara.com/shop | grep -o 'Midnight Oud Reserve' | head -1
curl -s https://koki.wisdombusara.com/api/orders/status?id=x   # {"error":"not found"} = API alive
```

Admin: `https://koki.wisdombusara.com/admin/login`.

## 7. Redeploys

```bash
cd /opt/koki && git pull
NODE_OPTIONS=--max-old-space-size=1536 npm run build
sudo systemctl restart koki
```

If you changed any `NEXT_PUBLIC_*`, the rebuild is required (they're inlined).
After markup/asset changes, purge the Cloudflare cache (Caching → Purge).

## 8. Rollback

```bash
sudo rm /etc/nginx/sites-enabled/koki.wisdombusara.com
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl disable --now koki
```

Then delete the `koki` DNS record. Leave the shared wildcard origin cert.
