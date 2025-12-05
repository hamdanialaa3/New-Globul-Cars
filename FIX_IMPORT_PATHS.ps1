# Fix all @/ import paths in bulgarian-car-marketplace/src
# These imports used to work with webpack alias but we removed it to avoid conflicts

$appDir = "bulgarian-car-marketplace\src"

Write-Host "🔧 Fixing @/ import paths..." -ForegroundColor Cyan

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path $appDir -Recurse -Include *.ts,*.tsx -File

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    $replacements = 0
    
    # Calculate relative path from file to src root for relative imports
    $relativePath = $file.DirectoryName.Replace("$PWD\bulgarian-car-marketplace\src", "")
    $depth = ($relativePath.Split('\') | Where-Object { $_ -ne "" }).Count
    $relativePrefix = if ($depth -eq 0) { "./" } else { ("../" * $depth) }
    
    # Replace common @/ imports with relative or absolute paths
    # Pattern: from '@/...';
    
    # Contexts (local)
    $content = $content -replace "from ['`"]@/contexts/", "from '${relativePrefix}contexts/"
    
    # Hooks (local)
    $content = $content -replace "from ['`"]@/hooks/", "from '${relativePrefix}hooks/"
    
    # Services (local)
    $content = $content -replace "from ['`"]@/services/", "from '${relativePrefix}services/"
    
    # Firebase (local)
    $content = $content -replace "from ['`"]@/firebase", "from '${relativePrefix}firebase"
    
    # Types (local)
    $content = $content -replace "from ['`"]@/types/", "from '${relativePrefix}types/"
    
    # Constants (local)
    $content = $content -replace "from ['`"]@/constants/", "from '${relativePrefix}constants/"
    
    # Config (local)
    $content = $content -replace "from ['`"]@/config/", "from '${relativePrefix}config/"
    
    # Data (local)
    $content = $content -replace "from ['`"]@/data/", "from '${relativePrefix}data/"
    
    # Utils (local)
    $content = $content -replace "from ['`"]@/utils/", "from '${relativePrefix}utils/"
    
    # Components (local)
    $content = $content -replace "from ['`"]@/components/", "from '${relativePrefix}components/"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $replacements = ([regex]::Matches($originalContent, "@/")).Count
        $totalReplacements += $replacements
        $totalFiles++
        Write-Host "  ✅ $($file.Name): $replacements replacements" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✨ Complete!" -ForegroundColor Green
Write-Host "   Files updated: $totalFiles" -ForegroundColor Yellow
Write-Host "   Total replacements: $totalReplacements" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 Restart dev server to see changes" -ForegroundColor Cyan
