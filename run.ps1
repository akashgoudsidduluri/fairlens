# Model 2, Model 7, Model 5 demo runner
param(
    [switch]$LegacyStreamlit = $false
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $LegacyStreamlit) {
    & (Join-Path $root "run_demo.ps1")
    exit $LASTEXITCODE
}

# Legacy Streamlit UI fallback (Port 8501)
$ErrorActionPreference = "Stop"
Set-Location $root

$pyCandidates = @(
    (Join-Path $root ".venv\Scripts\python.exe"),
    "C:\Users\manth\AppData\Local\Programs\Python\Python314\python.exe",
    "python"
)
$py = $null
foreach ($cand in $pyCandidates) {
    if (Test-Path $cand) { $py = $cand; break }
}
if (-not $py) { $py = "python" }

$apiPort = if ($env:FAIRLENS_API_PORT) { [int]$env:FAIRLENS_API_PORT } else { 8010 }
$uiPort = if ($env:FAIRLENS_UI_PORT) { [int]$env:FAIRLENS_UI_PORT } else { 8501 }
$apiUrl = "http://127.0.0.1:$apiPort"

$api = Start-Process -FilePath $py `
    -ArgumentList "-m","sandbox.serve","--host","127.0.0.1","--port",$apiPort,"--log-level","warning" `
    -PassThru -NoNewWindow
try {
    $ready = $false
    for ($i = 0; $i -lt 80; $i++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri "$apiUrl/health" -TimeoutSec 1
            if ($response.StatusCode -eq 200) { $ready = $true; break }
        } catch { }
        if ($api.HasExited) { break }
        Start-Sleep -Milliseconds 250
    }
    if (-not $ready) {
        throw "Sandbox failed to start on $apiUrl."
    }

    Write-Host "FairLens sandbox: $apiUrl"
    Write-Host "FairLens Streamlit dashboard: http://127.0.0.1:$uiPort"
    $env:FAIRLENS_API_URL = $apiUrl
    $env:PYTHONPATH = $root
    & $py -m streamlit run ui/app.py --server.address 127.0.0.1 --server.port $uiPort
} finally {
    Stop-Process -Id $api.Id -ErrorAction SilentlyContinue
}
