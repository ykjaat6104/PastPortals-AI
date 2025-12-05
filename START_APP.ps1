# PastPortals - PowerShell Launcher
# Runs server in background, safe to close PowerShell window

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   🌍  PASTPORTALS - BACKGROUND LAUNCHER" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Cyan

# Get project directory
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Install from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "[1/2] Checking dependencies..." -ForegroundColor Yellow
Set-Location "$ProjectDir\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "Dependencies OK ✓" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/2] Starting server in background..." -ForegroundColor Yellow
Write-Host ""

# Start server in background (detached process)
$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "npm"
$processInfo.Arguments = "start"
$processInfo.WorkingDirectory = "$ProjectDir\frontend"
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $processInfo
$process.Start() | Out-Null

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   ✅ SERVER STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Cyan

Write-Host "🌐 Application URL: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Server is running in BACKGROUND" -ForegroundColor Yellow
Write-Host "📌 You can CLOSE this window safely" -ForegroundColor Yellow
Write-Host "📌 Process ID: $($process.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  To STOP the server:" -ForegroundColor Red
Write-Host "   • Run: " -NoNewline
Write-Host "STOP_APP.bat" -ForegroundColor Cyan
Write-Host "   • Or: Task Manager → End node.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================================`n" -ForegroundColor Cyan

# Wait and auto-close
Write-Host "Window will close in 8 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 8
