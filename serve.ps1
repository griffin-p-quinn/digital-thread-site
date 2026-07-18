<#
.SYNOPSIS
  Serves the static Digital Fabric site - no Node.js required.
  Uses .NET HttpListener built into Windows.

.USAGE
  .\serve.ps1                          # http://localhost:8080
  .\serve.ps1 -Port 9090               # custom port
  .\serve.ps1 -Port 8091 -BindHost +   # bind all interfaces (LAN reachable)
#>
param(
  [int]$Port = 8080,
  [string]$BindHost = 'localhost'
)

$sitePath = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://${BindHost}:$Port/")
$listener.Start()

Write-Host ""
Write-Host "  Digital Fabric - Static Site" -ForegroundColor Cyan
Write-Host "  Serving from: $sitePath" -ForegroundColor DarkGray
Write-Host "  URL:    http://${BindHost}:$Port/" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop" -ForegroundColor DarkGray
Write-Host ""

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.xml'  = 'application/xml; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.jt'   = 'application/octet-stream'
  '.md'   = 'text/plain; charset=utf-8'
}

$blockedRoots = @('node_modules', 'src', 'public', 'dist')

function Resolve-SafePath([string]$RelativePath) {
  $clean = $RelativePath.TrimStart('/').Replace('/', '\')
  if ([string]::IsNullOrWhiteSpace($clean)) { $clean = 'index.html' }
  $first = ($clean -split '\\')[0]
  if ($blockedRoots -contains $first) { return $null }
  $full = Join-Path $sitePath $clean
  $resolved = [System.IO.Path]::GetFullPath($full)
  if (-not $resolved.StartsWith($sitePath, [System.StringComparison]::OrdinalIgnoreCase)) { return $null }
  return $resolved
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $resp = $ctx.Response

    $filePath = Resolve-SafePath $req.Url.LocalPath
    if (-not $filePath) {
      $resp.StatusCode = 403
      $bytes = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
      $resp.OutputStream.Write($bytes, 0, $bytes.Length)
      $resp.OutputStream.Close()
      Write-Host "  403 $($req.HttpMethod) $($req.Url.LocalPath)" -ForegroundColor Yellow
      continue
    }

    if ((Test-Path $filePath) -and (Get-Item $filePath).PSIsContainer) {
      $candidate = Join-Path $filePath 'index.html'
      if (Test-Path $candidate) { $filePath = $candidate }
    }

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $resp.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $resp.ContentLength64 = $bytes.Length
      $resp.StatusCode = 200
      $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $resp.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
      $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    }

    $resp.OutputStream.Close()
    Write-Host "  $($resp.StatusCode) $($req.HttpMethod) $($req.Url.LocalPath)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { 'DarkGray' } else { 'Yellow' })
  }
} finally {
  $listener.Stop()
  Write-Host 'Server stopped.' -ForegroundColor DarkGray
}
