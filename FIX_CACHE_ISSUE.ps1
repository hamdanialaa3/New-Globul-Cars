# ========================================
# حل نهائي لمشكلة عدم تحديث الألوان
# Complete Solution for Cache Issues
# ========================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  حل شامل لمشكلة الكاش                      ║" -ForegroundColor Cyan
Write-Host "║          Complete Cache & Service Worker Fix              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# المسار إلى مجلد المشروع
$projectRoot = $PSScriptRoot
$appFolder = Join-Path $projectRoot "bulgarian-car-marketplace"

# ========================================
# الخطوة 1: إيقاف العمليات الجارية
# ========================================
Write-Host "⏹️  STEP 1: إيقاف خوادم التطوير..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "   ❌ إيقاف: $($_.Name) (PID: $($_.Id))" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ✓ لا توجد عمليات نشطة" -ForegroundColor Green
}
Write-Host ""

# ========================================
# الخطوة 2: حذف ملفات الكاش
# ========================================
Write-Host "🗑️  STEP 2: حذف ملفات الكاش والبناء..." -ForegroundColor Yellow

$foldersToDelete = @(
    "node_modules\.cache",
    ".cache",
    "build",
    ".webpack-cache",
    "public\static\js",
    "public\static\css",
    "public\service-worker.js",
    "public\asset-manifest.json"
)

Set-Location $appFolder

foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        Write-Host "   ❌ حذف: $folder" -ForegroundColor Red
        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "   ○ غير موجود: $folder" -ForegroundColor Gray
    }
}
Write-Host ""

# ========================================
# الخطوة 3: تعطيل Service Worker مؤقتاً
# ========================================
Write-Host "🔧 STEP 3: تعطيل Service Worker..." -ForegroundColor Yellow

$indexPath = Join-Path $appFolder "src\index.tsx"
$indexContent = Get-Content $indexPath -Raw

if ($indexContent -match "registerServiceWorker\(\{") {
    # إنشاء نسخة احتياطية
    $backupPath = Join-Path $appFolder "src\index.tsx.backup"
    Copy-Item $indexPath $backupPath -Force
    Write-Host "   ✓ تم إنشاء نسخة احتياطية: index.tsx.backup" -ForegroundColor Green
    
    # تعليق تسجيل Service Worker
    $newContent = $indexContent -replace "registerServiceWorker\(\{", "// TEMPORARILY DISABLED - registerServiceWorker({"
    Set-Content -Path $indexPath -Value $newContent -NoNewline
    Write-Host "   ✓ تم تعطيل Service Worker مؤقتاً" -ForegroundColor Green
} else {
    Write-Host "   ✓ Service Worker معطّل بالفعل" -ForegroundColor Green
}
Write-Host ""

# ========================================
# الخطوة 4: إنشاء ملف إلغاء تسجيل Service Worker
# ========================================
Write-Host "📝 STEP 4: إنشاء ملف إلغاء التسجيل..." -ForegroundColor Yellow

$unregisterScript = @'
<!DOCTYPE html>
<html>
<head>
    <title>Unregister Service Worker</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success { color: #22c55e; }
        .error { color: #ef4444; }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        }
        button:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🧹 إلغاء تسجيل Service Worker</h1>
        <div id="status">جاري التحقق...</div>
        <button onclick="location.href='http://localhost:3000'">الانتقال إلى التطبيق</button>
    </div>
    
    <script>
        async function unregisterServiceWorkers() {
            const status = document.getElementById('status');
            
            if ('serviceWorker' in navigator) {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    
                    if (registrations.length === 0) {
                        status.innerHTML = '<p class="success">✓ لا توجد Service Workers مسجلة</p>';
                        return;
                    }
                    
                    status.innerHTML = '<p>🔄 جاري إلغاء التسجيل...</p>';
                    
                    for (let registration of registrations) {
                        await registration.unregister();
                    }
                    
                    // مسح الكاش
                    if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        await Promise.all(
                            cacheNames.map(name => caches.delete(name))
                        );
                    }
                    
                    status.innerHTML = `
                        <p class="success">✓ تم إلغاء تسجيل ${registrations.length} Service Worker(s)</p>
                        <p class="success">✓ تم مسح الكاش</p>
                        <p><strong>الرجاء:</strong></p>
                        <ol>
                            <li>إغلاق جميع نوافذ المتصفح</li>
                            <li>إعادة فتح المتصفح</li>
                            <li>الضغط على Ctrl+Shift+R في الصفحة</li>
                        </ol>
                    `;
                } catch (error) {
                    status.innerHTML = `<p class="error">❌ خطأ: ${error.message}</p>`;
                }
            } else {
                status.innerHTML = '<p class="error">❌ المتصفح لا يدعم Service Workers</p>';
            }
        }
        
        // تشغيل عند تحميل الصفحة
        unregisterServiceWorkers();
    </script>
</body>
</html>
'@

$unregisterPath = Join-Path $appFolder "public\unregister-sw.html"
Set-Content -Path $unregisterPath -Value $unregisterScript -Encoding UTF8
Write-Host "   ✓ تم إنشاء: public\unregister-sw.html" -ForegroundColor Green
Write-Host ""

# ========================================
# الخطوة 5: التعليمات النهائية
# ========================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ تم التنظيف بنجاح!                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 الخطوات التالية (مهمة جداً!):" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1️⃣  شغّل خادم التطوير:" -ForegroundColor White
Write-Host "      cd bulgarian-car-marketplace" -ForegroundColor Gray
Write-Host "      npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "   2️⃣  افتح في المتصفح:" -ForegroundColor White
Write-Host "      http://localhost:3000/unregister-sw.html" -ForegroundColor Yellow
Write-Host "      (سيقوم بإلغاء تسجيل Service Worker)" -ForegroundColor Gray
Write-Host ""
Write-Host "   3️⃣  بعد ذلك:" -ForegroundColor White
Write-Host "      - أغلق المتصفح بالكامل" -ForegroundColor Gray
Write-Host "      - افتح المتصفح من جديد" -ForegroundColor Gray
Write-Host "      - اذهب إلى:" -ForegroundColor Gray
Write-Host "        http://localhost:3000/car/1yzZjuCay3kAdNJUPkzy" -ForegroundColor Yellow
Write-Host "      - اضغط Ctrl+Shift+R (Hard Refresh)" -ForegroundColor Gray
Write-Host ""
Write-Host "   4️⃣  أو استخدم وضع Incognito:" -ForegroundColor White
Write-Host "      Ctrl+Shift+N (Chrome)" -ForegroundColor Gray
Write-Host "      Ctrl+Shift+P (Firefox)" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# سؤال: هل تريد بدء الخادم؟
$response = Read-Host "هل تريد بدء خادم التطوير الآن؟ (Y/n)"
if ($response -eq '' -or $response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "🚀 بدء خادم التطوير..." -ForegroundColor Cyan
    Write-Host ""
    Set-Location $appFolder
    npm start
} else {
    Write-Host ""
    Write-Host "💡 متى ترغب في البدء، شغّل:" -ForegroundColor Yellow
    Write-Host "   cd bulgarian-car-marketplace && npm start" -ForegroundColor Gray
    Write-Host ""
}
