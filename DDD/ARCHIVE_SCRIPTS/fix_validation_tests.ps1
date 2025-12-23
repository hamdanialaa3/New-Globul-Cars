$BasePath = "c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\services\__tests__"
$OldTest = Join-Path $BasePath "validation-service.test.ts"
$EnhancedTest = Join-Path $BasePath "validation-service-enhanced.test.ts"

if (Test-Path $OldTest) {
    Remove-Item -Path $OldTest -Force
    Write-Host "Deleted old validation-service.test.ts"
}

if (Test-Path $EnhancedTest) {
    # Read content
    $content = Get-Content -Path $EnhancedTest -Raw
    # Replace import
    $newContent = $content -replace "validation-service-enhanced", "validation-service"
    # Write back
    Set-Content -Path $EnhancedTest -Value $newContent
    # Rename
    Rename-Item -Path $EnhancedTest -NewName "validation-service.test.ts"
    Write-Host "Renamed and updated validation-service-enhanced.test.ts"
}
