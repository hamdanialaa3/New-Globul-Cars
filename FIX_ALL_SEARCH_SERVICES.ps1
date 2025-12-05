# ==========================================
# FIX ALL SEARCH SERVICES - Multi-Collection
# ==========================================

Write-Host "`n🔧 بدء إصلاح جميع خدمات البحث...`n" -ForegroundColor Cyan

$servicesPath = "bulgarian-car-marketplace\src\services"
$services = @(
    "super-admin-service.ts",
    "super-admin-cars-service.ts",
    "real-time-analytics-service.ts",
    "advanced-real-data-service.ts",
    "analytics\car-analytics.service.ts",
    "regionCarCountService.ts",
    "cityCarCountService.ts",
    "social\recommendations.service.ts",
    "social\analytics.service.ts",
    "reports\cars-report-service.ts",
    "firebase-debug-service.ts",
    "firebase-real-data-service.ts",
    "firebase-auth-users-service.ts",
    "admin-service.ts",
    "advanced-content-management-service.ts",
    "multi-platform-catalog\tiktok-feed.ts",
    "multi-platform-catalog\instagram-feed.ts",
    "multi-platform-catalog\google-merchant-feed.ts",
    "map-entities.service.ts"
)

$fixedCount = 0
$errorCount = 0

foreach ($service in $services) {
    $filePath = Join-Path $servicesPath $service
    
    if (Test-Path $filePath) {
        Write-Host "📝 معالجة: $service" -ForegroundColor Yellow
        
        try {
            $content = Get-Content $filePath -Raw
            
            # Check if already has multi-collection-helper
            if ($content -notmatch "multi-collection-helper") {
                # Add import at top
                $content = $content -replace "(import.*from 'firebase/firestore';)", "`$1`nimport { queryAllCollections, countAllVehicles, VEHICLE_COLLECTIONS } from './search/multi-collection-helper';"
                
                # Fix relative path if in subdirectory
                if ($service -match "\\") {
                    $content = $content -replace "from './search/multi-collection-helper'", "from '../search/multi-collection-helper'"
                }
                if ($service -match "\\.*\\") {
                    $content = $content -replace "from '../search/multi-collection-helper'", "from '../../search/multi-collection-helper'"
                }
                
                Set-Content -Path $filePath -Value $content -NoNewline
                $fixedCount++
                Write-Host "   ✅ تم إضافة الاستيراد" -ForegroundColor Green
            } else {
                Write-Host "   ⏭️  يحتوي بالفعل على multi-collection-helper" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "   ❌ خطأ: $_" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "⚠️  غير موجود: $service" -ForegroundColor Yellow
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n✅ اكتملت الإصلاحات:`n" -ForegroundColor Green
Write-Host "   📊 تم الإصلاح: $fixedCount"
Write-Host "   ❌ أخطاء: $errorCount"
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "⚠️  ملاحظة: الملفات تحتاج استبدال يدوي لاستدعاءات collection(db, 'cars')`n" -ForegroundColor Yellow
