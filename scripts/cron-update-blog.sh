#!/bin/sh
# Pull the content repo and rebuild the site whenever the current HEAD is
# not the commit that was last SUCCESSFULLY built and published.
#
# BLOG_REPO_DIR and BUILD_BLOG_SCRIPT default to the real in-container paths;
# both are overridable so the tests can drive this against a sandbox.
set -eu

BLOG_REPO_DIR="${BLOG_REPO_DIR:-/blog}"
BUILD_BLOG_SCRIPT="${BUILD_BLOG_SCRIPT:-/usr/src/app/scripts/build-blog.sh}"

cd "$BLOG_REPO_DIR"

BEFORE=$(git rev-parse HEAD)
git pull --ff-only
AFTER=$(git rev-parse HEAD)

if [ -f "$BUILD_BLOG_SCRIPT" ]; then
  # Compare against the commit build-blog.sh actually finished publishing,
  # not the HEAD captured before this pull. Pull and build are not
  # transactional: if a previous run's build failed, HEAD had already
  # advanced by the time it failed, so a BEFORE/AFTER-only comparison would
  # make the *next* tick see BEFORE == AFTER and decide there was nothing
  # new -- silently skipping that content forever, with no signal outside a
  # log file in the pod. build-blog.sh records the commit it actually
  # published in LAST_BUILT_FILE (a `.last-built` file beside BLOG_DIST)
  # only after a successful swap. A missing file -- a fresh pod, or an image
  # built before this file existed -- means "build", so a fresh pod always
  # converges instead of trusting a stale baked-in build.
  BLOG_DIST="${BLOG_DIST:-/usr/src/app/blog-dist}"
  LAST_BUILT_FILE="${LAST_BUILT_FILE:-$BLOG_DIST.last-built}"
  if [ -f "$LAST_BUILT_FILE" ] && [ "$(cat "$LAST_BUILT_FILE")" = "$AFTER" ]; then
    echo "[update-blog] $AFTER already built; skipping"
    exit 0
  fi
  echo "[update-blog] $(cat "$LAST_BUILT_FILE" 2>/dev/null || echo '(none)') -> $AFTER; rebuilding"
  exec sh "$BUILD_BLOG_SCRIPT"
fi

# Legacy image (no build-blog.sh yet): this path never participates in the
# LAST_BUILT_FILE tracking above, so fall back to the old pre-pull-HEAD
# comparison instead.
#
# TODO: delete this fallback once every deployed pod is running the image
# built by Task 13 (the one that ships build-blog.sh). Until that rollout
# completes, the live pod's cron still calls this script against an older
# image that has no build-blog.sh, and must keep doing what it does today
# so the site does not go stale while the migration is in progress.
if [ "$BEFORE" = "$AFTER" ]; then
  echo "[update-blog] no new commits; skipping build"
  exit 0
fi

echo "[update-blog] $BEFORE -> $AFTER; rebuilding"
echo "[update-blog] $BUILD_BLOG_SCRIPT not found; falling back to legacy publish"
cp -r md /usr/src/app
