@echo off
title PastPortals - Status Check
cls

echo.
echo ========================================================
echo    📊 PASTPORTALS - SERVER STATUS
echo ========================================================
echo.

:: Check if node is running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Server is RUNNING
    echo.
    echo 🌐 Application should be available at: http://localhost:3000
    echo.
    echo Running Node.js processes:
    tasklist /FI "IMAGENAME eq node.exe" /FO TABLE
) else (
    echo ❌ Server is NOT running
    echo.
    echo 💡 To start the server, run: START_APP.bat
)

echo.
echo ========================================================
pause
