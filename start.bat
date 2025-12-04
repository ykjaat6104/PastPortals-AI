@echo off
title AI Museum Guide - Professional Full Stack Application
cls

echo.
echo ========================================
echo    🏛️  AI MUSEUM GUIDE
echo    Professional Full Stack Application  
echo ========================================
echo.

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Python and Node.js detected
echo.

echo [1/4] Setting up Python backend environment...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo [2/4] Installing frontend dependencies...
cd ..\frontend
call npm install

echo.
echo [3/4] Starting backend server...
cd ..\backend
start "AI Museum Guide - Backend" cmd /k "venv\Scripts\activate.bat && python app.py"

echo.
echo [4/4] Starting frontend development server...
cd ..\frontend
start "AI Museum Guide - Frontend" cmd /k "npm start"

echo.
echo ========================================
echo    🚀 APPLICATION STARTING...
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend UI: http://localhost:3000
echo.
echo The application will open automatically in your browser.
echo.
echo 📝 SETUP CHECKLIST:
echo 1. ✅ Backend server starting on port 5000
echo 2. ✅ Frontend server starting on port 3000  
echo 3. ⏳ Get your Google Gemini API key
echo 4. ⏳ Configure API in the frontend
echo.
echo 🔑 Get API Key: https://makersuite.google.com/app/apikey
echo.
echo Press any key to close this setup window...
pause >nul