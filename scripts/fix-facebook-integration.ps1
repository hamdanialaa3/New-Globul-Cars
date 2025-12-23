# Quick Fix Script for Facebook Integration Issues
# إصلاح سريع للمشاكل المُكتشفة

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Facebook Integration - Quick Fixes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Issue 1: Hardcoded Token Security Fix
Write-Host "[1/4] Fixing hardcoded token security issue..." -ForegroundColor Yellow

$serviceFile = "src\services\meta\facebook-auto-post.service.ts"
$content = Get-Content $serviceFile -Raw

# Remove hardcoded token
$content = $content -replace "process\.env\.REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN \|\| \s*'EAAZAS9Y73NscBO[^']*'", "process.env.REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN || ''"

Set-Content $serviceFile $content
Write-Host "   ✅ Removed hardcoded token" -ForegroundColor Green

# Issue 2: Fix import spacing
Write-Host "[2/4] Fixing import spacing..." -ForegroundColor Yellow

$content = Get-Content $serviceFile -Raw
$content = $content -replace "import axios from 'axios';\r?\nimport \{ logger \}", "import axios from 'axios';`n`nimport { logger }"

Set-Content $serviceFile $content
Write-Host "   ✅ Added empty line between import groups" -ForegroundColor Green

# Issue 3: Fix 'any' type usage
Write-Host "[3/4] Fixing TypeScript 'any' types..." -ForegroundColor Yellow

$content = Get-Content $serviceFile -Raw
$content = $content -replace "\} catch \(error: any\)", "} catch (error: unknown)"

Set-Content $serviceFile $content
Write-Host "   ✅ Replaced 'any' with 'unknown' in catch blocks" -ForegroundColor Green

# Issue 4: Add domain environment variable
Write-Host "[4/4] Adding domain configuration to .env..." -ForegroundColor Yellow

$envFile = ".env"
$envContent = Get-Content $envFile -Raw

if ($envContent -notmatch "REACT_APP_BASE_URL") {
    $addition = @"

# Base URL for car links in social media posts
REACT_APP_BASE_URL=https://bulgarskimobili.bg
"@
    
    Add-Content $envFile $addition
    Write-Host "   ✅ Added REACT_APP_BASE_URL to .env" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  REACT_APP_BASE_URL already exists" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "All fixes applied successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes in facebook-auto-post.service.ts" -ForegroundColor White
Write-Host "2. Verify .env has REACT_APP_BASE_URL" -ForegroundColor White
Write-Host "3. Run: npm start" -ForegroundColor White
Write-Host "4. Test by creating a new car listing" -ForegroundColor White
Write-Host ""
