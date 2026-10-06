# Serving KOKI via Cloudflare Tunnel (what's actually in production)

KOKI is published at `koki.wisdombusara.com` through a **dedicated Cloudflare
Tunnel**, not the proxied-A-record + nginx path in `DEPLOY-VPS.md`. No public
port, no origin cert, no nginx block for koki — the tunnel reaches the app
directly on `localhost:3010`.

The box also runs a **shared** `cloudflared.service` (tunnel `soma`, serving the
other projects) whose config is `/etc/cloudflared/config.yml`. **koki must never
be put in that file** — it runs as its own tunnel and its own service.

## One-time setup

```bash
# cloudflared is already installed on this box; authenticate if needed:
cloudflared tunnel login                       # skip if /root/.cloudflared/cert.pem exists

cloudflared tunnel create koki                 # note the printed tunnel id + creds json path
cloudflared tunnel route dns --overwrite-dns <KOKI_TUNNEL_ID> koki.wisdombusara.com

sudo cp deploy/cloudflared/koki.yml /etc/cloudflared/koki.yml   # then edit in the real id/creds path
sudo cp deploy/cloudflared-koki.service /etc/systemd/system/cloudflared-koki.service
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared-koki
```

Verify: `cloudflared tunnel list` (koki shows connections), and the Cloudflare
DNS record for `koki` is a proxied CNAME → `<KOKI_TUNNEL_ID>.cfargotunnel.com`.

## Database

Production uses the VPS Mongo (Docker container `mongodb`, `127.0.0.1:27017`).
Create a user once (from the box; this image ships the legacy `mongo` shell):

```bash
docker exec -i mongodb mongo --quiet --eval \
  'db.getSiblingDB("admin").createUser({user:"koki_user",pwd:"<PW>",roles:[{role:"readWrite",db:"koki"}]})'
```

Then in `/opt/koki/.env.production`:
`MONGODB_URI="mongodb://koki_user:<PW>@127.0.0.1:27017/koki?authSource=admin"`
(user created in `admin` ⇒ `authSource=admin`). Seed: `npm run db:seed && npm run db:seed:admin`.

## Health checks

```bash
systemctl status koki cloudflared-koki --no-pager
curl -sI http://localhost:3010 | head -1           # app, want 200
curl -sI https://koki.wisdombusara.com | head -1   # edge, want 200
```

## Don't

- Don't `cloudflared service install` for koki (clobbers the shared service).
- Don't write koki into `/etc/cloudflared/config.yml` (that's the shared tunnel;
  restore it from the newest `config.yml.bak-*` if it ever gets overwritten).
