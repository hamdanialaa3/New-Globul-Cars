# Clean Cursor Caches and Simple Memory
# تنظيف كاشات وذاكرة Cursor البسيطة

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Clean Cursor Caches and Simple Memory" -ForegroundColor Cyan
Write-Host "  تنظيف كاشات وذاكرة Cursor البسيطة" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$cleanedItems = @()
$totalSize = 0

function Get-FolderSize {
    param([string]$Path)
    if (Test-Path $Path) {
        try {
            $size = (Get-ChildItem -Path $Path -Recurse -ErrorAction SilentlyContinue | 
                Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            return [math]::Round($size / 1MB, 2)
        }
        catch {
            return 0
        }
    }
    return 0
}

function Remove-ItemSafe {
    param([string]$Path, [string]$Name)
    if (Test-Path $Path) {
        try {
            $size = Get-FolderSize $Path
            Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            $sizeStr = [math]::Round($size, 2).ToString()
            $itemDesc = $Name + ' (' + $sizeStr + ' MB)'
            $script:cleanedItems += $itemDesc
            $script:totalSize += $size
            Write-Host '  [OK] Deleted:' $Name -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host '  [WARN] Failed to delete:' $Name -ForegroundColor Yellow
            return $false
        }
    }
    return $false
}

# 1. Clean npm cache
Write-Host "[1/8] Cleaning npm cache..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host '  [OK] npm cache cleaned' -ForegroundColor Green
}
catch {
    Write-Host '  [WARN] Failed to clean npm cache' -ForegroundColor Yellow
}

# 2. Delete node_modules/.cache
Write-Host "[2/8] Deleting node_modules/.cache..." -ForegroundColor Yellow
Remove-ItemSafe -Path "$projectRoot\node_modules\.cache" -Name "node_modules/.cache"

# 3. Delete .cache folder
Write-Host "[3/8] Deleting .cache folder..." -ForegroundColor Yellow
Remove-ItemSafe -Path "$projectRoot\.cache" -Name ".cache"

# 4. Delete TypeScript caches
Write-Host "[4/8] Cleaning TypeScript caches..." -ForegroundColor Yellow
$tsCacheFiles = @(
    "$projectRoot\tsconfig.tsbuildinfo",
    "$projectRoot\.tsbuildinfo"
)
foreach ($file in $tsCacheFiles) {
    if (Test-Path $file) {
        try {
            $size = (Get-Item $file).Length / 1KB
            Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
            $sizeStr = [math]::Round($size, 2).ToString()
            $itemDesc = 'TypeScript cache (' + $sizeStr + ' KB)'
            $cleanedItems += $itemDesc
            $totalSize += $size / 1024
            Write-Host '  [OK] Deleted: TypeScript cache' -ForegroundColor Green
        }
        catch {
            Write-Host '  [WARN] Failed to delete TypeScript cache' -ForegroundColor Yellow
        }
    }
}

# 5. Delete log files
Write-Host "[5/8] Cleaning log files..." -ForegroundColor Yellow
$logFiles = @(
    "$projectRoot\npm-debug.log",
    "$projectRoot\yarn-debug.log",
    "$projectRoot\yarn-error.log",
    "$projectRoot\pnpm-debug.log"
)
foreach ($file in $logFiles) {
    if (Test-Path $file) {
        try {
            $size = (Get-Item $file).Length / 1KB
            Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
            $fileName = Split-Path $file -Leaf
            $sizeStr = [math]::Round($size, 2).ToString()
            $itemDesc = $fileName + ' (' + $sizeStr + ' KB)'
            $cleanedItems += $itemDesc
            $totalSize += $size / 1024
            Write-Host '  [OK] Deleted:' $fileName -ForegroundColor Green
        }
        catch { }
    }
}

# 6. Delete ESLint cache files
Write-Host "[6/8] Cleaning ESLint cache..." -ForegroundColor Yellow
Remove-ItemSafe -Path "$projectRoot\.eslintcache" -Name ".eslintcache"

# 7. Delete temp files
Write-Host "[7/8] Cleaning temp files..." -ForegroundColor Yellow
$tempPatterns = @(
    "$projectRoot\*.tmp",
    "$projectRoot\*.temp"
)
foreach ($pattern in $tempPatterns) {
    Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $size = $_.Length / 1KB
            Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
            $sizeStr = [math]::Round($size, 2).ToString()
            $itemDesc = $_.Name + ' (' + $sizeStr + ' KB)'
            $cleanedItems += $itemDesc
            $totalSize += $size / 1024
            Write-Host "  [OK] Deleted: $($_.Name)" -ForegroundColor Green
        }
        catch { }
    }
}

# 8. Clean Cursor caches (if exist)
Write-Host "[8/8] Cleaning Cursor caches..." -ForegroundColor Yellow
$appData = $env:APPDATA
$localAppData = $env:LOCALAPPDATA
$cursorCachePaths = @(
    "$appData\Cursor\Cache",
    "$appData\Cursor\Code Cache",
    "$localAppData\Cursor\Cache",
    "$localAppData\Cursor\Code Cache",
    "$localAppData\Cursor\CachedData",
    "$localAppData\Cursor\GPUCache"
)
foreach ($cachePath in $cursorCachePaths) {
    if (Test-Path $cachePath) {
        try {
            $size = Get-FolderSize $cachePath
            Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
            $sizeStr = [math]::Round($size, 2).ToString()
            $itemDesc = 'Cursor Cache (' + $sizeStr + ' MB)'
            $cleanedItems += $itemDesc
            $totalSize += $size
            Write-Host '  [OK] Deleted: Cursor Cache' -ForegroundColor Green
        }
        catch {
            Write-Host '  [WARN] Failed to delete Cursor Cache (may be in use)' -ForegroundColor Yellow
        }
    }
}

# Summary
Write-Host ""
Write-Host '================================================================' -ForegroundColor Green
Write-Host '  [OK] Cleanup completed successfully!' -ForegroundColor Green
Write-Host '================================================================' -ForegroundColor Green
Write-Host ""

if ($cleanedItems.Count -gt 0) {
    Write-Host '[INFO] Cleaned items:' -ForegroundColor Cyan
    foreach ($item in $cleanedItems) {
        Write-Host '   -' $item -ForegroundColor White
    }
    $totalSizeStr = [math]::Round($totalSize, 2).ToString()
    Write-Host ""
    Write-Host '[INFO] Total space freed:' $totalSizeStr 'MB' -ForegroundColor Green
}
else {
    Write-Host '[INFO] No cache files to clean' -ForegroundColor Yellow
}

Write-Host ""
Write-Host '[TIP] Tip: Restart Cursor for best performance' -ForegroundColor Cyan
Write-Host ""
