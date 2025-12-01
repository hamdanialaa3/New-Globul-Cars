# Professional Translation Split Script
# Splits translations.ts into modular structure (BG + EN only)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Professional Translation Split..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Read original file
$originalFile = "translations.ts"
$content = Get-Content $originalFile -Raw

Write-Host "✅ Loaded translations.ts ($(($content.Length / 1024).ToString('N2')) KB)" -ForegroundColor Green

# Extract BG section (from 'bg: {' to before 'en: {')
$bgMatch = [regex]::Match($content, '(?s)bg:\s*\{(.*?)(?=\s+\},\s+en:)')
if (-not $bgMatch.Success) {
    throw "Failed to extract BG section"
}
$bgContent = $bgMatch.Groups[1].Value

# Extract EN section (from 'en: {' to before 'ar: {' or end of translations object)
$enMatch = [regex]::Match($content, '(?s)en:\s*\{(.*?)(?=\s+\},?\s+(ar:|}\s+as const))')
if (-not $enMatch.Success) {
    throw "Failed to extract EN section"
}
$enContent = $enMatch.Groups[1].Value

Write-Host "✅ Extracted BG and EN sections" -ForegroundColor Green

# Define section boundaries
$sections = @{
    'home' = @{ start = '^\s{4}home:'; end = '^\s{4}\},' }
    'cars' = @{ start = '^\s{4}cars:'; end = '^\s{4}\},' }
    'sell' = @{ start = '^\s{4}sell:'; end = '^\s{4}\},' }
    'nav' = @{ start = '^\s{4}nav:'; end = '^\s{4}\},' }
    'profile' = @{ start = '^\s{4}profile:'; end = '^\s{4}\},' }
    'footer' = @{ start = '^\s{4}footer:'; end = '^\s{4}\},' }
    'messaging' = @{ start = '^\s{4}messaging:'; end = '^\s{4}\},' }
    'dashboard' = @{ start = '^\s{4}dashboard:'; end = '^\s{4}\},' }
    'auth' = @{ start = '^\s{4}auth:'; end = '^\s{4}\},' }
    'common' = @{ start = '^\s{4}common:'; end = '^\s{4}\}' }
}

# Function to extract section
function Extract-Section {
    param($content, $sectionName, $patterns)
    
    $lines = $content -split "`n"
    $inSection = $false
    $sectionLines = @()
    $braceCount = 0
    
    foreach ($line in $lines) {
        if ($line -match $patterns.start) {
            $inSection = $true
            $braceCount = 0
        }
        
        if ($inSection) {
            $sectionLines += $line
            
            # Count braces
            $braceCount += ($line.ToCharArray() | Where-Object { $_ -eq '{' }).Count
            $braceCount -= ($line.ToCharArray() | Where-Object { $_ -eq '}' }).Count
            
            # End when braces balance and we hit },
            if ($braceCount -eq 0 -and $line -match '^\s{4}\},?$') {
                break
            }
        }
    }
    
    return ($sectionLines -join "`n").Trim()
}

Write-Host "`n📦 Extracting sections..." -ForegroundColor Yellow

# Create directories
New-Item -ItemType Directory -Path "bg" -Force | Out-Null
New-Item -ItemType Directory -Path "en" -Force | Out-Null

Write-Host "✅ Created bg/ and en/ directories" -ForegroundColor Green

$totalSections = $sections.Keys.Count
$current = 0

foreach ($section in $sections.Keys) {
    $current++
    $percent = [math]::Round(($current / $totalSections) * 100)
    
    Write-Host "`n[$current/$totalSections] Processing '$section'... ($percent%)" -ForegroundColor Cyan
    
    # Extract from BG
    $bgSection = Extract-Section -content $bgContent -sectionName $section -patterns $sections[$section]
    
    # Extract from EN
    $enSection = Extract-Section -content $enContent -sectionName $section -patterns $sections[$section]
    
    if (-not $bgSection -or -not $enSection) {
        Write-Host "  ⚠️  Warning: Section '$section' not found in BG or EN" -ForegroundColor Yellow
        continue
    }
    
    # Clean section name from content
    $bgSection = $bgSection -replace "^\s{4}$section:\s*\{", ""
    $bgSection = $bgSection -replace '\},$', ''
    
    $enSection = $enSection -replace "^\s{4}$section:\s*\{", ""
    $enSection = $enSection -replace '\},$', ''
    
    # Create BG file
    $bgFileContent = @"
// Bulgarian translations for $section section
export const $section = {
$bgSection
} as const;
"@
    
    Set-Content -Path "bg/$section.ts" -Value $bgFileContent -Encoding UTF8
    
    # Create EN file
    $enFileContent = @"
// English translations for $section section
export const $section = {
$enSection
} as const;
"@
    
    Set-Content -Path "en/$section.ts" -Value $enFileContent -Encoding UTF8
    
    Write-Host "  ✅ Created bg/$section.ts and en/$section.ts" -ForegroundColor Green
}

Write-Host "`n🎉 Section extraction complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`nNext: Creating index files..." -ForegroundColor Yellow
