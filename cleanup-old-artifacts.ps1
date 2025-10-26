# 🗑️ حذف Artifacts القديمة من GitHub Actions
# يحتاج GitHub CLI (gh) مثبت ومسجل دخول

Write-Host "🗑️  بدء تنظيف Artifacts القديمة..." -ForegroundColor Cyan

# التحقق من تثبيت gh CLI
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Host "❌ خطأ: GitHub CLI غير مثبت" -ForegroundColor Red
    Write-Host "📥 حمّله من: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# التحقق من تسجيل الدخول
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ خطأ: لم تسجل دخول في GitHub CLI" -ForegroundColor Red
    Write-Host "🔐 سجل دخول بـ: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub CLI جاهز" -ForegroundColor Green

# معلومات المستودع
$owner = "hamdanialaa3"
$repo = "New-Globul-Cars"

Write-Host "`n📊 جاري جلب قائمة Artifacts..." -ForegroundColor Yellow

# جلب جميع artifacts
$artifacts = gh api "/repos/$owner/$repo/actions/artifacts" --paginate | ConvertFrom-Json

$totalArtifacts = $artifacts.artifacts.Count
Write-Host "📦 إجمالي Artifacts: $totalArtifacts" -ForegroundColor Cyan

if ($totalArtifacts -eq 0) {
    Write-Host "✅ لا توجد artifacts للحذف" -ForegroundColor Green
    exit 0
}

# عرض معلومات Artifacts
Write-Host "`n📋 قائمة Artifacts:" -ForegroundColor Cyan
$totalSize = 0
foreach ($artifact in $artifacts.artifacts) {
    $sizeMB = [math]::Round($artifact.size_in_bytes / 1MB, 2)
    $totalSize += $artifact.size_in_bytes
    $created = ([DateTime]$artifact.created_at).ToString("yyyy-MM-dd HH:mm")
    Write-Host "  - $($artifact.name) | $sizeMB MB | $created" -ForegroundColor Gray
}

$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "`n💾 الحجم الإجمالي: $totalSizeMB MB" -ForegroundColor Yellow

# تأكيد الحذف
Write-Host "`n⚠️  هل تريد حذف جميع الـ Artifacts؟" -ForegroundColor Yellow
Write-Host "   سيتم توفير: $totalSizeMB MB" -ForegroundColor White
$confirm = Read-Host "أدخل 'yes' للمتابعة"

if ($confirm -ne 'yes') {
    Write-Host "`n⏸️  تم إلغاء العملية" -ForegroundColor Yellow
    exit 0
}

# حذف Artifacts
Write-Host "`n🗑️  جاري الحذف..." -ForegroundColor Cyan
$deletedCount = 0
$deletedSize = 0

foreach ($artifact in $artifacts.artifacts) {
    try {
        gh api -X DELETE "/repos/$owner/$repo/actions/artifacts/$($artifact.id)" | Out-Null
        $sizeMB = [math]::Round($artifact.size_in_bytes / 1MB, 2)
        Write-Host "  ✅ حُذف: $($artifact.name) ($sizeMB MB)" -ForegroundColor Green
        $deletedCount++
        $deletedSize += $artifact.size_in_bytes
    }
    catch {
        Write-Host "  ❌ فشل حذف: $($artifact.name)" -ForegroundColor Red
    }
}

$deletedSizeMB = [math]::Round($deletedSize / 1MB, 2)

Write-Host "`n✅ اكتمل التنظيف!" -ForegroundColor Green
Write-Host "📊 الإحصائيات:" -ForegroundColor Cyan
Write-Host "   - Artifacts المحذوفة: $deletedCount من $totalArtifacts" -ForegroundColor White
Write-Host "   - المساحة المحررة: $deletedSizeMB MB" -ForegroundColor White

Write-Host "`n🔍 للتحقق:" -ForegroundColor Yellow
Write-Host "   https://github.com/$owner/$repo/actions" -ForegroundColor White
