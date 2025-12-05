# Fix remaining @/ imports that the first script missed
# These are special cases: React.lazy, require(), and asset imports

Write-Host "🔧 Fixing special @/ imports..." -ForegroundColor Cyan

$fixes = @(
    # HomePage - React.lazy imports
    @{
        File = "bulgarian-car-marketplace\src\pages\01_main-pages\home\HomePage\index.tsx"
        Old = "import('@/components/AI/AIChatbot')"
        New = "import('../../../../components/AI/AIChatbot')"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\01_main-pages\home\HomePage\index.tsx"
        Old = "import('@/components/LazySection')"
        New = "import('../../../../components/LazySection')"
    },
    
    # MapPage - service imports
    @{
        File = "bulgarian-car-marketplace\src\pages\01_main-pages\map\MapPage\index.tsx"
        Old = "from '@/services/map-entities.service'"
        New = "from '../../../../services/map-entities.service'"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\01_main-pages\map\MapPage\index.tsx"
        Old = "from '@/services/google-maps-enhanced.service'"
        New = "from '../../../../services/google/google-maps-enhanced.service'"
    },
    
    # AIDashboardPage - SVG asset imports
    @{
        File = "bulgarian-car-marketplace\src\pages\03_user-pages\ai-dashboard\AIDashboardPage.tsx"
        Old = "from '@/assets/icons/ai/image-analysis-ai.svg'"
        New = "from '../../../../assets/icons/ai/image-analysis-ai.svg'"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\03_user-pages\ai-dashboard\AIDashboardPage.tsx"
        Old = "from '@/assets/icons/ai/price-suggestions-ai.svg'"
        New = "from '../../../../assets/icons/ai/price-suggestions-ai.svg'"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\03_user-pages\ai-dashboard\AIDashboardPage.tsx"
        Old = "from '@/assets/icons/ai/chat-messages-ai.svg'"
        New = "from '../../../../assets/icons/ai/chat-messages-ai.svg'"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\03_user-pages\ai-dashboard\AIDashboardPage.tsx"
        Old = "from '@/assets/icons/ai/profile-analysis-ai.svg'"
        New = "from '../../../../assets/icons/ai/profile-analysis-ai.svg'"
    },
    
    # ProfileMyAds - component import
    @{
        File = "bulgarian-car-marketplace\src\pages\03_user-pages\profile\ProfilePage\ProfileMyAds.tsx"
        Old = "from '@/pages/01_main-pages/home/HomePage/ModernCarCard'"
        New = "from '../../../01_main-pages/home/HomePage/ModernCarCard'"
    },
    
    # Mobile sell pages - design system imports
    @{
        File = "bulgarian-car-marketplace\src\pages\04_car-selling\sell\MobileContactPage.styles.ts"
        Old = "from '@/styles/mobile-design-system'"
        New = "from '../../../styles/mobile-design-system'"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\04_car-selling\sell\MobilePreviewPage.styles.ts"
        Old = "from '@/styles/mobile-design-system'"
        New = "from '../../../styles/mobile-design-system'"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\04_car-selling\sell\MobilePricingPage.styles.ts"
        Old = "from '@/styles/mobile-design-system'"
        New = "from '../../../styles/mobile-design-system'"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\04_car-selling\sell\MobileSellerTypePage.tsx"
        Old = "from '@/styles/mobile-design-system'"
        New = "from '../../../styles/mobile-design-system'"
    },
    @{
        File = "bulgarian-car-marketplace\src\pages\04_car-selling\sell\MobileSubmissionPage.styles.ts"
        Old = "from '@/styles/mobile-design-system'"
        New = "from '../../../styles/mobile-design-system'"
    },
    
    # UnifiedContactPage - n8n service
    @{
        File = "bulgarian-car-marketplace\src\pages\04_car-selling\sell\UnifiedContactPage.tsx"
        Old = "from '@/services/n8n-integration'"
        New = "from '../../../services/n8n/n8n-integration'"
    },
    
    # DealerPublicPage - contexts
    @{
        File = "bulgarian-car-marketplace\src\pages\09_dealer-company\DealerPublicPage\ContactForm.tsx"
        Old = "from '@/contexts'"
        New = "from '../../../contexts'"
    },
    
    # DealerPublicPage - reviews feature
    @{
        File = "bulgarian-car-marketplace\src\pages\09_dealer-company\DealerPublicPage\index.tsx"
        Old = "from '@/features/reviews/ReviewStars'"
        New = "from '../../../features/reviews/ReviewStars'"
    }
)

$successCount = 0
$errorCount = 0

foreach ($fix in $fixes) {
    $filePath = Join-Path $PWD $fix.File
    
    if (Test-Path $filePath) {
        try {
            $content = Get-Content $filePath -Raw -ErrorAction Stop
            
            if ($content -match [regex]::Escape($fix.Old)) {
                $newContent = $content -replace [regex]::Escape($fix.Old), $fix.New
                Set-Content -Path $filePath -Value $newContent -NoNewline -ErrorAction Stop
                Write-Host "  ✅ Fixed: $($fix.File)" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  ⏭️  Skipped (not found): $($fix.File)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ❌ Error: $($fix.File) - $_" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "  ⚠️  File not found: $($fix.File)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "✨ Complete!" -ForegroundColor Green
Write-Host "   Successful fixes: $successCount" -ForegroundColor Yellow
Write-Host "   Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
