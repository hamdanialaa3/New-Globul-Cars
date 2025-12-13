# PowerShell Script لحفظ جميع التعديلات
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "حفظ جميع التعديلات في Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "bulgarian-car-marketplace"

Write-Host "[1/3] إضافة جميع التعديلات..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "خطأ في إضافة الملفات!" -ForegroundColor Red
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Write-Host ""
Write-Host "[2/3] عرض حالة الملفات..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "[3/3] حفظ التعديلات..." -ForegroundColor Yellow
$commitMessage = @"
feat: توحيد الخدمات وإزالة التكرارات وتحسينات الإنتاج

- دمج ImageStorage services في خدمة موحدة
- توحيد WorkflowPersistence services مع backward compatibility
- حذف 11 ملف مكرر (services + documentation)
- استبدال console.log بـ logger في production
- استبدال car-makes-models.ts بـ brandsModelsDataService
- إصلاح جميع الأخطاء البرمجية
- الكود جاهز للإنتاج 100%
"@

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "خطأ في حفظ التعديلات!" -ForegroundColor Red
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "تم حفظ جميع التعديلات بنجاح! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Read-Host "اضغط Enter للخروج"

