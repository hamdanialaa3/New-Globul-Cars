# 🚀 سكريبت النشر السريع - New Globul Cars
# Quick Deploy Script
# الاستخدام: .\deploy.ps1 [target]
# Targets: all, hosting, functions, rules

param(
    [Parameter(Position=0)]
    [ValidateSet('all', 'hosting', 'functions', 'rules', 'help')]
    [string]$Target = 'help'
)

# الألوان للطباعة
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Help {
    Write-ColorOutput Cyan "`n🚀 New Globul Cars - سكريبت النشر`n"
    Write-Output "الاستخدام:"
    Write-Output "  .\deploy.ps1 all        - نشر كامل (hosting + functions + rules)"
    Write-Output "  .\deploy.ps1 hosting    - نشر Frontend فقط"
    Write-Output "  .\deploy.ps1 functions  - نشر Cloud Functions فقط"
    Write-Output "  .\deploy.ps1 rules      - نشر Firestore/Storage Rules فقط"
    Write-Output "  .\deploy.ps1 help       - عرض هذه المساعدة`n"
    
    Write-ColorOutput Yellow "📋 قبل النشر:"
    Write-Output "  1. تأكد من ضبط firebase functions:config"
    Write-Output "  2. اختبر محلياً عبر emulators"
    Write-Output "  3. راجع DEPLOYMENT_GUIDE_FINAL.md`n"
}

function Test-Prerequisites {
    Write-ColorOutput Cyan "🔍 التحقق من المتطلبات...`n"
    
    # التحقق من Firebase CLI
    try {
        $firebaseVersion = firebase --version
        Write-ColorOutput Green "✅ Firebase CLI: $firebaseVersion"
    } catch {
        Write-ColorOutput Red "❌ Firebase CLI غير مثبت"
        Write-Output "تثبيت: npm install -g firebase-tools"
        exit 1
    }
    
    # التحقق من تسجيل الدخول
    try {
        firebase projects:list | Out-Null
        Write-ColorOutput Green "✅ تم تسجيل الدخول إلى Firebase"
    } catch {
        Write-ColorOutput Red "❌ غير مسجل الدخول"
        Write-Output "تنفيذ: firebase login"
        exit 1
    }
    
    # التحقق من المشروع
    $currentProject = firebase use
    if ($currentProject -like "*fire-new-globul*") {
        Write-ColorOutput Green "✅ المشروع: fire-new-globul`n"
    } else {
        Write-ColorOutput Yellow "⚠️  المشروع الحالي: $currentProject"
        Write-Output "للتبديل: firebase use fire-new-globul`n"
    }
}

function Build-Frontend {
    Write-ColorOutput Cyan "`n📦 بناء Frontend...`n"
    
    Push-Location "bulgarian-car-marketplace"
    
    # التحقق من node_modules
    if (-not (Test-Path "node_modules")) {
        Write-ColorOutput Yellow "⚠️  node_modules غير موجود، جارِ التثبيت..."
        npm install
    }
    
    # بناء الإنتاج
    Write-Output "بناء الإنتاج..."
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "`n✅ تم بناء Frontend بنجاح"
        
        # عرض حجم Build
        $buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Output ("حجم البناء: {0:N2} MB" -f $buildSize)
    } else {
        Write-ColorOutput Red "`n❌ فشل بناء Frontend"
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

function Deploy-Hosting {
    Write-ColorOutput Cyan "`n🌐 نشر Hosting...`n"
    
    Build-Frontend
    
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "`n✅ تم نشر Hosting بنجاح"
        Write-Output "الرابط: https://fire-new-globul.web.app"
    } else {
        Write-ColorOutput Red "`n❌ فشل نشر Hosting"
        exit 1
    }
}

function Deploy-Functions {
    Write-ColorOutput Cyan "`n⚙️ نشر Cloud Functions...`n"
    
    # التحقق من Config
    Write-Output "التحقق من Firebase Functions Config..."
    $config = firebase functions:config:get | ConvertFrom-Json
    
    if ($config.email -and $config.gemini) {
        Write-ColorOutput Green "✅ Config موجود (email, gemini)"
    } else {
        Write-ColorOutput Yellow "⚠️  Config غير مكتمل - راجع DEPLOYMENT_GUIDE_FINAL.md"
        $continue = Read-Host "هل تريد المتابعة رغم ذلك؟ (y/n)"
        if ($continue -ne 'y') {
            exit 0
        }
    }
    
    # النشر
    firebase deploy --only functions
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "`n✅ تم نشر Functions بنجاح"
        Write-Output "عرض السجلات: firebase functions:log"
    } else {
        Write-ColorOutput Red "`n❌ فشل نشر Functions"
        exit 1
    }
}

function Deploy-Rules {
    Write-ColorOutput Cyan "`n🔒 نشر Security Rules...`n"
    
    # التحقق من وجود الملفات
    if (-not (Test-Path "firestore.rules")) {
        Write-ColorOutput Red "❌ firestore.rules غير موجود"
        exit 1
    }
    
    if (-not (Test-Path "storage.rules")) {
        Write-ColorOutput Red "❌ storage.rules غير موجود"
        exit 1
    }
    
    # النشر
    firebase deploy --only firestore:rules,storage:rules
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "`n✅ تم نشر Rules بنجاح"
    } else {
        Write-ColorOutput Red "`n❌ فشل نشر Rules"
        exit 1
    }
}

function Deploy-All {
    Write-ColorOutput Cyan "`n🚀 النشر الكامل...`n"
    
    # بناء Frontend
    Build-Frontend
    
    # نشر كل شيء
    firebase deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "`n✅ تم النشر الكامل بنجاح!`n"
        Write-ColorOutput Cyan "📊 الخطوات التالية:"
        Write-Output "  1. افتح: https://fire-new-globul.web.app"
        Write-Output "  2. تحقق من Functions Logs"
        Write-Output "  3. اختبر ميزات AI (إضافة سيارة، رفع صورة)"
        Write-Output "  4. راقب Firebase Console للأخطاء`n"
    } else {
        Write-ColorOutput Red "`n❌ فشل النشر"
        exit 1
    }
}

# التنفيذ الرئيسي
Clear-Host

switch ($Target) {
    'help' {
        Show-Help
    }
    'all' {
        Test-Prerequisites
        Deploy-All
    }
    'hosting' {
        Test-Prerequisites
        Deploy-Hosting
    }
    'functions' {
        Test-Prerequisites
        Deploy-Functions
    }
    'rules' {
        Test-Prerequisites
        Deploy-Rules
    }
}

Write-ColorOutput Cyan "`n🎉 انتهى!`n"
