@echo off
title 3+2 Specialty Coffee — Admin System
color 0A

echo.
echo  ========================================
echo   3+2 Specialty Coffee — Admin Launcher  
echo  ========================================
echo.

:: Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

:: Check if admin-server dependencies are installed
if not exist "admin-server\node_modules" (
    echo Installing admin server dependencies...
    cd admin-server
    npm install
    cd ..
    echo Dependencies installed.
    echo.
)

:: Check if .env exists in admin-server
if not exist "admin-server\.env" (
    echo.
    echo WARNING: admin-server\.env not found!
    echo Please create admin-server\.env based on admin-server\.env.example
    echo.
    pause
    exit /b 1
)

echo Starting admin backend...
echo.

:: Start admin backend in background
start "3+2 Admin Backend" cmd /k "cd admin-server && node src/server.js"

:: Wait 2 seconds for backend to start
timeout /t 2 /nobreak >nul

:: Open admin dashboard in Chrome
echo Opening admin dashboard in browser...
start chrome "http://127.0.0.1:3001/#/admin" 2>nul || start msedge "http://127.0.0.1:3001/#/admin" 2>nul || start "http://127.0.0.1:3001/#/admin"

echo.
echo  Admin system is running!
echo  Admin URL: http://127.0.0.1:3001/#/admin
echo  Customer website: https://[your-username].github.io/3-plus-2-specialty-coffee/
echo.
echo  Close the "3+2 Admin Backend" window to stop the server.
echo.
