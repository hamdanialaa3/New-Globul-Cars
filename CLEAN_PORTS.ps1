# سكريبت تنظيف جميع المنافذ الشائعة
# Clean Common Ports Script

param(
    [int[]]$Ports = @(3000, 3001, 3002, 4000, 5000, 5001, 8080, 8081, 8082, 9099)
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🧹 تنظيف المنافذ" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$totalCleaned = 0

foreach ($port in $Ports) {
    Write-Host "🔍 فحص المنفذ $port..." -ForegroundColor Yellow
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        foreach ($pid in $processes) {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "   🛑 إيقاف: $($proc.ProcessName) (PID: $pid) على المنفذ $port" -ForegroundColor Red
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                $totalCleaned++
                Start-Sleep -Milliseconds 200
            }
        }
    } else {
        Write-Host "   ✅ المنفذ $port متاح" -ForegroundColor Green
    }
}

# تنظيف عمليات Node.js المعلقة
Write-Host "`n🔍 تنظيف عمليات Node.js المعلقة..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeCount = $nodeProcesses.Count
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   🛑 تم إيقاف $nodeCount عملية Node.js" -ForegroundColor Red
    $totalCleaned += $nodeCount
} else {
    Write-Host "   ✅ لا توجد عمليات Node.js معلقة" -ForegroundColor Green
}

# تنظيف عمليات npm المعلقة
Write-Host "`n🔍 تنظيف عمليات npm المعلقة..." -ForegroundColor Yellow
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue
if ($npmProcesses) {
    $npmCount = $npmProcesses.Count
    $npmProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   🛑 تم إيقاف $npmCount عملية npm" -ForegroundColor Red
    $totalCleaned += $npmCount
} else {
    Write-Host "   ✅ لا توجد عمليات npm معلقة" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
if ($totalCleaned -gt 0) {
    Write-Host "✅ تم تنظيف $totalCleaned عملية" -ForegroundColor Green
} else {
    Write-Host "✅ جميع المنافذ نظيفة ومتاحة" -ForegroundColor Green
}
Write-Host "========================================`n" -ForegroundColor Cyan

Start-Sleep -Seconds 2

