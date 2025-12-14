param()

$dockerPaths = @(
  'C:\Program Files\Docker\Docker\resources\bin',
  'C:\Program Files\Docker\Docker'
)

$currentUserPath = [Environment]::GetEnvironmentVariable('Path','User')
foreach ($p in $dockerPaths) {
  if ($null -ne $p -and $currentUserPath -notlike ("*${p}*")) {
    $currentUserPath = "$currentUserPath;$p"
  }
}
[Environment]::SetEnvironmentVariable('Path',$currentUserPath,'User')
Write-Host "User PATH updated."

Write-Host "Current User PATH includes:";
foreach ($p in $dockerPaths) {
  if ($currentUserPath -like ("*${p}*")) { Write-Host " - $p" }
}