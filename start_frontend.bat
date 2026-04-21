@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  SmartInbox  –  Frontend Dev Server (Windows)
REM  Run this from the SmartInbox\ project root directory.
REM ─────────────────────────────────────────────────────────────────────────────

echo.
echo  Starting SMS Shield AI — Frontend Dev Server
echo  http://localhost:5173
echo.

if not exist "Frontend\package.json" (
    echo [ERROR] Frontend\package.json not found. Run from the SmartInbox root.
    pause
    exit /b 1
)

cd Frontend

if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    npm install --legacy-peer-deps
)

echo [INFO] Starting Vite dev server...
echo [INFO] Backend proxy: http://localhost:8000
echo [INFO] Press Ctrl+C to stop
echo.

npm run dev

pause
