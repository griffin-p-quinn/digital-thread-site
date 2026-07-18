param(
  [string]$Output = "teamcenter-graph-digital-fabric.zip"
)

$root = $PSScriptRoot
$stage = Join-Path $env:TEMP 'df-site-package-stage'
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

# Copy root HTML pages explicitly.
Get-ChildItem -Path $root -Filter '*.html' -File | ForEach-Object {
  Copy-Item $_.FullName $stage -Force
}

# Copy static site folders/files needed for standalone hosting.
foreach ($entry in @('styles', 'assets', 'projects', 'sitemap.xml', 'robots.txt', 'serve.ps1', 'WEBSTATE.md')) {
  $source = Join-Path $root $entry
  if (Test-Path $source) { Copy-Item $source $stage -Recurse -Force }
}

$zipPath = Join-Path $root $Output
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath -Force
Remove-Item $stage -Recurse -Force
Write-Host "Created package: $zipPath"
