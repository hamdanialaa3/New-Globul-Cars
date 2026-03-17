# Update Gemini API Key in Firebase Functions Config
# Usage: .\scripts\update-gemini-key.ps1 "YOUR_API_KEY_HERE"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "🔑 Updating Gemini API Key in Firebase Functions Config..." -ForegroundColor Cyan

# Validate API key format (should start with AIza)
if ($ApiKey -notmatch '^AIza') {
    Write-Host "⚠️  Warning: API key doesn't look like a valid Gemini API key (should start with 'AIza')" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "❌ Aborted" -ForegroundColor Red
        exit 1
    }
}

# Set the config
Write-Host "Setting config..." -ForegroundColor White
firebase functions:config:set "gemini.key=$ApiKey"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ API key updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚡ Next step: Deploy the functions to apply changes" -ForegroundColor Cyan
    Write-Host "   firebase deploy --only functions:geminiChat" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Note: You can get a valid API key from:" -ForegroundColor Yellow
    Write-Host "   https://aistudio.google.com/apikey" -ForegroundColor White
} else {
    Write-Host "❌ Failed to update API key" -ForegroundColor Red
    exit 1
}
