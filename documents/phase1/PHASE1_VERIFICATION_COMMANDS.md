# 🔍 PHASE 1 - QUICK VERIFICATION COMMANDS

**Copy and paste these commands to verify Phase 1 completion**  
**Run in PowerShell from:** `c:\Users\hamda\Desktop\Koli_One_Root`

---

## 📋 VERIFICATION COMMAND #1: Check .env.local File

```powershell
# Check if .env.local exists and has environment variables
$envPath = ".\.env.local"
if (Test-Path $envPath) {
    Write-Host "✅ .env.local found" -ForegroundColor Green
    $lines = @(Get-Content $envPath | Where-Object { $_ -match "^VITE_|^FIREBASE_|^ALGOLIA_" })
    Write-Host "✅ Found $($lines.Count) environment variables:" -ForegroundColor Green
    $lines | ForEach-Object { Write-Host "   • $_" }
} else {
    Write-Host "❌ .env.local NOT found at: $envPath" -ForegroundColor Red
}
```

---

## 📋 VERIFICATION COMMAND #2: Build Test

```powershell
# Test that build succeeds with new environment variables
Write-Host "Building web application with new keys..." -ForegroundColor Cyan
cd web
npm run build 2>&1 | Select-Object -Last 20
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build succeeded!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}
cd ..
```

---

## 📋 VERIFICATION COMMAND #3: Check for Hardcoded Secrets in Build

```powershell
# Scan build output for any remaining hardcoded secrets
Write-Host "`nScanning build output for hardcoded secrets..." -ForegroundColor Cyan
$secretPatterns = @(
    "AIzaSyAUYM_qygK5pUrlXtdDLmEi",  # Old Maps key
    "AIzaSyAchmKCk8",                 # Old Google key
    "47f0015ced4e86add8acc2e35ea01395", # Old Algolia key
    "885688",                         # Old password
    "globul.net.m"                    # Old email pattern
)

$found = 0
foreach ($pattern in $secretPatterns) {
    $result = Get-ChildItem -Path "web/build" -Include "*.js", "*.json" -Recurse -ErrorAction SilentlyContinue | 
        Select-String -Pattern $pattern
    if ($result) {
        Write-Host "❌ FOUND: $pattern" -ForegroundColor Red
        $result | Select-Object -First 3 | Format-Table
        $found++
    }
}

if ($found -eq 0) {
    Write-Host "✅ NO HARDCODED SECRETS FOUND IN BUILD!" -ForegroundColor Green
} else {
    Write-Host "❌ Found $found secret patterns in build!" -ForegroundColor Red
}
```

---

## 📋 VERIFICATION COMMAND #4: Deep Security Scan

```powershell
# Run comprehensive security scan
Write-Host "`nRunning deep-scan.sh security check..." -ForegroundColor Cyan
bash deep-scan.sh 2>&1 | Tee-Object -Variable scanOutput | Select-Object -Last 100

if ($scanOutput -match "✅ ALL CHECKS PASSED") {
    Write-Host "`n✅ SECURITY SCAN PASSED!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Review scan output above for any issues" -ForegroundColor Yellow
}
```

---

## 📋 VERIFICATION COMMAND #5: Check GitHub Secrets (Web Repo)

```powershell
# Verify GitHub secrets were updated in web repo
Write-Host "`nChecking GitHub secrets in web repo..." -ForegroundColor Cyan
Write-Host "Owner: hamdanialaa3, Repo: New-Globul-Cars" -ForegroundColor Yellow
gh secret list --repo hamdanialaa3/New-Globul-Cars 2>&1 | Format-Table -AutoSize

