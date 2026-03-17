# Quick TypeScript Error Counter
# Counts remaining TypeScript errors

Write-Host "🔍 Counting TypeScript errors..." -ForegroundColor Cyan
Write-Host "⏳ This may take a moment..." -ForegroundColor Yellow

$output = npx tsc --noEmit 2>&1 | Out-String
$errorLines = $output -split "`n" | Where-Object { $_ -match "error TS\d+" }
$errorCount = $errorLines.Count

if ($errorCount -eq 0) {
    Write-Host "`n✅ NO ERRORS! TypeScript compilation successful!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  $errorCount TypeScript errors remaining" -ForegroundColor Yellow
    
    # Show error breakdown
    $errorTypes = $errorLines | ForEach-Object {
        if ($_ -match "error (TS\d+)") {
            $matches[1]
        }
    } | Group-Object | Sort-Object Count -Descending | Select-Object -First 10
    
    Write-Host "`n📊 Top 10 Error Types:" -ForegroundColor Cyan
    foreach ($type in $errorTypes) {
        Write-Host "  $($type.Name): $($type.Count) occurrences" -ForegroundColor White
    }
}

Write-Host "`n✅ Analysis complete!" -ForegroundColor Green
