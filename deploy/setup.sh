#!/usr/bin/env bash
#
# KOKI one-time server setup — installs the systemd unit and nginx site.
# Run once after the first clone (needs sudo). Re-running is harmless.
#
#   sudo ./deploy/setup.sh
#
# Assumes the repo is at /opt/koki and nginx uses sites-available/sites-enabled.
# If you cloned elsewhere, edit deploy/koki.service's WorkingDirectory first.
set -euo pipefail

APP_DIR="${KOKI_DIR:-/opt/koki}"
SERVICE="${KOKI_SERVICE:-koki}"
NGINX_SITE="koki.wisdombusara.com"

cd "$APP_DIR"

echo "==> Node version (need >= 20.9 for Next 16):"
node -v

echo "==> Installing systemd unit: ${SERVICE}.service"
sudo cp deploy/koki.service "/etc/systemd/system/${SERVICE}.service"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE"           # autostart on boot

echo "==> Installing nginx site: $NGINX_SITE"
sudo cp "deploy/nginx/${NGINX_SITE}.conf" "/etc/nginx/sites-available/${NGINX_SITE}"
sudo ln -sf "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
sudo nginx -t && sudo systemctl reload nginx   # nginx -t FIRST — shared box

echo
echo "Setup done. Next:"
echo "  1) cp deploy/.env.production.example .env.production  &&  edit it"
echo "  2) ./deploy/deploy.sh --seed"
