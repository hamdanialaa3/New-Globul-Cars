# ==========================================
# Optimized React Dev Server Starter
# Usage: .\START_DEV.ps1
# ==========================================

param(
    [switch]$NoCache = $false,
    [switch]$Clean = $false,
    [int]$Memory = 4096
)

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 KOLI ONE - Optimized Dev Server Startup      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Clean if requested
if ($Clean) {
    Write-Host "  [1/4] Cleaning cache and node_modules..." -ForegroundColor Yellow
    npm run clean:all
    Write-Host "  ✓ Clean complete`n" -ForegroundColor Green
}

# Check for processes on port 3000
Write-Host "  [2/4] Checking port 3000..." -ForegroundColor Yellow
$portCheck = netstat -ano 2>$null | Select-String ":3000" | Select-Object -First 1
if ($portCheck) {
    Write-Host "  ⚠ Port 3000 in use, attempting to free..." -ForegroundColor Yellow
    $processId = ($portCheck -split '\s+')[-1]
    try {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Freed port 3000" -ForegroundColor Green
        Start-Sleep -Seconds 1
    } catch {
        Write-Host "  ℹ Could not free port (might be in use by system)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✓ Port 3000 is available" -ForegroundColor Green
}
Write-Host ""

# Set environment variables
Write-Host "  [3/4] Configuring environment..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max_old_space_size=$Memory"
$env:CRACO_ENABLE_ESLINT_CACHING = "true"
$env:SKIP_PREFLIGHT_CHECK = "true"
$env:PORT = "3000"
$env:HOST = "localhost"

Write-Host "  ✓ Memory allocated: ${Memory}MB" -ForegroundColor Green
Write-Host "  ✓ ESLint caching: Enabled" -ForegroundColor Green
Write-Host "  ✓ Preflight check: Skipped" -ForegroundColor Green
Write-Host ""

# Start dev server
Write-Host "  [4/4] Starting development server..." -ForegroundColor Yellow
Write-Host "`n  💡 Tips:" -ForegroundColor Cyan
Write-Host "     • First load takes 30-60 seconds (webpack build)" -ForegroundColor Gray
Write-Host "     • Subsequent reloads are much faster" -ForegroundColor Gray
Write-Host "     • Access: http://localhost:3000" -ForegroundColor Gray
Write-Host "     • Press CTRL+C to stop`n" -ForegroundColor Gray

# Run the start script
npm run start:dev

Write-Host ""
Read-Host "Press Enter to close this window"
