@echo off
title PastPortals - Persistent Server
cls

echo.
echo ========================================================
echo    🌍  PASTPORTALS - PERSISTENT SERVER
echo    Runs in background - Safe to close this window
echo ========================================================
echo.

:: Set the project directory
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Install from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

:: Install dependencies if needed
echo [1/2] Checking frontend dependencies...
cd "%PROJECT_DIR%frontend"
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed ✓
)

echo.
echo [2/2] Starting React development server...
echo.
echo ⚡ Server will run in DETACHED mode
echo ⚡ You can safely CLOSE this window
echo ⚡ Server will keep running in background
echo.

:: Start the server detached using PowerShell
powershell -Command "Start-Process -NoNewWindow -FilePath 'npm' -ArgumentList 'start' -WorkingDirectory '%PROJECT_DIR%frontend'"

echo.
echo ========================================================
echo    ✅ SERVER STARTED SUCCESSFULLY!
echo ========================================================
echo.
echo 🌐 Application URL: http://localhost:3000
echo.
echo 📌 Server is running in the background
echo 📌 You can close this window safely
echo.
echo ⚠️  To STOP the server:
echo    1. Open Task Manager (Ctrl+Shift+Esc)
echo    2. Find "node.exe" process
echo    3. Right-click → End Task
echo.
echo    OR run: STOP_APP.bat
echo.
echo ========================================================

timeout /t 10
exit
