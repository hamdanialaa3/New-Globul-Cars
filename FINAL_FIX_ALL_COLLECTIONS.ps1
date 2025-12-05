# ====================================================
# FINAL FIX: Replace ALL collection(db, 'cars') calls
# ====================================================

Write-Host "`n🚀 بدء الإصلاح النهائي - استبدال جميع استدعاءات collection(db, 'cars')...`n" -ForegroundColor Green

$servicesPath = "bulgarian-car-marketplace\src\services"

# Pattern 1: Simple getDocs(collection(db, 'cars'))
$pattern1 = @{
    Find = 'getDocs\(collection\(db, ''cars''\)\)'
    Replace = 'queryAllCollections()'
    Description = "getDocs(collection(db, 'cars')) → queryAllCollections()"
}

# Pattern 2: getDocs with query
$pattern2 = @{
    Find = 'getDocs\(query\(collection\(db, ''cars''\),'
    Replace = 'queryAllCollections('
    Description = "getDocs(query(collection(db, 'cars'), → queryAllCollections("
}

# Pattern 3: collection(db, 'cars') standalone
$pattern3 = @{
    Find = "collection\(db, 'cars'\)"
    Replace = "/* MANUAL FIX NEEDED: Use queryAllCollections() */ collection(db, 'cars')"
    Description = "Mark for manual review"
}

$patterns = @($pattern1, $pattern2)
$totalFixes = 0

# Get all TypeScript files
$files = Get-ChildItem -Path $servicesPath -Filter "*.ts" -Recurse | Where-Object {
    $_.Name -ne "multi-collection-helper.ts" -and
    $_.Name -ne "firebase-cache.service.ts" -and
    $_.FullName -notmatch "\\__tests__\\"
}

Write-Host "📁 عدد الملفات للفحص: $($files.Count)`n" -ForegroundColor Cyan

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($PWD.Path + "\$servicesPath\", "")
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileFixes = 0
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern.Find) {
            $matches = ([regex]::Matches($content, $pattern.Find)).Count
            $content = $content -replace $pattern.Find, $pattern.Replace
            $fileFixes += $matches
        }
    }
    
    if ($fileFixes -gt 0) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ $relativePath" -ForegroundColor Green
        Write-Host "   📝 $fileFixes إصلاحات" -ForegroundColor Gray
        $totalFixes += $fileFixes
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
Write-Host "🎉 اكتمل الإصلاح النهائي!`n" -ForegroundColor Green
Write-Host "   📊 إجمالي الإصلاحات: $totalFixes" -ForegroundColor Cyan
Write-Host "   📁 ملفات معدلة: $(($files | Where-Object { (Get-Content $_.FullName -Raw) -ne (Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue) }).Count)`n" -ForegroundColor Cyan

# Check remaining
$remaining = (Get-ChildItem -Path $servicesPath -Filter "*.ts" -Recurse | 
    Select-String -Pattern "collection\(db, 'cars'\)" -ErrorAction SilentlyContinue).Count

Write-Host "⚠️  استدعاءات متبقية (تحتاج مراجعة يدوية): $remaining`n" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
