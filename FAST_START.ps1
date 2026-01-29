# ⚡ Fast Start Script - حل مشكلة البطء
# Run: .\FAST_START.ps1

Write-Host "🚀 Starting Fast Cleanup & Start..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node processes
Write-Host "1️⃣ Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Step 2: Free port 3000
Write-Host "2️⃣ Freeing port 3000..." -ForegroundColor Yellow
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) {
    Stop-Process -Id $port.OwningProcess -Force
}

# Step 3: Clean all caches
Write-Host "3️⃣ Cleaning caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .cache
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules/.cache
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue build
Remove-Item -Force -ErrorAction SilentlyContinue .eslintcache
npm cache clean --force 2>$null

# Step 4: Start dev server
Write-Host "4️⃣ Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "✅ Server will start on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

npm start