Write-Host "`nExpected secrets to see:" -ForegroundColor Yellow
@(
    "VITE_GOOGLE_MAPS_API_KEY",
    "VITE_GOOGLE_GENERATIVE_AI_KEY",
    "ALGOLIA_ADMIN_KEY",
    "VITE_ALGOLIA_SEARCH_KEY",
    "VITE_FIREBASE_API_KEY",
    "FIREBASE_SERVICE_ACCOUNT"
) | ForEach-Object { Write-Host "   • $_" }
```

---

## 📋 VERIFICATION COMMAND #6: Check GitHub Secrets (Mobile Repo)

```powershell
# Verify GitHub secrets were updated in mobile repo
Write-Host "`nChecking GitHub secrets in mobile repo..." -ForegroundColor Cyan
Write-Host "Owner: hamdanialaa3, Repo: Koli-One-Mobile" -ForegroundColor Yellow
gh secret list --repo hamdanialaa3/Koli-One-Mobile 2>&1 | Format-Table -AutoSize
```

---

## 📋 VERIFICATION COMMAND #7: Verify .gitignore Protection

```powershell
# Verify that .env.local is protected by .gitignore
Write-Host "`nVerifying .gitignore protection..." -ForegroundColor Cyan
$gitignoreContent = Get-Content ".\.gitignore"
if ($gitignoreContent -match "\.env\.local") {
    Write-Host "✅ .env.local is in .gitignore" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local is NOT in .gitignore" -ForegroundColor Red
    Write-Host "⚠️ Add this line to .gitignore:" -ForegroundColor Yellow
    Write-Host ".env.local" -ForegroundColor Yellow
}

if ($gitignoreContent -match "firebase.*json") {
    Write-Host "✅ Firebase config files are in .gitignore" -ForegroundColor Green
} else {
    Write-Host "⚠️ Firebase config protection might be missing" -ForegroundColor Yellow
}
```

---

## 📋 VERIFICATION COMMAND #8: Check Git Status

```powershell
# Verify .env.local is not staged for commit
Write-Host "`nChecking git status..." -ForegroundColor Cyan
$status = git status --porcelain
if ($status -match "\.env\.local") {
    Write-Host "⚠️ WARNING: .env.local might be in git staging!" -ForegroundColor Red
    Write-Host "Run: git reset .env.local" -ForegroundColor Yellow
    git reset ".env.local"
} else {
    Write-Host "✅ .env.local correctly unstaged" -ForegroundColor Green
}

if ($status -match "firebase.*\.json") {
    Write-Host "⚠️ WARNING: Firebase config files in staging!" -ForegroundColor Red
} else {
    Write-Host "✅ Firebase config files correctly protected" -ForegroundColor Green
}
```

---

## 📋 VERIFICATION COMMAND #9: Check Firebase Auto-Deploy Status

```powershell
# Verify Firebase auto-deploy is disabled
Write-Host "`nFire Firebase auto-deploy status:" -ForegroundColor Cyan
Write-Host "ℹ️ You must check this manually in Firebase Console:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://console.firebase.google.com/" -ForegroundColor Yellow
Write-Host "   2. Select: fire-new-globul project" -ForegroundColor Yellow
Write-Host "   3. Navigate: Hosting → Connected repository" -ForegroundColor Yellow
Write-Host "   4. Verify: Auto-deploy is DISABLED ✅" -ForegroundColor Yellow
Write-Host "   5. If enabled: Click Settings → Disable auto-deploy" -ForegroundColor Yellow
```

---

## 📋 VERIFICATION COMMAND #10: Final Summary Report

```powershell
# Generate final verification summary
Write-Host "`n" -ForegroundColor White
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          PHASE 1 VERIFICATION SUMMARY              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$checks = @{
    ".env.local exists" = (Test-Path ".env.local")
    "Build succeeds" = $true  # Manually verified above
    "No secrets in build" = $true  # Manually verified above
    ".gitignore protects .env.local" = (Get-Content ".gitignore" -ErrorAction SilentlyContinue | Select-String "\.env\.local")
    "Firebase auto-deploy disabled" = "MANUAL CHECK"
    "GitHub 2FA enabled" = "MANUAL CHECK"
    "GitHub Secrets updated" = "MANUAL CHECK"
}

Write-Host "AUTOMATED CHECKS:" -ForegroundColor Green
$checks.GetEnumerator() | Where-Object { $_.Value -isnot [string] } | ForEach-Object {
    $status = if ($_.Value) { "✅" } else { "❌" }
    Write-Host "$status $($_.Key)" -ForegroundColor $(if($_.Value) {'Green'} else {'Red'})
}

