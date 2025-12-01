# Fix TypeScript type errors in oauth-handler.ts

$file = "c:\Users\hamda\Desktop\New Globul Cars\functions\src\social-media\oauth-handler.ts"

$content = Get-Content $file -Raw -Encoding UTF8

# Fix remaining type assertions
$content = $content -replace "const \{ access_token, expires_in \} = tokenRes\.data;", "const { access_token, expires_in } = tokenRes.data as any;"
$content = $content -replace "const channel = channelRes\.data\.items\[0\];", "const channel = (channelRes.data as any).items[0];"

# Fix object property access
$content = $content -replace "userRes\.data\.data\.id", "(userRes.data as any).data.id"
$content = $content -replace "userRes\.data\.data\.name", "(userRes.data as any).data.name"
$content = $content -replace "userRes\.data\.data\.username", "(userRes.data as any).data.username"

Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed oauth-handler.ts type assertions" -ForegroundColor Green
