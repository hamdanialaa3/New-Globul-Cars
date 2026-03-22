# Auto-fix Error Types - إصلاح أخطاء unknown error
# Date: January 22, 2026

Write-Host "🔧 Fixing unknown error types..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse -File
$fixCount = 0

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        
        # Fix: error.message where error is unknown
        # Pattern: error.message -> (error as Error).message
        $content = $content -replace '(\s+)(error)\.message', '$1($2 as Error).message'
        
        # Fix: error.code where error is unknown
        $content = $content -replace '(\s+)(error)\.code', '$1($2 as any).code'
        
        # Fix: error.response
        $content = $content -replace '(\s+)(error)\.response', '$1($2 as any).response'
        
        # Fix: error.request
        $content = $content -replace '(\s+)(error)\.request', '$1($2 as any).request'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $fixCount++
            Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
        }
    }
    catch {
        # Skip files that can't be read
    }
}

Write-Host "`n📊 Files fixed: $fixCount" -ForegroundColor Green
