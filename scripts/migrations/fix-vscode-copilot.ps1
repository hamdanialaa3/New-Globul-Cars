param(
  [switch]$Apply,
  [switch]$RestartVSCode
)

$ErrorActionPreference = 'Stop'

function Write-Section($text) {
  Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

function Collect-CandidatePaths {
  param([string]$baseDir)

  if (-not (Test-Path $baseDir)) {
    return @()
  }

  $candidates = @()

  $workspaceStorage = Join-Path $baseDir 'workspaceStorage'
  if (Test-Path $workspaceStorage) {
    $copilotWorkspaceData = Get-ChildItem -Path $workspaceStorage -Directory -ErrorAction SilentlyContinue |
      ForEach-Object {
        Get-ChildItem -Path $_.FullName -Directory -ErrorAction SilentlyContinue |
          Where-Object { $_.Name -like 'GitHub.copilot*' }
      }
    $candidates += $copilotWorkspaceData
  }

  $globalStorage = Join-Path $baseDir 'globalStorage'
  if (Test-Path $globalStorage) {
    $copilotGlobalData = Get-ChildItem -Path $globalStorage -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -like 'github.copilot*' }
    $candidates += $copilotGlobalData
  }

  $logsDir = Join-Path $baseDir 'logs'
  if (Test-Path $logsDir) {
    $copilotLogs = Get-ChildItem -Path $logsDir -Recurse -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -like '*copilot*' }
    $candidates += $copilotLogs
  }

  return $candidates | Sort-Object -Property FullName -Unique
}

$codeUserDirs = @(
  (Join-Path $env:APPDATA 'Code\User'),
  (Join-Path $env:APPDATA 'Code - Insiders\User')
)

Write-Section 'Scanning VS Code user data for stale Copilot caches'
$targets = @()
foreach ($dir in $codeUserDirs) {
  $targets += Collect-CandidatePaths -baseDir $dir
}
$targets = $targets | Sort-Object -Property FullName -Unique

if ($targets.Count -eq 0) {
  Write-Host 'No Copilot cache folders found. Nothing to clean.' -ForegroundColor Green
  exit 0
}

Write-Host "Found $($targets.Count) candidate folders:" -ForegroundColor Yellow
$targets | ForEach-Object { Write-Host " - $($_.FullName)" }

if (-not $Apply) {
  Write-Section 'Dry run only'
  Write-Host 'No files were deleted.' -ForegroundColor Green
  Write-Host 'Run with -Apply to remove these folders and reset Copilot local cache.' -ForegroundColor Yellow
  exit 0
}

Write-Section 'Applying cleanup'
Get-Process -Name Code, 'Code - Insiders' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$deleted = 0
foreach ($path in $targets) {
  if (Test-Path $path.FullName) {
    Remove-Item -Path $path.FullName -Recurse -Force -ErrorAction SilentlyContinue
    $deleted++
  }
}

Write-Host "Deleted $deleted folders." -ForegroundColor Green

if ($RestartVSCode) {
  Write-Section 'Restarting VS Code'
  $codeCmd = Get-Command code -ErrorAction SilentlyContinue
  if ($null -ne $codeCmd) {
    Start-Process -FilePath $codeCmd.Source -ArgumentList '.' | Out-Null
    Write-Host 'VS Code restart requested.' -ForegroundColor Green
  } else {
    Write-Host 'Could not find `code` in PATH. Start VS Code manually.' -ForegroundColor Yellow
  }
}

Write-Section 'Next step'
Write-Host 'Open VS Code, sign in to GitHub Copilot if prompted, then test model picker again.' -ForegroundColor Cyan
