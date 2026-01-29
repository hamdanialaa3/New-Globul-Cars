#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick Firebase Service Account Download Helper
    
.DESCRIPTION
    Opens Firebase Console and guides user to download Service Account
#>

$projectId = "fire-new-globul"
$url = "https://console.firebase.google.com/project/$projectId/settings/serviceaccounts/adminsdk"

Write-Host "`n🔥 Firebase Service Account Download Helper`n" -ForegroundColor Magenta

Write-Host "📋 Steps to download Service Account:" -ForegroundColor Cyan
Write-Host "1. Opening Firebase Console..." -ForegroundColor Yellow
Write-Host "2. Click 'Generate new private key' button" -ForegroundColor Yellow
Write-Host "3. Save as 'firebase-service-account.json' in project root" -ForegroundColor Yellow
Write-Host "4. Run setup script: .\scripts\setup-github-secrets-automated.ps1`n" -ForegroundColor Yellow

Write-Host "Opening browser in 3 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Open browser
Start-Process $url

Write-Host "`n✅ Browser opened!" -ForegroundColor Green
Write-Host "After downloading, run: " -ForegroundColor White -NoNewline
Write-Host ".\scripts\setup-github-secrets-automated.ps1" -ForegroundColor Cyan
