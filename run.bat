@echo off
echo ========================================================
echo  RouteX - Intelligent Last-Mile Delivery Optimizer
echo  DAA PBL Project Launch Script
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Python FastAPI Backend on port 8001...
set PYTHONPATH=.
start "RouteX Backend Server" backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001

timeout /t 2 /nobreak > nul

echo [2/2] Starting Vite React Frontend on port 5173...
cd frontend
start "RouteX Frontend App" npm run dev

echo.
echo ========================================================
echo  RouteX is running!
echo  Open your web browser at: http://localhost:5173
echo ========================================================
echo.
pause
