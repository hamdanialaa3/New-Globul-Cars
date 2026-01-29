# Script to add Google Maps API Key to .env file
# سكريبت لإضافة مفتاح Google Maps API إلى ملف .env

# Get API key from user input or use default
# الحصول على المفتاح من المستخدم أو استخدام الافتراضي
param(
    [string]$apiKey = "AIzaSyBNNqHpz4tjaEwbHtPadlS0kk_BUgulmMo"
)
$envFile = ".env"
$keyName = "REACT_APP_GOOGLE_MAPS_API_KEY"

# Check if .env file exists
if (Test-Path $envFile) {
    Write-Host "ملف .env موجود، جارٍ التحديث..." -ForegroundColor Cyan
    
    # Read current content
    $content = Get-Content $envFile -Raw
    
    # Check if key already exists
    if ($content -match "$keyName\s*=") {
        Write-Host "المفتاح موجود، جارٍ التحديث..." -ForegroundColor Yellow
        # Replace existing key
        $content = $content -replace "$keyName\s*=.*", "$keyName=$apiKey"
        Set-Content -Path $envFile -Value $content -NoNewline
        Write-Host "✅ تم تحديث المفتاح!" -ForegroundColor Green
    } else {
        Write-Host "المفتاح غير موجود، جارٍ الإضافة..." -ForegroundColor Yellow
        # Add new key
        if ($content.EndsWith("`n") -or $content.EndsWith("`r`n")) {
            Add-Content -Path $envFile -Value "$keyName=$apiKey"
        } else {
            Add-Content -Path $envFile -Value "`n$keyName=$apiKey"
        }
        Write-Host "✅ تم إضافة المفتاح!" -ForegroundColor Green
    }
} else {
    Write-Host "ملف .env غير موجود، جارٍ الإنشاء..." -ForegroundColor Yellow
    # Create new .env file
    "$keyName=$apiKey" | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "✅ تم إنشاء ملف .env وإضافة المفتاح!" -ForegroundColor Green
}

Write-Host "`n✅ تم بنجاح!" -ForegroundColor Green
Write-Host "المفتاح: $apiKey" -ForegroundColor White
Write-Host "`nالخطوة التالية: أعد تشغيل التطبيق (npm start)" -ForegroundColor Cyan
