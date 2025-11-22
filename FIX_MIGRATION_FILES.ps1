# Fix Missing Migration Files in Git Worktree
# This script creates missing migration files to fix Git worktree issues

$projectPath = "C:\Users\hamda\Desktop\New Globul Cars"
$worktreePath = "C:\Users\hamda\.cursor\worktrees\New_Globul_Cars\WjZtV"

$migrationFiles = @(
    "MIGRATION_PLAN_DETAILED.md",
    "MIGRATION_PROGRESS.md",
    "MIGRATION_REPORT_PHASE1.md",
    "COMPLETE_MIGRATION_STATUS.md",
    "FINAL_MIGRATION_REPORT.md"
)

foreach ($file in $migrationFiles) {
    $projectFile = Join-Path $projectPath $file
    $worktreeFile = Join-Path $worktreePath $file
    
    if (-not (Test-Path $projectFile)) {
        $content = "# $file (Archived)`n# This file was recreated to fix Git worktree issue.`n# Original content has been moved to docs/migration/"
        $content | Out-File -FilePath $projectFile -Encoding UTF8
        Write-Host "Created: $file" -ForegroundColor Green
    }
    
    if (-not (Test-Path $worktreeFile)) {
        Copy-Item $projectFile -Destination $worktreeFile -Force -ErrorAction SilentlyContinue
        Write-Host "Copied to worktree: $file" -ForegroundColor Green
    }
}

Write-Host "`n✅ Done!" -ForegroundColor Green
