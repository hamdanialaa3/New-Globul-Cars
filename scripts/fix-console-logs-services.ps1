# Console.log Cleanup Script
# يُزيل جميع console.log/error/warn من ملفات Services

$ErrorActionPreference = "Continue"

# مسار المجلد
$servicesPath = "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\services"

# الملفات المستهدفة
$filesToFix = @(
    "$servicesPath\dealership\dealership.service.ts",
    "$servicesPath\social\analytics.service.ts"
)

# دالة لإصلاح ملف واحد
function Fix-ConsoleStatements {
    param($filePath)
    
    if (-not (Test-Path $filePath)) {
        Write-Host "File not found: $filePath" -ForegroundColor Red
        return
    }
    
    Write-Host "Processing: $filePath" -ForegroundColor Cyan
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Check if logger is already imported
    if ($content -notmatch "import.*logger.*from.*logger-service") {
        # Add logger import after last import
        $content = $content -replace "^(import\s+.*\n(?:import\s+.*\n)*)", "`$1import { logger } from '../logger-service';`n"
    }
    
    # Replace console.error with logger.error
    $content = $content -replace "console\.error\('([^']+)',\s*error\);", "logger.error('`$1', error as Error);"
    $content = $content -replace 'console\.error\("([^"]+)",\s*error\);', 'logger.error("`$1", error as Error);'
    
    # Replace console.log with logger.debug (development only)
    $content = $content -replace "console\.log\('([^']+)'\);", "logger.debug('`$1');"
    $content = $content -replace 'console\.log\("([^"]+)"\);', 'logger.debug("`$1");'
    
    # Replace console.log with data with logger.info
    $content = $content -replace "console\.log\('([^']+)',\s*([^)]+)\);", "logger.info('`$1', { data: `$2 });"
    $content = $content -replace 'console\.log\("([^"]+)",\s*([^)]+)\);', 'logger.info("`$1", { data: `$2 });'
    
    # Replace console.warn with logger.warn
    $content = $content -replace "console\.warn\('([^']+)'\);", "logger.warn('`$1');"
    $content = $content -replace 'console\.warn\("([^"]+)"\);', 'logger.warn("`$1");'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "✅ Fixed: $filePath" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⏭️  No changes needed: $filePath" -ForegroundColor Yellow
        return $false
    }
}

# تشغيل الإصلاح
$fixedCount = 0
foreach ($file in $filesToFix) {
    if (Fix-ConsoleStatements $file) {
        $fixedCount++
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "Files fixed: $fixedCount / $($filesToFix.Count)" -ForegroundColor Green
Write-Host "`n✅ Done! Check the files for TypeScript errors." -ForegroundColor Green
