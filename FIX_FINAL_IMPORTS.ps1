# Fix Final Remaining @/ Imports
$ErrorActionPreference = "Continue"
$projectRoot = Get-Location

Write-Host "Fixing final @/ imports..." -ForegroundColor Cyan

# Fix specific files
$fixes = @{
    "packages\ui\src\components\BusinessPromoBanner.tsx" = @{
        "@/assets/icons/business-card.svg" = "../../../../bulgarian-car-marketplace/src/assets/icons/business-card.svg"
    }
    "packages\core\src\utils\listing-limits.ts" = @{
        "@/features/billing/types" = "@globul-cars/core/types"
    }
    "packages\ui\src\components\Button.tsx" = @{
        "@/styles/design-system" = "@globul-cars/ui/styles/design-system"
    }
    "packages\app\src\pages\09_dealer-company\DealerPublicPage\ContactForm.tsx" = @{
        "@/contexts" = "@globul-cars/core/contexts"
    }
}

foreach ($file in $fixes.Keys) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        
        foreach ($oldImport in $fixes[$file].Keys) {
            $newImport = $fixes[$file][$oldImport]
            $content = $content -replace "from ['\`"]$([regex]::Escape($oldImport))['\`"]", "from '$newImport'"
            $content = $content -replace "import.*from ['\`"]$([regex]::Escape($oldImport))['\`"]", "import from '$newImport'"
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Fixed: $file" -ForegroundColor Green
        }
    }
}

# Fix CircularImageGallery - many @/assets imports
$circularGallery = Join-Path $projectRoot "packages\ui\src\components\CircularImageGallery.tsx"
if (Test-Path $circularGallery) {
    $content = Get-Content $circularGallery -Raw -Encoding UTF8
    $content = $content -replace "from ['\`"]@/assets/", "from '../../../../bulgarian-car-marketplace/src/assets/"
    Set-Content -Path $circularGallery -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Fixed: CircularImageGallery.tsx" -ForegroundColor Green
}

Write-Host "Done!" -ForegroundColor Green

