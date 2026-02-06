#!/bin/bash
# scripts/build_and_run_all.sh

echo "🚀 Building Services..."

# 1. Build Publisher
echo "📦 Building Publisher Service..."
cd dev_s_media/services/publisher_service
npm run build
cd ../../..

# 2. Build Worker
echo "📦 Building Worker Engine..."
cd dev_s_media/services/worker
npm run build
cd ../../..

echo "✅ Build Complete."
echo "🟢 Starting Services (Publisher + Worker)..."

# Use concurrently to run both (if installed) or background jobs
if command -v concurrently >/dev/null 2>&1; then
    concurrently "cd dev_s_media/services/publisher_service && npm start" "cd dev_s_media/services/worker && npm start"
else
    echo "⚠️ 'concurrently' not found. Starting separately."
    node dev_s_media/services/publisher_service/dist/index.js &
    node dev_s_media/services/worker/dist/index.js &
    wait
fi
