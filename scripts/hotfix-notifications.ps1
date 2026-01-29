# Quick Fix: Firestore Listener Race Condition
# Fixes Phase 2 notification system errors

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   HOTFIX: Notification System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] Issue: Duplicate Firestore listeners causing race condition" -ForegroundColor Yellow
Write-Host "[INFO] Fix: Removed duplicate hook, added error boundaries" -ForegroundColor Yellow
Write-Host ""

# Clear cache to force recompilation
Write-Host "[1/3] Clearing dev cache..." -ForegroundColor Blue
if (Test-Path ".cache") {
    Remove-Item -Path ".cache" -Recurse -Force
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force
}
Write-Host "✓ Cache cleared" -ForegroundColor Green
Write-Host ""

# Restart dev server
Write-Host "[2/3] Restarting development server..." -ForegroundColor Blue
Write-Host "[INFO] Press Ctrl+C to stop the previous server, then run: npm start" -ForegroundColor Yellow
Write-Host ""

# Summary
Write-Host "[3/3] Changes Applied:" -ForegroundColor Blue
Write-Host "  ✓ Removed duplicate listener from UnifiedHeader.tsx" -ForegroundColor Green
Write-Host "  ✓ Added error boundaries to NotificationBell.tsx" -ForegroundColor Green
Write-Host "  ✓ Enhanced service cleanup with try-catch blocks" -ForegroundColor Green
Write-Host "  ✓ Prevented component state updates after unmount" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Stop current dev server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Run: npm start" -ForegroundColor White
Write-Host "3. Hard refresh browser (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "4. Check console - errors should be gone" -ForegroundColor White
Write-Host ""
Write-Host "Root Cause Fixed:" -ForegroundColor Green
Write-Host "  • useFirestoreNotifications hook was creating duplicate listener" -ForegroundColor Gray
Write-Host "  • NotificationBell component now uses single notification-service" -ForegroundColor Gray
Write-Host "  • Service ensures only ONE listener per user at a time" -ForegroundColor Gray
Write-Host ""
