@echo off
title Stop PastPortals
cls

echo.
echo ========================================================
echo    🛑 STOPPING PASTPORTALS
echo ========================================================
echo.

echo Stopping all Node.js processes...

:: Kill all node processes
taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ Server stopped successfully!
) else (
    echo ℹ️  No running server found
)

echo.
echo ========================================================
pause
