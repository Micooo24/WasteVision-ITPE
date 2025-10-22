:: filepath: e:\Rajesh\WasteVision-ITPE\backend\start-all.bat
@echo off
echo ================================================
echo Starting WasteVision Backend and ML Service
echo ================================================
echo.

:: Get the directory where this script is located
cd /d %~dp0

:: Start Backend Server in a new window
echo [1/2] Starting Backend Server...
start "WasteVision - Backend Server" cmd /k "npm run start"

:: Wait a bit for backend to initialize
timeout /t 3 /nobreak >nul

:: Start ML Service in virtual environment in a new window
echo [2/2] Starting ML Service (Python venv)...
start "WasteVision - ML Service" cmd /k "cd ..\ml_service && .\venv\Scripts\activate && python main.py"

echo.
echo ================================================
echo Both services are starting in separate windows
echo ================================================
echo Backend Server: http://localhost:4000
echo ML Service: http://localhost:5000
echo.
echo Close this window after services are running.
pause