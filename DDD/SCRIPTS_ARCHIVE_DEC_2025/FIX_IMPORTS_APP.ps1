# Fix Imports in App.tsx - إصلاح الـ imports في App.tsx
$appFile = "packages/app/src/App.tsx"

if (-not (Test-Path $appFile)) {
    Write-Host "App.tsx not found!" -ForegroundColor Red
    exit 1
}

$content = Get-Content $appFile -Raw -Encoding UTF8

# Fix broken imports from previous script
$content = $content -replace "from ['\`"]@globul-cars/core/contextsLanguageContext['\`"]", "from '@globul-cars/core/contexts/LanguageContext'"
$content = $content -replace "from ['\`"]@globul-cars/core/contextsAuthProvider['\`"]", "from '@globul-cars/core/contexts/AuthProvider'"
$content = $content -replace "from ['\`"]@globul-cars/core/contextsProfileTypeContext['\`"]", "from '@globul-cars/core/contexts/ProfileTypeContext'"
$content = $content -replace "from ['\`"]@globul-cars/core/contextsThemeContext['\`"]", "from '@globul-cars/core/contexts/ThemeContext'"
$content = $content -replace "from ['\`"]@globul-cars/core/contextsFilterContext['\`"]", "from '@globul-cars/core/contexts/FilterContext'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsToast['\`"]", "from '@globul-cars/ui/components/Toast'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsErrorBoundary['\`"]", "from '@globul-cars/ui/components/ErrorBoundary'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsAccessibility['\`"]", "from '@globul-cars/ui/components/Accessibility'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsHeader/Header['\`"]", "from '@globul-cars/ui/components/Header/Header'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsHeader/MobileHeader['\`"]", "from '@globul-cars/ui/components/Header/MobileHeader'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentslayout['\`"]", "from '@globul-cars/ui/components/layout'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsFooter/Footer['\`"]", "from '@globul-cars/ui/components/Footer/Footer'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsProtectedRoute['\`"]", "from '@globul-cars/ui/components/ProtectedRoute'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsAdminRoute['\`"]", "from '@globul-cars/ui/components/AdminRoute'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsAuthGuard['\`"]", "from '@globul-cars/ui/components/AuthGuard'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsNotificationHandler['\`"]", "from '@globul-cars/ui/components/NotificationHandler'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsNotFoundPage['\`"]", "from '@globul-cars/ui/components/NotFoundPage'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsFacebookPixel['\`"]", "from '@globul-cars/ui/components/FacebookPixel'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsFloatingAddButton['\`"]", "from '@globul-cars/ui/components/FloatingAddButton'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsAI/AssistantHead['\`"]", "from '@globul-cars/ui/components/AI/AssistantHead'"
$content = $content -replace "from ['\`"]@globul-cars/coreuseBreakpoint['\`"]", "from '@globul-cars/core'"
$content = $content -replace "from ['\`"]@globul-cars/ui/componentsProgressBar['\`"]", "from '@globul-cars/ui/components/ProgressBar'"

Set-Content -Path $appFile -Value $content -Encoding UTF8 -NoNewline

Write-Host "Fixed imports in App.tsx" -ForegroundColor Green

