# PastPortals - Quick Start
# Double-click to launch server

Write-Host "`n🌍  Starting PastPortals...`n" -ForegroundColor Cyan

Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Stop any existing servers
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 2

# Start fresh
Set-Location "frontend"
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"

Write-Host "✅ Server starting at http://localhost:3000" -ForegroundColor Green
Write-Host "📌 Safe to close this window`n" -ForegroundColor Yellow

Start-Sleep -Seconds 5
exit
