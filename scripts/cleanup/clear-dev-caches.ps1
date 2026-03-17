<#
Clears local dev caches and frees port 3000 for CRA/CRACO dev server.
Safe by default; use -Aggressive to also clear Chrome/Edge caches (closes browsers).
#>
param(
  [switch]$Aggressive
)

Write-Host "Clearing dev caches and freeing port 3000..." -ForegroundColor Cyan

# 1) Kill any process listening on port 3000
try {
  $conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
  if ($conns) {
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
      try {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc) {
          Write-Host ("Killing PID {0} ({1}) on :3000" -f $procId, $proc.ProcessName) -ForegroundColor Yellow
          Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
      } catch { }
    }
  } else {
    Write-Host "No process is listening on :3000" -ForegroundColor Green
  }
} catch { Write-Host ("(warn) Could not inspect port 3000: {0}" -f $_) -ForegroundColor Yellow }

# 2) npm cache
try {
  Write-Host "npm cache clean --force" -ForegroundColor Cyan
  npm cache clean --force | Out-Null
} catch { Write-Host ("(warn) npm cache clean failed: {0}" -f $_) -ForegroundColor Yellow }

# 3) Remove CRA/webpack cache folders
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$webRoot = (Resolve-Path (Join-Path $repoRoot '.')).Path
$targets = @(
  (Join-Path $webRoot 'node_modules/.cache'),
  (Join-Path $webRoot '.eslintcache'),
  (Join-Path $webRoot 'build'),
  (Join-Path $webRoot 'coverage')
)
foreach ($t in $targets) {
  if (Test-Path $t) {
    Write-Host ("Removing {0}" -f $t) -ForegroundColor Yellow
    try { Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $t } catch { }
  }
}

# 4) Flush DNS cache (helps with dev/proxy edge cases)
try {
  Write-Host "ipconfig /flushdns" -ForegroundColor Cyan
  ipconfig /flushdns | Out-Null
} catch { Write-Host ("(warn) DNS flush failed: {0}" -f $_) -ForegroundColor Yellow }

# 5) Optionally clear Chrome/Edge cache (aggressive)
if ($Aggressive) {
  Write-Host "Aggressive mode: clearing Chrome/Edge caches (will close browsers)" -ForegroundColor Red
  $chrome = Get-Process chrome -ErrorAction SilentlyContinue
  $edge = Get-Process msedge -ErrorAction SilentlyContinue
  if ($chrome) { Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue }
  if ($edge) { Stop-Process -Name msedge -Force -ErrorAction SilentlyContinue }

  $chromeCache = Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data\Default\Cache'
  $edgeCache   = Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data\Default\Cache'
  foreach ($c in @($chromeCache, $edgeCache)) {
    if (Test-Path $c) {
      Write-Host ("Removing {0}" -f $c) -ForegroundColor Yellow
      try { Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $c } catch { }
    }
  }
}

Write-Host "Done. Re-run dev server: npm start" -ForegroundColor Green
