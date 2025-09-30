# ESLint Auto-Fix PowerShell Script - English Version
# Bulgarian Car Marketplace - Code Cleanup

Write-Host "Starting Bulgarian Car Marketplace code cleanup..." -ForegroundColor Green
Write-Host ""

# Change to the main project directory
Set-Location "bulgarian-car-marketplace"

Write-Host "Current working directory: $(Get-Location)" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Make sure you're in the right project directory." -ForegroundColor Red
    exit 1
}

Write-Host "Found package.json" -ForegroundColor Green

# Step 1: Install dependencies if needed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Blue
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dependencies already installed" -ForegroundColor Green
}

# Step 2: Run ESLint auto-fix
Write-Host ""
Write-Host "Running ESLint auto-fix..." -ForegroundColor Blue
$eslintResult = & npm run lint:fix 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "ESLint auto-fix completed successfully" -ForegroundColor Green
} else {
    Write-Host "ESLint auto-fix completed with warnings" -ForegroundColor Yellow
}

# Step 3: Check build
Write-Host ""
Write-Host "Testing build..." -ForegroundColor Blue
$buildResult = & npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
} else {
    Write-Host "Build failed. Check errors above." -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
}

# Step 4: Final ESLint check
Write-Host ""
Write-Host "Final ESLint check..." -ForegroundColor Blue
& npx eslint "src/**/*.{tsx,ts,jsx,js}" --max-warnings 50

Write-Host ""
Write-Host "Cleanup process completed!" -ForegroundColor Green
Write-Host "Review the changes and test your application." -ForegroundColor White

# Return to parent directory  
Set-Location ".."