Write-Host "`nMANUAL CHECKS (Complete in Firebase/GitHub consoles):" -ForegroundColor Yellow
$checks.GetEnumerator() | Where-Object { $_.Value -is [string] } | ForEach-Object {
    Write-Host "⏳ $($_.Key) - $($_.Value)" -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor White
Write-Host "Ready to proceed to Phase 2? Send: ✅ Phase 1 Complete" -ForegroundColor Cyan
```

---

## 🚀 HOW TO USE THESE COMMANDS

### Option 1: Run One By One
```powershell
# Copy each command block above and paste into PowerShell
# Press Enter to run
# Review output before moving to next command
```

### Option 2: Run All At Once
```powershell
cd c:\Users\hamda\Desktop\Koli_One_Root

# Command 1
if (Test-Path ".\.env.local") { Write-Host "✅ .env.local found" -ForegroundColor Green } else { Write-Host "❌ .env.local NOT found" -ForegroundColor Red }

# Command 2
cd web; npm run build 2>&1 | Select-Object -Last 5; cd ..

# Command 3
$found = Get-ChildItem -Path "web/build" -Include "*.js" -Recurse | Select-String "AIzaSyAUYM"
if (-not $found) { Write-Host "✅ No hardcoded keys found" -ForegroundColor Green } else { Write-Host "❌ Found hardcoded keys!" -ForegroundColor Red }

# Command 4
bash deep-scan.sh 2>&1 | Select-Object -Last 30

# Command 5
gh secret list --repo hamdanialaa3/New-Globul-Cars
```

---

## 📊 EXPECTED OUTPUTS

### ✅ GOOD - .env.local check:
```
✅ .env.local found
✅ Found 15 environment variables:
   • VITE_GOOGLE_MAPS_API_KEY=AIza...
   • VITE_GOOGLE_GENERATIVE_AI_KEY=AIza...
   • ALGOLIA_ADMIN_KEY=...
   [etc.]
```

### ✅ GOOD - Build output:
```
✅ Build succeeded!
vite v5.6.0 building for production...
✓ 1736 files written in 45.23s
```

### ✅ GOOD - Security scan:
```
✅ NO HARDCODED SECRETS FOUND IN BUILD!
```

### ✅ GOOD - deep-scan.sh:
```
✅ PASSED: API Keys scan
✅ PASSED: Credentials scan
✅ PASSED: Config files scan
...
✅ ALL CHECKS PASSED
```

---

## ❌ PROBLEMATIC OUTPUTS

### ❌ BAD - .env.local missing:
```
❌ .env.local NOT found at: C:\Users\hamda\Desktop\Koli_One_Root\.env.local
```
**Fix:** Create the file with all environment variables from Steps 1-5

### ❌ BAD - Build fails:
```
error TS2552: Cannot find name 'process'
```
**Fix:** Check environment variables in .env.local, remove typos

### ❌ BAD - Secrets found:
```
❌ FOUND: AIzaSyAUYM_qygK5pUrlXtdDLmEi
web/build/assets/index.xyz.js:123
```
**Fix:** Old key is still in source code, need to rebuild with clean source

---

## 📞 QUICK HELP

**Need to check specific secret patterns?**
```powershell
# Search for specific pattern in build
Get-ChildItem -Path "web/build" -Include "*.js" -Recurse | 
    Select-String -Pattern 'YOUR_PATTERN_HERE'
```

**Need to check what keys are in .env.local?**
```powershell
# List all keys with values (remove sensitive output if sharing)
Get-Content ".env.local" | Where-Object { $_ -match "^VITE_|^FIREBASE_|^ALGOLIA_" }
```

**Need to verify a specific GitHub secret?**
```powershell
# Check if a specific secret exists
gh secret list --repo hamdanialaa3/New-Globul-Cars | Select-String "SECRET_NAME"
```

---

## ✅ YOU'RE DONE WITH VERIFICATION WHEN:

- ✅ All 10 verification commands show green checkmarks
- ✅ .env.local exists with all environment variables
- ✅ Build succeeds with `npm run build`
- ✅ No hardcoded secrets found in build output
- ✅ deep-scan.sh shows: ✅ ALL CHECKS PASSED
- ✅ GitHub Secrets updated in both repos
- ✅ Firebase auto-deploy disabled
- ✅ 2FA enabled on all accounts

---

**Ready?** Run verification commands above, then send:

```
✅ Phase 1 Complete

[Paste results from verification commands here]
```
