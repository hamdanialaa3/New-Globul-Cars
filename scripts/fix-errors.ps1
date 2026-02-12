# Script to fix TypeScript errors in bulk

$srcPath = "c:\Users\hamda\Desktop\New Globul Cars\src"
$filesWithUnknownError = @(
    "components/admin/IntegrationStatusDashboard.tsx",
    "components/AdvancedCharts.tsx",
    "components/AnalyticsTracker.tsx",
    "components/BulgariaLocationDropdown/BulgariaLocationDropdown.tsx",
    "components/CarValuation.tsx",
    "components/CompleteLogoCollection.tsx",
    "components/Consultations/RequestConsultationModal.tsx",
    "components/DigitalTwinDashboard.tsx",
    "components/DistanceIndicator/index.tsx",
    "components/FeaturedCars.tsx"
)

$fixedCount = 0
$filesFixed = @()

foreach ($file in $filesWithUnknownError) {
    $filePath = Join-Path $srcPath $file
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️ File not found: $filePath"
        continue
    }
    
    $content = Get-Content $filePath -Raw
    
    # Check if normalizeError is already imported
    if ($content -match 'import.*normalizeError') {
        Write-Host "✅ Already fixed: $file"
        continue
    }
    
    # Add import statement at the top after other imports
    if ($content -match "^import\s") {
        $lines = $content -split "`n"
        $lastImportIndex = -1
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "^import ") {
                $lastImportIndex = $i
            }
        }
        
        if ($lastImportIndex -ge 0) {
            $lines[$lastImportIndex] = $lines[$lastImportIndex] + "`nimport { normalizeError } from '@/utils/error-helpers';"
            $content = $lines -join "`n"
        }
    }
    
    # Replace catch (error) with normalizeError
    $content = $content -replace 
        "catch\s*\(\s*error\s*\)\s*{([\s\S]*?)logger\.(error|warn)\(([^)]*),\s*error\s*\)",
        "catch (error) {`$1logger.`$2(`$3, normalizeError(error))"
    
    # Save the file
    Set-Content -Path $filePath -Value $content -NoNewline
    $filesFixed += $file
    $fixedCount++
    
    Write-Host "✅ Fixed: $file"
}

Write-Host "`n📊 Summary:"
Write-Host "✅ Files fixed: $fixedCount"
Write-Host "📝 Files: $($filesFixed -join ', ')"
