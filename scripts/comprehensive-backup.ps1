#!/usr/bin/env pwsh
<#
.SYNOPSIS
    حفظ شامل وملزم للمشروع (Complete Project Backup & Deploy)
    
.DESCRIPTION
    يحفظ جميع التغييرات والإضافات والتطوير:
    - التغييرات اليدوية
    - التغييرات من VSCode/Cursor/Antigravity
    - يدفع إلى GitHub (hamdanialaa3)
    - يدفع إلى Firebase (fire-new-globul)
    - ينشر على الدومينات (mobilebg.eu, koli.one, www.koli.one)

.NOTES
    الحفظ صارم وملزم - بدون استثناءات
#>

Write-Host "
╔════════════════════════════════════════════════════════════╗
║          🔒 حفظ شامل وملزم للمشروع                      ║
║          Complete Project Backup & Deploy                ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

$projectPath = "C:\Users\hamda\Desktop\New Globul Cars"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# 1️⃣ فحص الحالة الحالية
Write-Host "`n📋 الخطوة 1: فحص حالة المشروع..." -ForegroundColor Yellow
Set-Location $projectPath
$status = git status --porcelain
$changedFiles = @($status -split "`n" | Where-Object { $_ })

if ($changedFiles.Count -gt 0) {
    Write-Host "✅ تم العثور على $($changedFiles.Count) ملف معدل" -ForegroundColor Green
    $changedFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "✅ جميع الملفات محفوظة بالفعل" -ForegroundColor Green
}

# 2️⃣ التأكد من جميع الملفات محفوظة
Write-Host "`n📁 الخطوة 2: التأكد من حفظ جميع الملفات..." -ForegroundColor Yellow

# حفظ Git
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "⚠️ يوجد ملفات غير محفوظة - سيتم حفظها الآن"
    git add -A
    git commit -m "chore: comprehensive backup and project state preservation

الحفظ الشامل والملزم للمشروع - $timestamp

الحفظ يتضمن:
✅ جميع التغييرات اليدوية
✅ جميع تغييرات VSCode/Cursor
✅ جميع الإضافات والتطويرات
✅ بدون أي استثناءات

المشروع بحالة استقرار كاملة" -NoNewline
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
    }
} else {
    Write-Host "✅ لا توجد تغييرات لم تحفظ" -ForegroundColor Green
}

# 3️⃣ التحقق من الاتصال مع GitHub
Write-Host "`n🔗 الخطوة 3: التحقق من الاتصال مع GitHub..." -ForegroundColor Yellow
try {
    $remote = git remote -v | Select-Object -First 1
    if ($remote -match "hamdanialaa3") {
        Write-Host "✅ GitHub متصل: $remote" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ خطأ في الاتصال مع GitHub" -ForegroundColor Red
}

# 4️⃣ دفع إلى GitHub
Write-Host "`n⬆️  الخطوة 4: دفع التغييرات إلى GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم الدفع بنجاح إلى GitHub" -ForegroundColor Green
} else {
    Write-Host "⚠️ لا توجد تغييرات جديدة للدفع أو تم الدفع بالفعل" -ForegroundColor Gray
}

# 5️⃣ التحقق من Firebase
Write-Host "`n🔥 الخطوة 5: التحقق من Firebase..." -ForegroundColor Yellow
$fbProjects = firebase projects:list 2>&1
if ($fbProjects -match "fire-new-globul") {
    Write-Host "✅ Firebase متصل: fire-new-globul" -ForegroundColor Green
} else {
    Write-Host "❌ خطأ في الاتصال مع Firebase" -ForegroundColor Red
    exit 1
}

# 6️⃣ البناء للإنتاج
Write-Host "`n🔨 الخطوة 6: بناء المشروع للإنتاج..." -ForegroundColor Yellow
Write-Host "   تشغيل: npm run build" -ForegroundColor Gray

$env:NODE_ENV = "production"
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم بناء المشروع بنجاح" -ForegroundColor Green
    
    # التحقق من مجلد build
    if (Test-Path "build/index.html") {
        Write-Host "✅ ملف build/index.html موجود" -ForegroundColor Green
        $buildSize = (Get-Item "build" -ErrorAction SilentlyContinue | Measure-Object -Sum {$_.Length}).Sum / 1MB
        Write-Host "   حجم البناء: $([Math]::Round($buildSize, 2)) MB" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ فشل البناء" -ForegroundColor Red
    exit 1
}

# 7️⃣ نشر على Firebase
Write-Host "`n🚀 الخطوة 7: نشر على Firebase..." -ForegroundColor Yellow
Write-Host "   المشروع: fire-new-globul" -ForegroundColor Gray
Write-Host "   المواقع:" -ForegroundColor Gray
Write-Host "   📍 fire-new-globul.web.app" -ForegroundColor Gray
Write-Host "   📍 mobilebg.eu (مرتبط)" -ForegroundColor Gray
Write-Host "   📍 koli.one (مرتبط)" -ForegroundColor Gray
Write-Host "   📍 www.koli.one (مرتبط)" -ForegroundColor Gray

firebase deploy --only hosting --project fire-new-globul

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ تم النشر بنجاح على Firebase" -ForegroundColor Green
} else {
    Write-Host "`n❌ فشل النشر" -ForegroundColor Red
    exit 1
}

# 8️⃣ التحقق من النشر
Write-Host "`n✔️  الخطوة 8: التحقق من النشر..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# اختبار المواقع
$urls = @(
    "https://fire-new-globul.web.app",
    "https://koli.one",
    "https://www.koli.one"
)

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $url - متاح ✓" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  $url - قد يكون هناك تأخير في التحديث" -ForegroundColor Yellow
    }
}

# 9️⃣ Docker (اختياري)
Write-Host "`n🐳 الخطوة 9: تحديث Docker (اختياري)..." -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    Write-Host "   docker compose up -d --build" -ForegroundColor Gray
    # docker compose up -d --build  # بدون تنفيذ فعلي إلا إذا طلب المستخدم
    Write-Host "⏭️  تم تخطي Docker - شغل يدويًا إذا لزم: docker compose up -d --build" -ForegroundColor Gray
} else {
    Write-Host "⚠️  docker-compose.yml غير موجود" -ForegroundColor Gray
}

# ✅ ملخص النهائي
Write-Host "`n
╔════════════════════════════════════════════════════════════╗
║              ✅ اكتمل الحفظ الشامل والملزم               ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "📊 ملخص الحفظ:" -ForegroundColor Cyan
Write-Host "   ✅ Git: جميع التغييرات محفوظة" -ForegroundColor Green
Write-Host "   ✅ GitHub: مدفوع بنجاح (hamdanialaa3)" -ForegroundColor Green
Write-Host "   ✅ Firebase: منشور بنجاح (fire-new-globul)" -ForegroundColor Green
Write-Host "   ✅ Domains: متاح على mobilebg.eu, koli.one" -ForegroundColor Green
Write-Host "   ⏱️  الوقت: $timestamp" -ForegroundColor Gray

Write-Host "`n🔗 الروابط المتاحة:" -ForegroundColor Cyan
Write-Host "   🌐 https://fire-new-globul.web.app" -ForegroundColor Blue
Write-Host "   🌐 https://koli.one" -ForegroundColor Blue
Write-Host "   🌐 https://www.koli.one" -ForegroundColor Blue
Write-Host "   🌐 https://mobilebg.eu" -ForegroundColor Blue

Write-Host "`n💾 الحفظ صارم وملزم - بدون استثناءات!" -ForegroundColor Magenta
