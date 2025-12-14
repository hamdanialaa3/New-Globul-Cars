param(
  [string]$Url = "http://localhost:3000",
  [int]$TimeoutSeconds = 10
)

try {
  $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing
  if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
    Write-Host "Frontend is healthy at $Url (Status: $($response.StatusCode))"
    exit 0
  } else {
    Write-Error "Frontend returned status $($response.StatusCode)"
    exit 1
  }
} catch {
  Write-Error "Health check failed: $($_.Exception.Message)"
  exit 1
}
