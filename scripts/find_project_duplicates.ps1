$ErrorActionPreference = "Stop"

$rootPath = "C:\Users\hamda\Desktop\New Globul Cars"

Write-Host "Scanning files under $rootPath..."
$allFiles = Get-ChildItem -Path $rootPath -Recurse -File -ErrorAction SilentlyContinue
$fileCount = $allFiles.Count
Write-Host "Total files discovered: $fileCount"

Write-Host "Grouping by size to narrow candidates..."
$sizeGroups = $allFiles | Group-Object Length | Where-Object { $_.Count -gt 1 }
$candidateCount = ($sizeGroups | ForEach-Object { $_.Count }) | Measure-Object -Sum
Write-Host "Files sharing the same size: $($candidateCount.Sum)"

$hashGroups = @{}
$processed = 0

foreach ($group in $sizeGroups) {
    foreach ($file in $group.Group) {
        try {
            $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
            $key = "$($file.Length)|$hash"
            if ($hashGroups.ContainsKey($key)) {
                $hashGroups[$key].Add($file.FullName)
            } else {
                $hashGroups[$key] = New-Object System.Collections.Generic.List[string]
                $hashGroups[$key].Add($file.FullName)
            }
        } catch {
            continue
        }
        $processed++
        if ($processed % 2000 -eq 0) {
            Write-Host ("Hashed {0} of {1} candidate files..." -f $processed, $candidateCount.Sum)
        }
    }
}

$duplicateEntries = $hashGroups.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 }
$duplicateGroups = @()

foreach ($entry in $duplicateEntries) {
    $parts = $entry.Key.Split("|")
    $size = [long]$parts[0]
    $hash = $parts[1]
    $paths = $entry.Value.ToArray()
    $duplicateGroups += [PSCustomObject]@{
        Hash = $hash
        SizeBytes = $size
        FileCount = $paths.Length
        TotalFootprintBytes = $size * $paths.Length
        Paths = $paths
    }
}

$groupTotal = $duplicateGroups.Count
$duplicateFileTotal = ($duplicateGroups | ForEach-Object { $_.FileCount - 1 } | Measure-Object -Sum).Sum
$duplicateFootprint = ($duplicateGroups | ForEach-Object { $_.SizeBytes * ( $_.FileCount - 1 ) } | Measure-Object -Sum).Sum

Write-Host ""
Write-Host "Duplicate summary"
Write-Host "-----------------"
Write-Host ("Groups with identical content: {0}" -f $groupTotal)
Write-Host ("Redundant copies beyond originals: {0}" -f $duplicateFileTotal)
Write-Host ("Redundant footprint (MB): {0:N2}" -f ($duplicateFootprint / 1MB))

# Aggregate by top-level location
$topLevelStats = @{}

foreach ($group in $duplicateGroups) {
    foreach ($path in $group.Paths) {
        $relative = [System.IO.Path]::GetRelativePath($rootPath, $path)
        $segments = $relative.Split([System.IO.Path]::DirectorySeparatorChar, [System.StringSplitOptions]::RemoveEmptyEntries)
        $topLevel = if ($segments.Length -gt 1) { $segments[0] } else { $relative }

        if (-not $topLevelStats.ContainsKey($topLevel)) {
            $topLevelStats[$topLevel] = [PSCustomObject]@{
                DuplicateFiles = 0
                DuplicateBytes = 0L
            }
        }

        $topLevelStats[$topLevel].DuplicateFiles += 1
        $topLevelStats[$topLevel].DuplicateBytes += $group.SizeBytes
    }
}

$topLevelReport = $topLevelStats.GetEnumerator() |
    Sort-Object { $_.Value.DuplicateBytes } -Descending |
    Select-Object -First 15 @{ Name = "Location"; Expression = { $_.Key } },
        @{ Name = "DuplicateFiles"; Expression = { $_.Value.DuplicateFiles } },
        @{ Name = "DuplicateMB"; Expression = { "{0:N2}" -f ($_.Value.DuplicateBytes / 1MB) } }

Write-Host ""
Write-Host "Top duplicate hotspots (by folder)"
$topLevelReport | Format-Table -AutoSize

# Largest duplicate groups by footprint
$largestGroups = $duplicateGroups |
    Sort-Object TotalFootprintBytes -Descending |
    Select-Object -First 15 Hash,
        @{ Name = "SizeMB"; Expression = { "{0:N2}" -f ($_.SizeBytes / 1MB) } },
        FileCount,
        @{ Name = "TotalMB"; Expression = { "{0:N2}" -f ($_.TotalFootprintBytes / 1MB) } },
        @{ Name = "SamplePath"; Expression = { $_.Paths[0] } }

Write-Host ""
Write-Host "Largest duplicate groups"
$largestGroups | Format-Table -AutoSize

# Duplicate profile per extension
$extensionStats = @{}

foreach ($group in $duplicateGroups) {
    foreach ($path in $group.Paths) {
        $extension = [System.IO.Path]::GetExtension($path)
        if ([string]::IsNullOrWhiteSpace($extension)) {
            $extension = "<no-ext>"
        } else {
            $extension = $extension.ToLowerInvariant()
        }

        if (-not $extensionStats.ContainsKey($extension)) {
            $extensionStats[$extension] = [PSCustomObject]@{
                DuplicateFiles = 0
                DuplicateBytes = 0L
            }
        }

        $extensionStats[$extension].DuplicateFiles += 1
        $extensionStats[$extension].DuplicateBytes += $group.SizeBytes
    }
}

$extensionReport = $extensionStats.GetEnumerator() |
    Sort-Object { $_.Value.DuplicateBytes } -Descending |
    Select-Object -First 15 @{ Name = "Extension"; Expression = { $_.Key } },
        @{ Name = "DuplicateFiles"; Expression = { $_.Value.DuplicateFiles } },
        @{ Name = "DuplicateMB"; Expression = { "{0:N2}" -f ($_.Value.DuplicateBytes / 1MB) } }

Write-Host ""
Write-Host "Top duplicate extensions"
$extensionReport | Format-Table -AutoSize

# Persist detailed data for future review
$detailsPath = Join-Path $rootPath "DDD\DOCUMENTATION_ARCHIVE_NOV_2025\duplicate_details.csv"
$summaryPath = Join-Path $rootPath "DDD\DOCUMENTATION_ARCHIVE_NOV_2025\duplicate_summary.csv"

Write-Host ""
Write-Host "Writing summary to $summaryPath"
$duplicateGroups |
    Select-Object Hash, SizeBytes, FileCount, TotalFootprintBytes |
    Export-Csv -Path $summaryPath -NoTypeInformation

Write-Host "Writing details to $detailsPath"
"Hash,SizeBytes,Path" | Set-Content -Path $detailsPath
foreach ($group in $duplicateGroups) {
    foreach ($path in $group.Paths) {
        "$($group.Hash),$($group.SizeBytes),$path" | Add-Content -Path $detailsPath
    }
}

Write-Host "Done."

