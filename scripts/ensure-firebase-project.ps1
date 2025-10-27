Param(
  [Parameter(Position=0, Mandatory=$false)]
  [string]$ProjectId
)

# Ensure we are at the repo root (script lives in scripts/) 
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$firebasercPath = Join-Path $repoRoot ".firebaserc"
if (-not (Test-Path $firebasercPath)) {
  Write-Error ".firebaserc not found at $firebasercPath. Please run from the repo root or create a .firebaserc with a default project."
  exit 1
}

try {
  $cfg = Get-Content $firebasercPath -Raw | ConvertFrom-Json
} catch {
  Write-Error "Failed to parse .firebaserc. Ensure it's valid JSON. $_"
  exit 1
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  $ProjectId = $cfg.projects.default
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  Write-Error "No Firebase project id provided and no default found in .firebaserc. Provide a project id: ./scripts/ensure-firebase-project.ps1 <project-id>"
  exit 1
}

Write-Host "Using Firebase project: $ProjectId" -ForegroundColor Cyan

# Check firebase-tools availability via npx
Write-Host "Verifying Firebase CLI (firebase-tools)..." -ForegroundColor DarkCyan

# Use npx to invoke firebase-tools consistently without requiring global install
$useCmd = "npx firebase-tools use $ProjectId"

try {
  $env:TERM = "xterm"  # improves some CLI output formatting in terminals
  & pwsh -NoProfile -Command $useCmd
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $useCmd"
  }
} catch {
  Write-Warning "Could not set active project automatically. You may need to login first. We'll try to log you in."
  $loginCmd = "npx firebase-tools login"
  & pwsh -NoProfile -Command $loginCmd
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Login failed. Please run: npx firebase-tools login, then re-run this script."
    exit 1
  }
  & pwsh -NoProfile -Command $useCmd
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to set active project after login. Verify the project id exists and you have access: $ProjectId"
    exit 1
  }
}

Write-Host "Active Firebase project set to: $ProjectId" -ForegroundColor Green

# Optional: quick verification
& pwsh -NoProfile -Command "npx firebase-tools projects:list | Select-String -Pattern $ProjectId -SimpleMatch | ForEach-Object { $_.Line }"

Write-Host "Done. You can now run deploy/emulators scripts from the repo root." -ForegroundColor Green
