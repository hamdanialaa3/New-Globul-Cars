# 🔧 سكريبت تحرير البورت 3000
# Script to free port 3000 and manage Docker ports

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🔍 فحص البورت 3000..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# خطوة 1: البحث عن العملية التي تستخدم البورت 3000
$portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($portProcess) {
    Write-Host "⚠️  البورت 3000 مستخدم بواسطة:" -ForegroundColor Yellow
    $pid = $portProcess.OwningProcess
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "📊 اسم العملية: $($process.ProcessName)" -ForegroundColor Yellow
        Write-Host "📊 PID: $pid" -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "هل تريد إيقاف هذه العملية؟ (Y/N)"
        if ($confirm -eq "Y" -or $confirm -eq "y") {
            Write-Host "🛑 إيقاف العملية..." -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Write-Host "✅ تم إيقاف العملية" -ForegroundColor Green
        }
    }
}
else {
    Write-Host "✅ البورت 3000 فارغ وجاهز للاستخدام!" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🐳 فحص حاويات Docker..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# خطوة 2: التحقق من Docker
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -eq 0) {
    $dockerContainers = docker ps | Select-String "3000"
    if ($dockerContainers) {
        Write-Host "⚠️  حاويات Docker تستخدم البورت 3000:" -ForegroundColor Yellow
        $dockerContainers
        Write-Host ""
        Write-Host "💡 للتوقف اختياري:" -ForegroundColor Cyan
        Write-Host "   docker stop <container_name>" -ForegroundColor Gray
    }
    else {
        Write-Host "✅ لا توجد حاويات Docker تستخدم البورت 3000" -ForegroundColor Green
    }
}
else {
    Write-Host "⚠️  Docker لم يتم تثبيته أو غير مشغل" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🚀 خيارات البدء:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "البورت الافتراضي المقترح: 5173 (Vite)" -ForegroundColor Green
Write-Host "البورت البديل: 3001, 3002, 3003, 8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "لتشغيل المشروع على بورت مختلف:" -ForegroundColor Yellow
Write-Host "  cd web" -ForegroundColor Gray
Write-Host "  npm run dev -- --port 5173" -ForegroundColor Gray
