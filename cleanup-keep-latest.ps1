# 🗑️ Delete all GitHub Actions artifacts except the latest N (default 3)
# Requires GitHub CLI (gh) installed and authenticated: gh auth login
# Usage:
#   ./cleanup-keep-latest.ps1                 # keeps latest 3
#   ./cleanup-keep-latest.ps1 -Keep 5         # keeps latest 5
#   ./cleanup-keep-latest.ps1 -Owner foo -Repo bar -Keep 2

param(
  [string]$Owner = "hamdanialaa3",
  [string]$Repo = "New-Globul-Cars",
  [int]$Keep = 3
)

Write-Host "🧹 Cleaning artifacts for $Owner/$Repo (keep latest $Keep)..." -ForegroundColor Cyan

# Verify gh CLI exists
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "❌ GitHub CLI not found. Install from https://cli.github.com/" -ForegroundColor Red
  exit 1
}

# Verify auth
$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Not authenticated. Run: gh auth login" -ForegroundColor Red
  exit 1
}

# Fetch all artifacts (paginated)
Write-Host "📥 Fetching artifacts..." -ForegroundColor Yellow
$all = gh api "/repos/$Owner/$Repo/actions/artifacts" --paginate | ConvertFrom-Json
$artifacts = $all.artifacts

if (-not $artifacts -or $artifacts.Count -eq 0) {
  Write-Host "✅ No artifacts to delete." -ForegroundColor Green
  exit 0
}

# Sort by created_at DESC and select to delete
$sorted = $artifacts | Sort-Object -Property { [datetime]$_.created_at } -Descending
$toKeep = $sorted | Select-Object -First $Keep
$toDelete = $sorted | Select-Object -Skip $Keep

Write-Host ("📦 Total: {0} | Keep: {1} | Delete: {2}" -f $artifacts.Count, $toKeep.Count, $toDelete.Count) -ForegroundColor Cyan

if ($toDelete.Count -eq 0) {
  Write-Host "✅ Nothing to delete (already under threshold)." -ForegroundColor Green
  exit 0
}

Write-Host "\n🔒 Will KEEP:" -ForegroundColor Yellow
$toKeep | ForEach-Object {
  $sizeMB = [math]::Round($_.size_in_bytes / 1MB, 2)
  Write-Host ("  • {0} | {1} MB | {2}" -f $_.name, $sizeMB, $_.created_at) -ForegroundColor Gray
}

Write-Host "\n🗑️  Will DELETE:" -ForegroundColor Yellow
$toDelete | ForEach-Object {
  $sizeMB = [math]::Round($_.size_in_bytes / 1MB, 2)
  Write-Host ("  • {0} | {1} MB | {2}" -f $_.name, $sizeMB, $_.created_at) -ForegroundColor Gray
}

$confirm = Read-Host "\nType 'yes' to confirm deletion"
if ($confirm -ne 'yes') {
  Write-Host "⏸️  Aborted by user." -ForegroundColor Yellow
  exit 0
}

# Delete
$deleted = 0
$totalFreed = 0
foreach ($a in $toDelete) {
  try {
    gh api -X DELETE "/repos/$Owner/$Repo/actions/artifacts/$($a.id)" | Out-Null
    $deleted++
    $totalFreed += $a.size_in_bytes
    $sizeMB = [math]::Round($a.size_in_bytes / 1MB, 2)
    Write-Host ("  ✅ Deleted: {0} ({1} MB)" -f $a.name, $sizeMB) -ForegroundColor Green
  }
  catch {
    Write-Host ("  ❌ Failed: {0}" -f $a.name) -ForegroundColor Red
  }
}

$freedMB = [math]::Round($totalFreed / 1MB, 2)
Write-Host ("\n✅ Done. Deleted {0} artifacts. Freed {1} MB." -f $deleted, $freedMB) -ForegroundColor Green
Write-Host "🔗 Check: https://github.com/$Owner/$Repo/actions" -ForegroundColor Cyan
