#!/usr/bin/env bash
set -euo pipefail

# Usage: ./preflight.sh --ad-json ./fixtures/sample_ad.json
AD_JSON=""
TIMEOUT=10
MIN_WIDTH=1080
MIN_HEIGHT=1080
LLM_HEALTH_URL="${LLM_HEALTH_URL:-http://localhost:5000/health}"

while [[ $# -gt 0 ]]; do
  case $1 in
    --ad-json) AD_JSON="$2"; shift 2 ;;
    --llm) LLM_HEALTH_URL="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 2 ;;
  esac
done

if [[ -z "$AD_JSON" ]]; then
  echo "Error: --ad-json is required"
  exit 2
fi

# Helper: extract image URLs from ad JSON (jq required)
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required"
  exit 2
fi

IMAGE_URLS=$(jq -r '.images[]?' "$AD_JSON")
if [[ -z "$IMAGE_URLS" ]]; then
  echo "Error: no images found in ad JSON"
  exit 3
fi

# 1) Check image reachability and resolution
echo "Checking image reachability and resolution..."
if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required"
  exit 2
fi
if ! command -v identify >/dev/null 2>&1; then
  echo "Warning: ImageMagick 'identify' not found; skipping resolution checks"
fi

for url in $IMAGE_URLS; do
  echo "- Checking $url"
  http_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" || echo "000")
  if [[ "$http_status" != "200" ]]; then
    echo "Error: image not reachable or returned $http_status: $url"
    exit 4
  fi

  if command -v identify >/dev/null 2>&1; then
    tmpfile=$(mktemp)
    curl -s --max-time $TIMEOUT "$url" -o "$tmpfile"
    read width height < <(identify -format "%w %h" "$tmpfile" 2>/dev/null || echo "0 0")
    rm -f "$tmpfile"
    if [[ "$width" -lt $MIN_WIDTH || "$height" -lt $MIN_HEIGHT ]]; then
      echo "Error: image resolution too small (${width}x${height}) for $url"
      exit 5
    fi
  fi
done

# 2) PII scan on description (phone numbers, emails)
echo "Scanning description for PII..."
DESCRIPTION=$(jq -r '.description // ""' "$AD_JSON")
PHONE_REGEX='[0-9]{6,}'
EMAIL_REGEX='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
if [[ "$DESCRIPTION" =~ $PHONE_REGEX ]]; then
  echo "Error: possible phone number detected in description"
  exit 6
fi
if [[ "$DESCRIPTION" =~ $EMAIL_REGEX ]]; then
  echo "Error: possible email detected in description"
  exit 6
fi

# 3) LLM health check
echo "Checking LLM health at $LLM_HEALTH_URL..."
if ! curl -s --max-time 5 "$LLM_HEALTH_URL" | grep -q "ok"; then
  echo "Error: LLM health check failed at $LLM_HEALTH_URL"
  exit 7
fi

echo "Preflight checks passed"
exit 0
