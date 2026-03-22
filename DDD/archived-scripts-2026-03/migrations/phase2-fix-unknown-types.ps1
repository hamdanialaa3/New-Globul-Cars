#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Phase 2: إضافة normalizeError إلى جميع catch blocks
    
.DESCRIPTION
    يضيف استخدام normalizeError من error-helpers في جميع catch blocks
#>

Write-Host "
╔════════════════════════════════════════════════════════════╗
║          🔧 Phase 2: إصلاح Unknown Types                ║
║          إضافة normalizeError للـ catch blocks            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# الملفات الأولوية (التي تستخدم catch بكثرة)
$priorityFiles = @(
    "src/services/workflow-operations.ts",
    "src/services/vehicle-reminder.service.ts",
    "src/services/verification/id-verification.service.ts",
    "src/services/users/users-directory.service.ts",
    "src/services/with-loading.ts",
    "src/services/super-admin-cars-service.ts",
    "src/services/workflow-analytics-service.ts"
)

Write-Host "`n📋 الملفات المراد تحديثها:" -ForegroundColor Yellow
$priorityFiles | ForEach-Object { Write-Host "   • $_" -ForegroundColor Gray }

Write-Host "`n🔍 يتم تحليل الملفات..." -ForegroundColor Yellow

foreach ($file in $priorityFiles) {
    $fullPath = Join-Path "c:\Users\hamda\Desktop\New Globul Cars" $file
    
    if (Test-Path $fullPath) {
        Write-Host "`n   📄 $file" -ForegroundColor Cyan
        
        # قراءة الملف
        $content = Get-Content $fullPath -Raw
        
        # فحص إذا كان يستخدم error-helpers بالفعل
        if ($content -match "from.*error-helpers") {
            Write-Host "      ✅ يحتوي على error-helpers بالفعل" -ForegroundColor Green
        } else {
            Write-Host "      ⚠️  بحاجة إلى إضافة import لـ error-helpers" -ForegroundColor Yellow
            
            # عد catch blocks
            $catchCount = ([regex]::Matches($content, "catch\s*\(")).Count
            Write-Host "      📊 عدد catch blocks: $catchCount" -ForegroundColor Gray
        }
    }
}

Write-Host "`n✅ اكتمل التحليل" -ForegroundColor Green
Write-Host "الخطوة التالية: تحديث الملفات يدويًا أو استخدام regex replace" -ForegroundColor Yellow
