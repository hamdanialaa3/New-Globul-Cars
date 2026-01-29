#!/bin/bash
# استخدام: bash cleanup-future.sh
# يقوم بحذف cache و node_modules دون تأثير على المشروع

set -e

PROJECT_DIR="C:\Users\hamda\Desktop\New Globul Cars"
cd "$PROJECT_DIR" || exit 1

echo "🧹 Cleanup Script - Project Maintenance"
echo "======================================"
echo ""
echo "This script will remove:"
echo "  • node_modules/ (will be reinstalled)"
echo "  • .git cache"
echo "  • Package manager caches"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📦 Removing node_modules..."
    rm -rf node_modules
    rm -rf .pnp .pnp.js
    
    echo "🗑️  Removing caches..."
    rm -rf .vite .turbo .cache .parcel-cache .next .firebase
    
    echo "📝 Removing npm cache..."
    npm cache clean --force
    
    echo ""
    echo "✅ Cleanup complete!"
    echo ""
    echo "To restore, run:"
    echo "  npm install"
    echo ""
    echo "Project statistics:"
    du -sh . 2>/dev/null || stat -f%z . 2>/dev/null || (dir /s | tail -1)
else
    echo "Cleanup cancelled."
    exit 0
fi
