@echo off
title PastPortals - Restart Server
cls

echo.
echo ========================================================
echo    🔄 RESTARTING PASTPORTALS
echo ========================================================
echo.

echo [1/2] Stopping existing server...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 >nul

echo [2/2] Starting fresh server...
echo.

cd /d "%~dp0frontend"
start /B npm start

echo.
echo ✅ Server restarted!
echo 🌐 Opening http://localhost:3000
echo.
echo You can close this window in 10 seconds...
timeout /t 10
exit
