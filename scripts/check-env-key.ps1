# Check if Google Maps API Key exists in .env
$envFile = ".env"

if (Test-Path $envFile) {
    Write-Host "✅ ملف .env موجود" -ForegroundColor Green
    $content = Get-Content $envFile
    $keyLine = $content | Select-String "REACT_APP_GOOGLE_MAPS_API_KEY"
    
    if ($keyLine) {
        Write-Host "✅ المفتاح موجود:" -ForegroundColor Green
        Write-Host $keyLine.Line -ForegroundColor White
    } else {
        Write-Host "❌ المفتاح غير موجود في .env" -ForegroundColor Red
        Write-Host "أضف هذا السطر إلى ملف .env:" -ForegroundColor Yellow
        Write-Host "REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBNNqHpz4tjaEwbHtPadlS0kk_BUgulmMo" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ ملف .env غير موجود" -ForegroundColor Red
    Write-Host "أنشئ ملف .env وأضف:" -ForegroundColor Yellow
    Write-Host "REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBNNqHpz4tjaEwbHtPadlS0kk_BUgulmMo" -ForegroundColor Cyan
}
