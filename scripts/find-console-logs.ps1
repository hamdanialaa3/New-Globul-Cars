# Fix Console Logs Script - Simple Version
# Replace console.log with development-only checks

$sourceDir = "bulgarian-car-marketplace\src\services"
$files = Get-ChildItem -Path $sourceDir -Include "*.ts" -Recurse -File

$fixedCount = 0

Write-Host "Processing $($files.Count) files..." -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Skip if already has environment check
    if ($content -notmatch "process\.env\.NODE_ENV") {
        # Replace console.log statements
        $pattern1 = "console\.log\("
        $pattern2 = "console\.warn\("
        
        if ($content -match $pattern1 -or $content -match $pattern2) {
            Write-Host "Found console statements in: $($file.Name)" -ForegroundColor Yellow
            $fixedCount++
        }
    }
}

Write-Host "`nFound $fixedCount files with console statements" -ForegroundColor Green
Write-Host "Manual fix recommended for complex cases" -ForegroundColor Yellow
