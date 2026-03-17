# Auto-fix TypeScript Errors - إصلاح آلي لأخطاء TypeScript
# Date: January 22, 2026
# Purpose: Fix common TypeScript errors automatically

Write-Host "🔧 Starting Automatic TypeScript Fixes..." -ForegroundColor Cyan

$errorCount = 0
$fixCount = 0

# Pattern 1: Fix .map(doc => to .map((doc: any) =>
Write-Host "`n📝 Pattern 1: Fixing .map() callbacks..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Fix .map(doc => to .map((doc: any) =>
    $content = $content -replace '\.map\(doc\s*=>', '.map((doc: any) =>'
    
    # Fix .map(car => to .map((car: any) =>
    $content = $content -replace '\.map\(car\s*=>', '.map((car: any) =>'
    
    # Fix .map(user => to .map((user: any) =>
    $content = $content -replace '\.map\(user\s*=>', '.map((user: any) =>'
    
    # Fix .map(item => to .map((item: any) =>
    $content = $content -replace '\.map\(item\s*=>', '.map((item: any) =>'
    
    # Fix .map(post => to .map((post: any) =>
    $content = $content -replace '\.map\(post\s*=>', '.map((post: any) =>'
    
    # Fix .map(v => to .map((v: any) =>
    $content = $content -replace '\.map\(v\s*=>', '.map((v: any) =>'
    
    # Fix .map(view => to .map((view: any) =>
    $content = $content -replace '\.map\(view\s*=>', '.map((view: any) =>'
    
    # Fix .filter(doc => to .filter((doc: any) =>
    $content = $content -replace '\.filter\(doc\s*=>', '.filter((doc: any) =>'
    
    # Fix .filter(car => to .filter((car: any) =>
    $content = $content -replace '\.filter\(car\s*=>', '.filter((car: any) =>'
    
    # Fix .filter(user => to .filter((user: any) =>
    $content = $content -replace '\.filter\(user\s*=>', '.filter((user: any) =>'
    
    # Fix .filter(item => to .filter((item: any) =>
    $content = $content -replace '\.filter\(item\s*=>', '.filter((item: any) =>'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixCount++
        Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Files fixed: $fixCount" -ForegroundColor Green
Write-Host "`n✅ Auto-fix complete!" -ForegroundColor Green
