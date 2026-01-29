# Clean Ports Script for Windows PowerShell
# تنظيف المنافذ على Windows

Write-Host "🔌 تنظيف المنافذ..." -ForegroundColor Cyan

$ports = @(3000, 3001, 5173, 8080, 5000, 5001)

foreach ($port in $ports) {
    Write-Host "  ⚙️  فحص المنفذ $port..." -ForegroundColor Yellow
    
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connections) {
        foreach ($connection in $connections) {
            $pid = $connection.OwningProcess
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-Host "    🛑 إيقاف العملية $($process.Name) (PID: $pid) على المنفذ $port" -ForegroundColor Red
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "  ✅ تم تنظيف المنفذ $port" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  المنفذ $port غير مستخدم" -ForegroundColor Gray
    }
}

Write-Host "`n✨ تم الانتهاء من تنظيف المنافذ!" -ForegroundColor Green

