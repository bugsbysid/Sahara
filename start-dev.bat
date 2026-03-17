@echo off
REM Sahara Development Startup Script for Windows
REM This script starts both backend and frontend servers

echo.
echo Starting Sahara Development Servers...
echo.

REM Check if .env files exist
if not exist "backend\.env" (
    echo Warning: backend\.env not found!
    echo Please copy backend\env.example to backend\.env and configure it.
    echo.
)

if not exist "frontend\.env.local" (
    echo Warning: frontend\.env.local not found!
    echo Please copy frontend\.env.local.example to frontend\.env.local
    echo.
)

REM Check if node_modules exist
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting servers...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop servers
echo.

REM Start backend in new window
start "Sahara Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Sahara Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Close the windows to stop the servers.
echo.
pause
