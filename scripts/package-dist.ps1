param([string]$OutputPath = 'dist.zip')

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$distributionPath = Join-Path $projectRoot 'dist'
if (-not (Test-Path -LiteralPath (Join-Path $distributionPath 'index.html'))) {
    throw 'dist/index.html is missing.'
}
if (-not [IO.Path]::IsPathRooted($OutputPath)) {
    $OutputPath = Join-Path $projectRoot $OutputPath
}
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($OutputPath)) | Out-Null
$assets = @(Get-ChildItem -LiteralPath $distributionPath -Force |
    Where-Object { $_.Name -ne '.openai' } |
    Sort-Object Name)
Compress-Archive -LiteralPath $assets.FullName -DestinationPath $OutputPath -CompressionLevel Optimal -Force

$archive = [IO.Compression.ZipFile]::OpenRead($OutputPath)
try {
    $names = @($archive.Entries.FullName)
    foreach ($required in @('index.html', 'tutorials.html', 'library.html', 'vendor/three.module.js', 'ALGORITHM-LICENSE.txt', 'sw.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png')) {
        if ($names -notcontains $required) { throw "Required asset missing from archive: $required" }
    }
    if ($names | Where-Object { $_ -match '(^|/)(\.git|node_modules|\.openai)(/|$)' }) {
        throw 'Archive contains non-runtime metadata.'
    }
    Write-Output "Packaged $($archive.Entries.Count) assets: $OutputPath"
} finally {
    $archive.Dispose()
}
