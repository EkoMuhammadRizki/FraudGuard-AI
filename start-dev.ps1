# FraudGuard-AI — Start Script
# Jalankan file ini di PowerShell untuk menjalankan Python API + Next.js bersamaan
# Usage: .\start-dev.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   FraudGuard-AI Development Server Launcher" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$PYTHON_API_DIR = Join-Path $ROOT "python-api"

# Start Python ML API in a new PowerShell window
Write-Host "[1/2] Starting Python ML Inference API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PYTHON_API_DIR'; Write-Host 'Starting FraudGuard Python ML API...' -ForegroundColor Cyan; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
)

Start-Sleep -Seconds 2

# Start Next.js dev server in a new PowerShell window
Write-Host "[2/2] Starting Next.js Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ROOT'; Write-Host 'Starting Next.js Dev Server...' -ForegroundColor Cyan; npm run dev"
)

Write-Host ""
Write-Host "Both servers are starting in separate windows:" -ForegroundColor Green
Write-Host "  - Python ML API : http://localhost:8000" -ForegroundColor Green
Write-Host "  - Python Swagger : http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  - Next.js App   : http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Wait about 30-60 seconds for Python to load all ML models (~40MB)." -ForegroundColor Yellow
