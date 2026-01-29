# Fix duplicate function signatures in visitor-analytics-service.ts
$file = "src\services\visitor-analytics-service.ts"
$content = Get-Content $file -Raw

# Remove duplicate lines
$content = $content -replace 'private calculateGeoDistribution\(views: unknown\[\]\): Array.*?\n\s*private calculateGeoDistribution\(views: any\[\]\):', 'private calculateGeoDistribution(views: any[]):'
$content = $content -replace 'private calculateDeviceStats\(views: unknown\[\]\): .*?\n\s*private calculateDeviceStats\(views: any\[\]\):', 'private calculateDeviceStats(views: any[]):'
$content = $content -replace 'private calculateTopPages\(views: unknown\[\]\): .*?\n\s*private calculateTopPages\(views: any\[\]\):', 'private calculateTopPages(views: any[]):'
$content = $content -replace 'private calculateTrafficSources\(views: unknown\[\]\): .*?\n\s*private calculateTrafficSources\(views: any\[\]\):', 'private calculateTrafficSources(views: any[]):'

$content | Set-Content $file -NoNewline
Write-Host "✅ Fixed duplicate function signatures"
