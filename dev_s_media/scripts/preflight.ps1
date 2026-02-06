Param(
  [Parameter(Mandatory=$true)][string]$AdJson,
  [string]$LlmHealthUrl = "http://localhost:5000/health",
  [int]$TimeoutSeconds = 10,
  [int]$MinWidth = 1080,
  [int]$MinHeight = 1080
)

if (-not (Test-Path $AdJson)) {
  Write-Error "Ad JSON not found: $AdJson"
  exit 2
}

# Read image URLs using jq if available, otherwise use simple parsing
if (-not (Get-Command jq -ErrorAction SilentlyContinue)) {
  Write-Warning "jq not found. Install jq for robust JSON parsing."
  $content = Get-Content $AdJson -Raw
  $imageUrls = @()
  $matches = [regex]::Matches($content, '"images"\s*:\s*\[([^\]]*)\]', 'Singleline')
  if ($matches.Count -gt 0) {
    $inner = $matches[0].Groups[1].Value
    $inner -split ',' | ForEach-Object {
      $u = $_.Trim() -replace '["\s]', ''
      if ($u) { $imageUrls += $u }
    }
  }
} else {
  $imageUrls = jq -r '.images[]?' $AdJson | Where-Object { $_ -ne $null }
}

if ($imageUrls.Count -eq 0) {
  Write-Error "No images found in ad JSON"
  exit 3
}

# Check reachability and resolution (ImageMagick identify recommended)
foreach ($url in $imageUrls) {
  Write-Host "Checking $url"
  try {
    $resp = Invoke-WebRequest -Uri $url -TimeoutSec $TimeoutSeconds -UseBasicParsing
  } catch {
    Write-Error "Image not reachable: $url"
    exit 4
  }
  if ($resp.StatusCode -ne 200) {
    Write-Error "Image returned status $($resp.StatusCode): $url"
    exit 4
  }

  if (Get-Command identify -ErrorAction SilentlyContinue) {
    $tmp = New-TemporaryFile
    Invoke-WebRequest -Uri $url -OutFile $tmp -TimeoutSec $TimeoutSeconds -UseBasicParsing
    $info = & identify -format "%w %h" $tmp 2>$null
    Remove-Item $tmp -Force
    if ($info) {
      $parts = $info -split ' '
      if ([int]$parts[0] -lt $MinWidth -or [int]$parts[1] -lt $MinHeight) {
        Write-Error "Image resolution too small ($($parts[0])x$($parts[1])) for $url"
        exit 5
      }
    }
  } else {
    Write-Warning "ImageMagick identify not found; skipping resolution check"
  }
}

# PII scan
$content = Get-Content $AdJson -Raw
$phonePattern = '\d{6,}'
$emailPattern = '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
if ($content -match $phonePattern) {
  Write-Error "Possible phone number detected in ad JSON"
  exit 6
}
if ($content -match $emailPattern) {
  Write-Error "Possible email detected in ad JSON"
  exit 6
}

# LLM health
try {
  $h = Invoke-WebRequest -Uri $LlmHealthUrl -TimeoutSec 5 -UseBasicParsing
  if ($h.Content -notmatch 'ok') {
    Write-Error "LLM health check failed at $LlmHealthUrl"
    exit 7
  }
} catch {
  Write-Error "LLM health check failed at $LlmHealthUrl"
  exit 7
}

Write-Host "Preflight checks passed"
exit 0
