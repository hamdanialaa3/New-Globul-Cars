# ============================================
# Firebase Indexes Creation Script
# ============================================
# هذا السكريبت يفتح جميع روابط Firebase Console لإنشاء الـ indexes
# اضغط "Create Index" في كل صفحة

Write-Host "🔥 Firebase Indexes Creation Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "سيتم فتح 6 صفحات في المتصفح..." -ForegroundColor Yellow
Write-Host "اضغط 'Create Index' في كل صفحة" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ انتظر 2-3 ثوانٍ بين كل صفحة..." -ForegroundColor Gray
Write-Host ""

# Array of all index creation URLs
$indexes = @(
    @{
        Name = "1. Achievements Index (userId + unlockedAt)"
        URL  = "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClRwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FjaGlldmVtZW50cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoOCgp1bmxvY2tlZEF0EAIaDAoIX19uYW1lX18QAg"
    },
    @{
        Name = "2. Passenger Cars Index (isActive + createdAt)"
        URL  = "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClZwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Bhc3Nlbmdlcl9jYXJzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"
    },
    @{
        Name = "3. SUVs Index (isActive + createdAt)"
        URL  = "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1dnMvaW5kZXhlcy9fEAEaDAoIaXNBY3RpdmUQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC"
    },
    @{
        Name = "4. Motorcycles Index (isActive + createdAt)"
        URL  = "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClNwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL21vdG9yY3ljbGVzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"
    },
    @{
        Name = "5. Buses Index (isActive + createdAt)"
        URL  = "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2J1c2VzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"
    },
    @{
        Name = "6. Trucks Index (isActive + createdAt)"
        URL  = "https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RydWNrcy9pbmRleGVzL18QARoMCghpc0FjdGl2ZRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI"
    }
)

# Open each URL with delay
$counter = 1
foreach ($index in $indexes) {
    Write-Host "[$counter/6] فتح: $($index.Name)" -ForegroundColor Cyan
    Start-Process $index.URL
    
    if ($counter -lt 6) {
        Write-Host "    ⏳ انتظار 2 ثانية..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
    
    $counter++
}

Write-Host ""
Write-Host "✅ تم فتح جميع الصفحات!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 التعليمات:" -ForegroundColor Yellow
Write-Host "1. انتقل لكل صفحة في المتصفح" -ForegroundColor White
Write-Host "2. اضغط على زر 'Create Index' الأزرق" -ForegroundColor White
Write-Host "3. انتظر رسالة 'Index created successfully'" -ForegroundColor White
Write-Host "4. انتقل للصفحة التالية" -ForegroundColor White
Write-Host ""
Write-Host "⏱️ الوقت المتوقع: 2-5 دقائق لبناء جميع الـ indexes" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 نصيحة: يمكنك إغلاق الصفحات بعد الضغط على 'Create Index'" -ForegroundColor Cyan
Write-Host "    Firebase سيبني الـ indexes في الخلفية" -ForegroundColor Cyan
Write-Host ""

Read-Host "اضغط Enter للإغلاق"
