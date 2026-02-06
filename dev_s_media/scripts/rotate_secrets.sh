#!/bin/bash
# scripts/rotate_secrets.sh
# Automated Secret Rotation Script for Meta Tokens
# Usage: ./rotate_secrets.sh --env production

set -e

# Load current secrets (Simulating retrieval from Secret Manager)
CURRENT_TOKEN=$(grep PAGE_ACCESS_TOKEN .env | cut -d '=' -f2)
APP_ID=$(grep META_APP_ID .env | cut -d '=' -f2)
APP_SECRET=$(grep META_APP_SECRET .env | cut -d '=' -f2)

echo "🔄 Starting Secret Rotation..."

# 1. Exchange current token for a new Long-Lived Token
NEW_TOKEN_RESP=$(curl -s -X GET "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$APP_ID&client_secret=$APP_SECRET&fb_exchange_token=$CURRENT_TOKEN")

# Check for error
if echo "$NEW_TOKEN_RESP" | grep -q "error"; then
    echo "❌ Failed to rotate token from Meta API"
    echo "$NEW_TOKEN_RESP"
    # Log incident to Audit Table
    # psql -c "INSERT INTO audit_logs (action, actor_id, metadata) VALUES ('rotate_secret_failed', 'system', '$NEW_TOKEN_RESP')"
    exit 1
fi

NEW_TOKEN=$(echo "$NEW_TOKEN_RESP" | jq -r '.access_token')

# 2. Update .env file (Or send to Secret Manager)
# In production, use: gcloud secrets versions add ...
sed -i "s|PAGE_ACCESS_TOKEN=.*|PAGE_ACCESS_TOKEN=$NEW_TOKEN|" .env

echo "✅ Token Rotated Successfully."

# 3. Restart Services to pick up new token
echo "♻️ Restarting Worker Service..."
# pm2 restart worker-service
# docker service update ...

echo "✅ Rotation Complete at $(date)"
