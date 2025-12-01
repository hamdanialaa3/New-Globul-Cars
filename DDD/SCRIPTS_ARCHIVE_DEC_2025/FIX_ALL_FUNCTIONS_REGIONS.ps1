# Fix all .region('europe-west1') calls in Firebase Functions
# Removes .region('europe-west1') from all function declarations

$functionsPath = "c:\Users\hamda\Desktop\New Globul Cars\functions\src"

# Get all TypeScript files recursively
$files = Get-ChildItem -Path $functionsPath -Filter "*.ts" -Recurse

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Replace all .region('europe-west1') patterns
    $content = $content -replace "functions\.region\('europe-west1'\)\.", "functions."
    
    # Count replacements in this file
    $fileReplacements = ([regex]::Matches($originalContent, "functions\.region\('europe-west1'\)\.")).Count
    
    if ($fileReplacements -gt 0) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalFiles++
        $totalReplacements += $fileReplacements
        Write-Host "✅ Fixed $fileReplacements occurrences in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Files modified: $totalFiles" -ForegroundColor Yellow
Write-Host "   Total replacements: $totalReplacements" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan
