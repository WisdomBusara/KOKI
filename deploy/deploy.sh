#!/usr/bin/env bash
#
# KOKI redeploy — pull latest, install, build, restart. Safe to re-run.
#
#   ./deploy/deploy.sh            # pull + build + restart
#   ./deploy/deploy.sh --seed     # also (re)seed products + admin after build
#
# Override defaults with env vars, e.g.  KOKI_DIR=/srv/koki PORT=3020 ./deploy/deploy.sh
set -euo pipefail

APP_DIR="${KOKI_DIR:-/opt/koki}"
BRANCH="${KOKI_BRANCH:-main}"
SERVICE="${KOKI_SERVICE:-koki}"
PORT="${PORT:-3010}"
BUILD_MEM="${KOKI_BUILD_MEM:-1536}"   # Next build memory cap (MB); this box has OOM history

cd "$APP_DIR"
echo "==> KOKI deploy in $APP_DIR (branch $BRANCH)"

if [ ! -f .env.production ]; then
  echo "!! .env.production missing — copy deploy/.env.production.example and fill it in." >&2
  exit 1
fi

echo "==> Fetching origin/$BRANCH"
git fetch --prune origin "$BRANCH"
# Match remote exactly. node_modules, .next and .env.production are untracked, so preserved.
git reset --hard "origin/$BRANCH"

echo "==> npm ci"
npm ci

echo "==> Building (NODE_OPTIONS=--max-old-space-size=$BUILD_MEM)"
NODE_OPTIONS="--max-old-space-size=$BUILD_MEM" npm run build

if [ "${1:-}" = "--seed" ]; then
  echo "==> Seeding database"
  npm run db:seed
  npm run db:seed:admin
fi

echo "==> Restarting $SERVICE"
sudo systemctl restart "$SERVICE"

echo "==> Health check on 127.0.0.1:$PORT"
for _ in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
    echo "==> KOKI is up."
    exit 0
  fi
  sleep 1
done

echo "!! No response on :$PORT. Check logs:  sudo journalctl -u $SERVICE -n 50 --no-pager" >&2
exit 1
