#!/bin/sh
# Pull the content repo and rebuild the site only when something changed.
set -eu

cd /blog

BEFORE=$(git rev-parse HEAD)
git pull --ff-only
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
  echo "[update-blog] no new commits; skipping build"
  exit 0
fi

echo "[update-blog] $BEFORE -> $AFTER; rebuilding"

# TODO: delete this fallback once every deployed pod is running the image
# built by Task 13 (the one that ships build-blog.sh). Until that rollout
# completes, the live pod's cron still calls this script against an older
# image that has no build-blog.sh, and must keep doing what it does today
# so the site does not go stale while the migration is in progress.
if [ -f /usr/src/app/scripts/build-blog.sh ]; then
  exec sh /usr/src/app/scripts/build-blog.sh
fi

echo "[update-blog] /usr/src/app/scripts/build-blog.sh not found; falling back to legacy publish"
cp -r md /usr/src/app
