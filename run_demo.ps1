# FairLens India - Unified Full-Stack Launch Script
# Starts:
#   1. Sandbox "Biased Bank" API (port 8010)
#   2. FastAPI Autonomous Audit Service (port 8020)
#   3. React/Vite Evidence Arena & Dashboard (port 5173)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         FairLens India - Multi-Agent AI Auditor          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Resolve Python executable
$pyCandidates = @(
    (Join-Path $root ".venv\Scripts\python.exe"),
    "C:\Users\manth\AppData\Local\Programs\Python\Python314\python.exe",
    "python"
)

$py = $null
foreach ($cand in $pyCandidates) {
    if (Test-Path $cand) {
        $py = $cand
        break
    }
}
if (-not $py) { $py = "python" }

Write-Host "[1/3] Using Python: $py" -ForegroundColor Green
$env:PYTHONPATH = $root

# 2. Check Sandbox API
$sandboxPort = if ($env:FAIRLENS_SANDBOX_PORT) { [int]$env:FAIRLENS_SANDBOX_PORT } else { 8010 }
$servicePort = if ($env:FAIRLENS_SERVICE_PORT) { [int]$env:FAIRLENS_SERVICE_PORT } else { 8020 }

Write-Host "[2/3] Starting Backend Services..." -ForegroundColor Green
$sandboxProc = Start-Process -FilePath $py `
    -ArgumentList "-m", "sandbox.serve", "--host", "127.0.0.1", "--port", "$sandboxPort", "--log-level", "warning" `
    -PassThru -NoNewWindow

$serviceProc = Start-Process -FilePath $py `
    -ArgumentList "-m", "api.serve" `
    -Environment @{ PYTHONPATH = $root; FAIRLENS_SERVICE_PORT = "$servicePort" } `
    -PassThru -NoNewWindow

# Wait for backend health
Write-Host "      Waiting for services to become healthy..." -ForegroundColor Gray
$sandboxUrl = "http://127.0.0.1:$sandboxPort"
$serviceUrl = "http://127.0.0.1:$servicePort"

$ready = $false
for ($i = 0; $i -lt 40; $i++) {
    try {
        $r1 = Invoke-WebRequest -UseBasicParsing -Uri "$sandboxUrl/health" -TimeoutSec 1
        $r2 = Invoke-WebRequest -UseBasicParsing -Uri "$serviceUrl/health" -TimeoutSec 1
        if ($r1.StatusCode -eq 200 -and $r2.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch { }
    Start-Sleep -Milliseconds 250
}

if (-not $ready) {
    Write-Warning "Backend health checks took longer than expected. Continuing..."
} else {
    Write-Host "      + Sandbox Bank API: $sandboxUrl" -ForegroundColor Cyan
    Write-Host "      + Audit Engine API: $serviceUrl" -ForegroundColor Cyan
}

# 3. Start Frontend
Write-Host "[3/3] Starting React Arena Dashboard on http://localhost:5173 ..." -ForegroundColor Green
$frontendDir = Join-Path $root "web"

$npmCmd = "npm.cmd"
if (-not (Get-Command $npmCmd -ErrorAction SilentlyContinue)) {
    $npmCmd = "npm"
}

$frontendProc = Start-Process -FilePath $npmCmd `
    -ArgumentList "run", "dev" `
    -WorkingDirectory $frontendDir `
    -PassThru -NoNewWindow

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  FairLens India is LIVE!                                 " -ForegroundColor Yellow
Write-Host "  Dashboard:     http://localhost:5173                    " -ForegroundColor White
Write-Host "  Audit Service: $serviceUrl                              " -ForegroundColor White
Write-Host "  Demo Flow:     Model 2 (Gender) -> Model 7 (Confounded) " -ForegroundColor White
Write-Host "                 -> Model 5 (Intersectional)              " -ForegroundColor White
Write-Host "  Press Ctrl+C to terminate all servers.                  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

try {
    # Keep script open and monitor processes
    while ($true) {
        if ($sandboxProc.HasExited -or $serviceProc.HasExited -or $frontendProc.HasExited) {
            break
        }
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nStopping FairLens services..." -ForegroundColor Red
    Stop-Process -Id $sandboxProc.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $serviceProc.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProc.Id -ErrorAction SilentlyContinue
}
