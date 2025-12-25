# سكريبت تنظيف المنافذ وتشغيل الخادم
# Start Server with Port Cleanup Script

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🧹 تنظيف المنافذ وتشغيل الخادم" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# تنظيف المنفذ 3000
Write-Host "🔍 البحث عن عمليات Node.js على المنفذ 3000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "⚠️  وجدت عمليات تستخدم المنفذ 3000" -ForegroundColor Red
    foreach ($pid in $processes) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "   🛑 إيقاف العملية: $($proc.ProcessName) (PID: $pid)" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 200
        }
    }
    Write-Host "✅ تم تنظيف المنفذ 3000`n" -ForegroundColor Green
} else {
    Write-Host "✅ المنفذ 3000 متاح`n" -ForegroundColor Green
}

# تنظيف عمليات node المعلقة
Write-Host "🔍 تنظيف عمليات Node.js المعلقة..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# تنظيف عمليات npm المعلقة
Write-Host "🔍 تنظيف عمليات npm المعلقة..." -ForegroundColor Yellow
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# الانتقال إلى مجلد المشروع
Set-Location "C:\Users\hamda\Desktop\New Globul Cars"

# التحقق من وجود node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules غير موجود - يجب تثبيت المكتبات أولاً" -ForegroundColor Red
    Write-Host "   قم بتشغيل: npm install" -ForegroundColor Yellow
    exit 1
}

# تعيين متغيرات البيئة
Write-Host "⚙️  تعيين متغيرات البيئة..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max_old_space_size=10096"
$env:BROWSER = "none"
$env:PORT = "3000"
$env:HOST = "localhost"

Write-Host "   NODE_OPTIONS: $env:NODE_OPTIONS" -ForegroundColor Gray
Write-Host "   BROWSER: $env:BROWSER" -ForegroundColor Gray
Write-Host "   PORT: $env:PORT`n" -ForegroundColor Gray

# تشغيل الخادم
Write-Host "🚀 بدء تشغيل الخادم..." -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    npm start
} catch {
    Write-Host "`n❌ حدث خطأ أثناء تشغيل الخادم" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

