# PowerShell Script to Clean Up Backend Ghost Code
$BasePath = "c:\Users\hamda\Desktop\New Globul Cars\functions"

# List of files to delete (Relative to functions dir)
$FilesToDelete = @(
    "index.js",
    "financial-services.js",
    "adapters\financial-services-manager.js",
    "src\autonomous-resale.ts",
    "src\digital-twin.ts",
    "src\dynamic-insurance.ts",
    "src\gloubul-connect.ts",
    "src\iot-setup.ts",
    "src\notifications.ts",
    "src\proactive-maintenance.ts"
)

# Also delete directories if empty or specific ones
$DirsToDelete = @(
    "adapters"
)

Write-Host "Starting Backend Cleanup Process..." -ForegroundColor Cyan

foreach ($file in $FilesToDelete) {
    $fullPath = Join-Path $BasePath $file
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Force
        Write-Host "Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found (already deleted?): $file" -ForegroundColor Yellow
    }
}

foreach ($dir in $DirsToDelete) {
    $fullPath = Join-Path $BasePath $dir
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Recurse -Force
        Write-Host "Deleted Directory: $dir" -ForegroundColor Green
    }
}

Write-Host "Backend Cleanup Complete!" -ForegroundColor Cyan
