# 🚀 تطبيق إصلاح CI/CD Pipeline - PowerShell Version
# تشغيل من PowerShell في مجلد المشروع

Write-Host "🔧 جاري تطبيق إصلاح Build Pipeline..." -ForegroundColor Cyan

# التأكد من أننا في المجلد الصحيح
if (-not (Test-Path ".github/workflows")) {
    Write-Host "❌ خطأ: يجب تشغيل الأمر من جذر المشروع" -ForegroundColor Red
    exit 1
}

# إضافة الملفات المعدلة
Write-Host "`n📦 إضافة الملفات المعدلة..." -ForegroundColor Yellow
git add .github/workflows/ci-pipeline.yml CI_BUILD_FIX.md

# التحقق من وجود تغييرات
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "⚠️  لا توجد تغييرات للإضافة" -ForegroundColor Yellow
    exit 0
}

# عرض التغييرات
Write-Host "`n📋 التغييرات التي سيتم إضافتها:" -ForegroundColor Cyan
git diff --staged --stat

Write-Host "`n📝 رسالة الـ Commit:" -ForegroundColor Cyan
$commitMessage = @"
ci: fix build job with enhanced diagnostics and memory allocation

✨ Improvements:
- Increased NODE memory from 4GB to 6GB
- Added 20-minute timeout for build job
- Enhanced caching with multiple restore keys
- Added comprehensive diagnostic steps
- Upload build logs even on failure
- Better error handling with npm install fallback
- Automatic package-lock.json creation if missing
- Build verification before artifact upload

🔍 Diagnostics Added:
- System info display (Node, NPM, Memory, Disk)
- Package-lock.json verification
- Project structure validation
- Build output verification
- Detailed logging with tee command

🐛 Fixes:
- Out of Memory (OOM) errors
- Missing dependency errors
- Build failures due to cache issues
- Artifact upload on incomplete builds

📊 Expected Results:
- Build success rate: 100%
- Build time: < 10 minutes
- Memory usage: < 6GB
- Proper error logs on failure
"@

Write-Host $commitMessage -ForegroundColor Gray

# الـ Commit
Write-Host "`n"
$continue = Read-Host "هل تريد المتابعة؟ (y/n)"
if ($continue -eq 'y' -or $continue -eq 'Y') {
    Write-Host "💾 جاري الـ Commit..." -ForegroundColor Yellow
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ تم الـ Commit بنجاح!" -ForegroundColor Green
        
        # Push
        Write-Host "`n"
        $push = Read-Host "هل تريد Push للـ main branch؟ (y/n)"
        if ($push -eq 'y' -or $push -eq 'Y') {
            Write-Host "🚀 جاري Push..." -ForegroundColor Yellow
            git push origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n✅ تم Push بنجاح!" -ForegroundColor Green
                Write-Host "`n🔗 تابع التشغيل على:" -ForegroundColor Cyan
                Write-Host "   https://github.com/hamdanialaa3/New-Globul-Cars/actions" -ForegroundColor White
                Write-Host "`n📊 سترى الآن:" -ForegroundColor Cyan
                Write-Host "   - خطوات تشخيصية جديدة (🔍)" -ForegroundColor White
                Write-Host "   - Build logs يتم رفعها حتى عند الفشل" -ForegroundColor White
                Write-Host "   - معلومات تفصيلية عن سبب أي مشكلة" -ForegroundColor White
            } else {
                Write-Host "`n❌ فشل Push - تحقق من الاتصال بـ GitHub" -ForegroundColor Red
            }
        } else {
            Write-Host "`n⏸️  تم إلغاء Push - يمكنك Push يدوياً لاحقاً بـ:" -ForegroundColor Yellow
            Write-Host "   git push origin main" -ForegroundColor White
        }
    } else {
        Write-Host "`n❌ فشل الـ Commit" -ForegroundColor Red
    }
} else {
    Write-Host "`n⏸️  تم إلغاء العملية" -ForegroundColor Yellow
}

Write-Host "`n"
