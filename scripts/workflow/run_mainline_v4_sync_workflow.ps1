[CmdletBinding()]
param(
    [string]$PythonExe = "",
    [int]$CheckFrame = 350,
    [switch]$SkipEventBuild,
    [switch]$SkipBboxExtract,
    [switch]$SkipStill,
    [switch]$SkipRender
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$OutputDir = Join-Path $RepoRoot "outputs\mainline_v4_sync"
$RemotionDir = Join-Path $RepoRoot "apps\remotion_director"

function Resolve-WorkflowPython {
    if ($PythonExe -and (Test-Path -LiteralPath $PythonExe)) {
        return (Resolve-Path -LiteralPath $PythonExe).Path
    }

    $BundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if (Test-Path -LiteralPath $BundledPython) {
        return (Resolve-Path -LiteralPath $BundledPython).Path
    }

    $SystemPython = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($SystemPython) {
        return $SystemPython.Source
    }

    throw "Could not find python.exe. Pass -PythonExe with a Python that has pdfplumber and Pillow installed."
}

function Invoke-CheckedNative {
    param(
        [string]$Name,
        [string]$FilePath,
        [string[]]$ArgumentList
    )

    & $FilePath @ArgumentList
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE"
    }
}

function Invoke-RemotionStill {
    param([string]$OutputPath)

    $Npm = Get-Command npm.cmd -ErrorAction Stop
    Invoke-CheckedNative `
        -Name "remotion still" `
        -FilePath $Npm.Source `
        -ArgumentList @(
            "exec",
            "--",
            "remotion",
            "still",
            "src/index.ts",
            "EvidenceSourceZoomDemo",
            $OutputPath,
            "--frame=$CheckFrame"
        )
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$Python = Resolve-WorkflowPython

if (-not $SkipEventBuild) {
    Invoke-CheckedNative `
        -Name "sync event build" `
        -FilePath $Python `
        -ArgumentList @((Join-Path $PSScriptRoot "build_sync_v4_package.py"))
}

if (-not $SkipBboxExtract) {
    Invoke-CheckedNative `
        -Name "cnnic pdf bbox extract" `
        -FilePath $Python `
        -ArgumentList @((Join-Path $RepoRoot "scripts\pdf_bbox\extract_cnnic_pdf_bbox.py"))
}

Push-Location $RemotionDir
try {
    if (-not $SkipStill) {
        $StillPath = Join-Path $OutputDir "check_frame_${CheckFrame}_workflow.jpg"
        Invoke-RemotionStill -OutputPath $StillPath
    }

    if (-not $SkipRender) {
        $Npm = Get-Command npm.cmd -ErrorAction Stop
        Invoke-CheckedNative `
            -Name "remotion render v4" `
            -FilePath $Npm.Source `
            -ArgumentList @("run", "render:demo")
    }
}
finally {
    Pop-Location
}

$Result = [ordered]@{
    video = (Join-Path $RepoRoot "outputs\evidence_source_zoom_demo.mp4")
    bboxJson = (Join-Path $OutputDir "cnnic_pdf_bbox.json")
    bboxDebugImage = (Join-Path $OutputDir "cnnic_pdf_bbox_debug.png")
    workflowStill = (Join-Path $OutputDir "check_frame_${CheckFrame}_workflow.jpg")
    renderSkipped = [bool]$SkipRender
}

$Result | ConvertTo-Json -Depth 3
