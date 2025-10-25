# Quick Fix Scripts for Future Use
# استخدم هذه الأوامر للإصلاحات السريعة

# 1. البحث عن console.log في Services
Write-Host "🔍 Searching for console statements in services..." -ForegroundColor Cyan
$services = Get-ChildItem -Path "bulgarian-car-marketplace\src\services" -Include "*.ts" -Recurse -File
$count = 0
foreach ($file in $services) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "console\.(log|error|warn|debug)") {
        Write-Host "  📄 $($file.Name)" -ForegroundColor Yellow
        $count++
    }
}
Write-Host "✅ Found $count service files with console statements`n" -ForegroundColor Green

# 2. البحث عن any types
Write-Host "🔍 Searching for 'any' types..." -ForegroundColor Cyan
$anyCount = Select-String -Path "bulgarian-car-marketplace\src\**\*.ts" -Pattern ":\s*any" | 
    Where-Object { $_.Line -notmatch "\/\/" } | 
    Measure-Object | 
    Select-Object -ExpandProperty Count
Write-Host "✅ Found $anyCount uses of 'any' type`n" -ForegroundColor Yellow

# 3. البحث عن deprecated location fields
Write-Host "🔍 Searching for deprecated location fields..." -ForegroundColor Cyan
$deprecatedFields = @("location:", "city:", "region:") | ForEach-Object {
    $pattern = $_
    $matches = Select-String -Path "bulgarian-car-marketplace\src\**\*.ts*" -Pattern $pattern -SimpleMatch
    $matches.Count
}
$totalDeprecated = ($deprecatedFields | Measure-Object -Sum).Sum
Write-Host "✅ Found $totalDeprecated potential deprecated field uses`n" -ForegroundColor Yellow

# 4. البحث عن async functions بدون try-catch
Write-Host "🔍 Searching for async functions without error handling..." -ForegroundColor Cyan
$asyncWithoutTry = Select-String -Path "bulgarian-car-marketplace\src\**\*.ts*" -Pattern "async\s+\w+.*\{" |
    Where-Object { 
        $file = Get-Content $_.Path -Raw
        $functionStart = $_.LineNumber
        $functionContent = $file.Substring(0, [Math]::Min(1000, $file.Length))
        $functionContent -notmatch "try\s*\{" 
    } |
    Measure-Object |
    Select-Object -ExpandProperty Count
Write-Host "⚠️  Found ~$asyncWithoutTry async functions that may need error handling`n" -ForegroundColor Yellow

# Summary
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Console statements in services: $count files" -ForegroundColor White
Write-Host "  'any' type uses: $anyCount" -ForegroundColor White
Write-Host "  Deprecated location fields: $totalDeprecated" -ForegroundColor White
Write-Host "  Async without error handling: ~$asyncWithoutTry" -ForegroundColor White

Write-Host "`n✅ Analysis complete!" -ForegroundColor Green
Write-Host "📝 Next: Use these numbers to track progress in your fixes" -ForegroundColor Cyan
