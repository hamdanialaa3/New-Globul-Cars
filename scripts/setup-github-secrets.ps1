# setup-github-secrets.ps1
# Interactive wizard to configure GitHub Actions secrets for Firebase deployment.
# Run from the project root: pwsh scripts/setup-github-secrets.ps1

param(
    [string]$Repo = "hamdanialaa3/New-Globul-Cars",
    [string]$ProjectId = "fire-new-globul"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Koli One — GitHub Secrets Setup Wizard" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# ── Verify gh CLI is installed ───────────────────────────────────────────────
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: GitHub CLI (gh) is not installed." -ForegroundColor Red
    Write-Host "  Install it from: https://cli.github.com" -ForegroundColor Yellow
    exit 1
}

# ── Verify gh is authenticated ───────────────────────────────────────────────
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to GitHub CLI. Running 'gh auth login'..." -ForegroundColor Yellow
    gh auth login
}

Write-Host "Target repo : $Repo" -ForegroundColor Green
Write-Host "Firebase ID : $ProjectId" -ForegroundColor Green
Write-Host ""

# ── Helper ────────────────────────────────────────────────────────────────────
function Set-Secret {
    param([string]$Name, [string]$Value)
    $Value | gh secret set $Name --repo $Repo
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $Name" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $Name" -ForegroundColor Red
    }
}

# ── 1. FIREBASE_PROJECT_ID ────────────────────────────────────────────────────
Write-Host "Setting FIREBASE_PROJECT_ID = $ProjectId ..." -ForegroundColor Cyan
Set-Secret "FIREBASE_PROJECT_ID" $ProjectId

# ── 2. FIREBASE_SERVICE_ACCOUNT ──────────────────────────────────────────────
Write-Host ""
Write-Host "FIREBASE_SERVICE_ACCOUNT setup:" -ForegroundColor Cyan
Write-Host "  This is a JSON key downloaded from Firebase Console." -ForegroundColor Gray
Write-Host "  Steps to get it:" -ForegroundColor Gray
Write-Host "    1. Open https://console.firebase.google.com/project/$ProjectId/settings/serviceaccounts/adminsdk" -ForegroundColor Gray
Write-Host "    2. Click 'Generate new private key'" -ForegroundColor Gray
Write-Host "    3. Save the .json file" -ForegroundColor Gray
Write-Host ""

$saPath = Read-Host "Paste the full path to your service-account JSON file (or press Enter to skip)"

if ($saPath -and (Test-Path $saPath)) {
    $saJson = Get-Content $saPath -Raw
    Set-Secret "FIREBASE_SERVICE_ACCOUNT" $saJson
} elseif ($saPath) {
    Write-Host "  File not found: $saPath — skipping FIREBASE_SERVICE_ACCOUNT" -ForegroundColor Yellow
} else {
    Write-Host "  Skipped FIREBASE_SERVICE_ACCOUNT (set it manually later)" -ForegroundColor Yellow
}

# ── 3. Optional Vite / Algolia secrets ────────────────────────────────────────
Write-Host ""
$setOptional = Read-Host "Set optional Vite/Algolia secrets now? (y/N)"

if ($setOptional -match "^[Yy]$") {
    $vars = @(
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
        "VITE_FIREBASE_MEASUREMENT_ID",
        "VITE_GEMINI_API_KEY",
        "VITE_ALGOLIA_APP_ID",
        "VITE_ALGOLIA_SEARCH_API_KEY"
    )
    foreach ($v in $vars) {
        $val = Read-Host "  $v (Enter to skip)"
        if ($val) { Set-Secret $v $val }
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Done! Re-run your GitHub Actions workflow:" -ForegroundColor Green
Write-Host "  https://github.com/$Repo/actions" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
