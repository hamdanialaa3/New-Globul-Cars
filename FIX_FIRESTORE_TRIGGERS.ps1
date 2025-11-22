# Fix Firestore and Schedule trigger issues
# Replaces firestore.document() and pubsub.schedule() patterns

$functionsPath = "c:\Users\hamda\Desktop\New Globul Cars\functions\src"

# Get all TypeScript files recursively
$files = Get-ChildItem -Path $functionsPath -Filter "*.ts" -Recurse

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $changed = $false
    
    # Fix firestore.document() -> functions.firestore.document()
    if ($content -match "^\s*export\s+const\s+\w+\s*=\s*firestore\.document\(" -or 
        $content -match "\)\s*=>\s*\{\s*firestore\.document\(") {
        
        $content = $content -replace "= firestore\.document\(", "= functions.firestore.document("
        $changed = $true
    }
    
    # Fix schedule.document() -> pubsub.schedule()
    if ($content -match "schedule\.document\(") {
        $content = $content -replace "schedule\.document\(", "pubsub.schedule("
        $changed = $true
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalFiles++
        Write-Host "✅ Fixed triggers in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Files modified: $totalFiles" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan
