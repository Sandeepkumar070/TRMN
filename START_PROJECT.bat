@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo   TRMN Rack Management System - Start Project
echo ==============================================
echo.

if not exist node_modules\vite\bin\vite.js (
    echo Installing project dependencies...
    echo This is required only the first time or after deleting node_modules.
    call npm install
    if errorlevel 1 (
        echo.
        echo npm install failed. Check your internet connection and Node.js installation.
        pause
        exit /b 1
    )
)

echo.
echo Starting Vite development server...
call npm run dev
pause
