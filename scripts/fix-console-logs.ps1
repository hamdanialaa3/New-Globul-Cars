# Fix Console Logs Script
# Replace all console.log/error/warn with environment checks

$sourceDir = "bulgarian-car-marketplace\src"
$files = Get-ChildItem -Path $sourceDir -Include "*.ts","*.tsx" -Recurse -File | 
    Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\build\\" }

$fixedCount = 0
$totalFiles = $files.Count

Write-Host "🔍 Found $totalFiles files to process..." -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $modified = $false
    
    # Replace console.log (keep for development only)
    if ($content -match "console\.log\(") {
        $content = $content -replace "(\s+)console\.log\(", "`$1if (process.env.NODE_ENV === 'development') { console.log("
        # Add closing brace
        $content = $content -replace "(console\.log\([^;]+\);)", "`$1 }"
        $modified = $true
    }
    
    # Replace console.error (keep in production but could use logger)
    # We'll keep console.error for now as it's critical
    
    # Replace console.warn (development only)
    if ($content -match "console\.warn\(") {
        $content = $content -replace "(\s+)console\.warn\(", "`$1if (process.env.NODE_ENV === 'development') { console.warn("
        $content = $content -replace "(console\.warn\([^;]+\);)", "`$1 }"
        $modified = $true
    }
    
    # Replace console.debug (development only)
    if ($content -match "console\.debug\(") {
        $content = $content -replace "(\s+)console\.debug\(", "`$1if (process.env.NODE_ENV === 'development') { console.debug("
        $content = $content -replace "(console\.debug\([^;]+\);)", "`$1 }"
        $modified = $true
    }
    
    if ($modified -and $content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $fixedCount++
        Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Completed! Fixed $fixedCount out of $totalFiles files" -ForegroundColor Green
Write-Host "⚠️  Note: console.error kept for critical errors" -ForegroundColor Yellow
