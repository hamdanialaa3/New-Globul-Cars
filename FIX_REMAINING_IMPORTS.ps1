# Fix ALL remaining @/ imports including import { ... } from '@/...'
# This catches type imports and jest mocks that the first script missed

Write-Host "🔧 Fixing ALL remaining @/ imports (pass 2)..." -ForegroundColor Cyan

$fixes = @(
    # FilterContext
    @{File="bulgarian-car-marketplace\src\contexts\FilterContext.tsx"; Find="from '@/pages/05_search-browse/advanced-search/AdvancedSearchPage/types'"; Replace="from '../pages/05_search-browse/advanced-search/AdvancedSearchPage/types'"},
    
    # Profile components
    @{File="bulgarian-car-marketplace\src\components\CompanyProfile.tsx"; Find="from '@/pages/03_user-pages/profile/ProfilePage/types'"; Replace="from '../pages/03_user-pages/profile/ProfilePage/types'"},
    @{File="bulgarian-car-marketplace\src\components\DealerProfile.tsx"; Find="from '@/pages/03_user-pages/profile/ProfilePage/types'"; Replace="from '../pages/03_user-pages/profile/ProfilePage/types'"},
    @{File="bulgarian-car-marketplace\src\components\PrivateProfile.tsx"; Find="from '@/pages/03_user-pages/profile/ProfilePage/types'"; Replace="from '../pages/03_user-pages/profile/ProfilePage/types'"},
    
    # Profile modals
    @{File="bulgarian-car-marketplace\src\components\Profile\Modals\PhotoEditModal.tsx"; Find="from '@/pages/03_user-pages/profile/ProfilePage/hooks/useProfile'"; Replace="from '../../../pages/03_user-pages/profile/ProfilePage/hooks/useProfile'"},
    @{File="bulgarian-car-marketplace\src\components\Profile\Modals\NameEditModal.tsx"; Find="from '@/pages/03_user-pages/profile/ProfilePage/hooks/useProfile'"; Replace="from '../../../pages/03_user-pages/profile/ProfilePage/hooks/useProfile'"},
    @{File="bulgarian-car-marketplace\src\components\Profile\Modals\LocationEditModal.tsx"; Find="from '@/pages/03_user-pages/profile/ProfilePage/hooks/useProfile'"; Replace="from '../../../pages/03_user-pages/profile/ProfilePage/hooks/useProfile'"},
    
    # CarDetails
    @{File="bulgarian-car-marketplace\src\components\CarDetails.tsx"; Find="from '@/pages/01_main-pages/home/HomePage/RecentBrowsingSection'"; Replace="from '../pages/01_main-pages/home/HomePage/RecentBrowsingSection'"},
    
    # BusinessPromoBanner
    @{File="bulgarian-car-marketplace\src\components\BusinessPromoBanner.tsx"; Find="from '@/assets/icons/business-card.svg'"; Replace="from '../assets/icons/business-card.svg'"},
    
    # Utils
    @{File="bulgarian-car-marketplace\src\utils\listing-limits.ts"; Find="from '@/features/billing/types'"; Replace="from '../features/billing/types'"},
    
    # Search services
    @{File="bulgarian-car-marketplace\src\services\search\queryOrchestrator.ts"; Find="from '@/pages/05_search-browse/advanced-search/AdvancedSearchPage/types'"; Replace="from '../../pages/05_search-browse/advanced-search/AdvancedSearchPage/types'"},
    @{File="bulgarian-car-marketplace\src\services\search\UnifiedSearchService.ts"; Find="from '@/pages/05_search-browse/advanced-search/AdvancedSearchPage/types'"; Replace="from '../../pages/05_search-browse/advanced-search/AdvancedSearchPage/types'"},
    @{File="bulgarian-car-marketplace\src\services\search\firestoreQueryBuilder.ts"; Find="from '@/pages/05_search-browse/advanced-search/AdvancedSearchPage/types'"; Replace="from '../../pages/05_search-browse/advanced-search/AdvancedSearchPage/types'"}
)

$successCount = 0

foreach ($fix in $fixes) {
    $path = Join-Path $PWD $fix.File
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -ErrorAction SilentlyContinue
        if ($content -and $content.Contains($fix.Find)) {
            $content = $content.Replace($fix.Find, $fix.Replace)
            Set-Content -Path $path -Value $content -NoNewline
            Write-Host "  ✅ $($fix.File)" -ForegroundColor Green
            $successCount++
        }
    }
}

Write-Host ""
Write-Host "✨ Fixed $successCount files!" -ForegroundColor Green
