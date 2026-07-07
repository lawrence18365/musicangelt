#!/bin/zsh
# Google Ads offline-conversion upload (D1 -> Data Manager API), launchd-safe.
#
# macOS TCC blocks launchd agents from reading ~/Desktop, where the repo lives.
# So this runner works from a mirror at ~/Library/Application Support/MusicAngel/:
#   - when the repo IS readable (interactive shells), it refreshes the mirror first;
#   - when it is NOT (launchd), it runs from the existing mirror.
# Install: cp this file to "$MIRROR/run-upload.sh"; launchd agent
# com.musicangel.google-ads-conversion-upload runs that copy Mon+Thu 09:30.
#
# Idempotent: google_ads_conversion_uploads ledger + Google transaction_id dedup;
# a run with nothing new prints {"result":"no_candidates"}.

set -u
REPO="/Users/lawrence/Desktop/musicangelt"
MIRROR="$HOME/Library/Application Support/MusicAngel"
LOG="$HOME/Library/Logs/musicangel-google-ads-upload.log"

# launchd has a bare PATH; node lives under nvm on this machine.
NODE="/Users/lawrence/.nvm/versions/node/v24.13.0/bin/node"
[ -x "$NODE" ] || NODE="$(ls -d $HOME/.nvm/versions/node/*/bin/node 2>/dev/null | tail -1)"
[ -x "$NODE" ] || NODE="$(command -v node)"

{
  echo "=== $(date -u '+%Y-%m-%dT%H:%M:%SZ') upload run start ==="

  # NB: [ -r ] passes under TCC even when reads are denied — probe with a real read.
  if cat "$REPO/.env.google-ads.local" > /dev/null 2>&1; then
    echo "repo readable: refreshing mirror"
    mkdir -p "$MIRROR/scripts" "$MIRROR/.tokens"
    # Atomic writes only — a TCC-denied read must never clobber a good mirror file.
    cp "$REPO/scripts/google-ads-safe-ops.js" "$MIRROR/scripts/.ops.tmp" 2>/dev/null \
      && mv -f "$MIRROR/scripts/.ops.tmp" "$MIRROR/scripts/google-ads-safe-ops.js"
    cp "$REPO/.tokens/google-ads-service-account.json" "$MIRROR/.tokens/.key.tmp" 2>/dev/null \
      && mv -f "$MIRROR/.tokens/.key.tmp" "$MIRROR/.tokens/google-ads-service-account.json"
    # Rewrite credential paths from repo to mirror in the env copy.
    sed "s#$REPO/.tokens#$MIRROR/.tokens#g" "$REPO/.env.google-ads.local" > "$MIRROR/.env.tmp" 2>/dev/null \
      && mv -f "$MIRROR/.env.tmp" "$MIRROR/.env.google-ads.local"
    chmod 600 "$MIRROR/.tokens/google-ads-service-account.json" "$MIRROR/.env.google-ads.local" 2>/dev/null
  else
    echo "repo not readable (launchd/TCC): using mirror"
  fi

  if [ ! -r "$MIRROR/scripts/google-ads-safe-ops.js" ]; then
    echo "FATAL: mirror missing; run this script once from an interactive shell"
    echo "=== exit=1 ==="
    exit 1
  fi

  "$NODE" "$MIRROR/scripts/google-ads-safe-ops.js" upload-d1-qualified-leads-apply 2>&1
  echo "=== exit=$? ==="
} >> "$LOG" 2>&1
