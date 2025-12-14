# سكريبت النشر الكامل - جميع التغييرات
# Deploy All Changes Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "بدء عملية النشر الكاملة" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. الانتقال إلى مجلد المشروع
Set-Location "c:\Users\hamda\Desktop\New Globul Cars"

Write-Host "[1/5] إضافة جميع التغييرات إلى Git..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ تم إضافة جميع الملفات" -ForegroundColor Green
} else {
    Write-Host "✗ خطأ في إضافة الملفات" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[2/5] عمل Commit..." -ForegroundColor Yellow
$commitMessage = @"
docs: توحيد وتنظيف الملفات التوثيقية - دمج 16 ملف في ملفين موحدين

- إنشاء SELL_WORKFLOW_COMPLETE_DOCUMENTATION.md (دمج 14 ملف)
- إنشاء PROJECT_FIXES_AND_IMPROVEMENTS.md (دمج 2 ملف)
- تحديث INDEX.md بالهيكل الجديد
- إضافة تحذيرات للملفات القديمة
- إنشاء ARCHIVE/ للملفات القديمة
- إضافة ملفات توثيقية للتنظيف
"@

git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ تم عمل Commit بنجاح" -ForegroundColor Green
} else {
    Write-Host "✗ خطأ في Commit" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[3/5] رفع التغييرات إلى GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ تم الرفع إلى GitHub بنجاح" -ForegroundColor Green
} else {
    Write-Host "✗ خطأ في الرفع إلى GitHub" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[4/5] بناء المشروع (Build)..." -ForegroundColor Yellow
Set-Location "bulgarian-car-marketplace"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ تم بناء المشروع بنجاح" -ForegroundColor Green
} else {
    Write-Host "✗ خطأ في بناء المشروع" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[5/5] النشر إلى Firebase..." -ForegroundColor Yellow
Set-Location ".."
firebase deploy --only hosting
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ تم النشر إلى Firebase بنجاح" -ForegroundColor Green
} else {
    Write-Host "✗ خطأ في النشر إلى Firebase" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ تم إكمال جميع العمليات بنجاح!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "الموقع: https://mobilebg.eu/" -ForegroundColor Cyan
Write-Host "GitHub: hamdanialaa3" -ForegroundColor Cyan
Write-Host "Firebase: Fire New Globul" -ForegroundColor Cyan
