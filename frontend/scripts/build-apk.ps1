param(
  [ValidateSet('assembleDebug', 'assembleRelease', 'bundleRelease')]
  [string]$Task = 'assembleRelease'
)

$ErrorActionPreference = 'Stop'
$frontendDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not $env:VITE_API_ORIGIN) {
  $env:VITE_API_ORIGIN = 'https://foodcalorie.gakiwoo.com'
}

Push-Location $frontendDir
try {
  npm run build:apk
  if ($LASTEXITCODE -ne 0) { throw 'Web assets build failed' }

  npx cap sync android
  if ($LASTEXITCODE -ne 0) { throw 'Capacitor sync failed' }

  Push-Location (Join-Path $frontendDir 'android')
  try {
    .\gradlew.bat $Task --no-daemon
    if ($LASTEXITCODE -ne 0) { throw "Android build failed: $Task" }
  } finally {
    Pop-Location
  }
} finally {
  Pop-Location
}

Write-Host "Android build completed: $Task"
