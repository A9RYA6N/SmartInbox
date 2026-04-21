@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  SmartInbox  –  Backend Startup Script (Windows)
REM  Run this from the SmartInbox\ project root directory.
REM ─────────────────────────────────────────────────────────────────────────────

echo.
echo  ██████╗ ███╗   ███╗ █████╗ ██████╗ ████████╗
echo  ██╔═══╝ ████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝
echo  ███████╗██╔████╔██║███████║██████╔╝   ██║   
echo  ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║   
echo  ██████╔╝██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   
echo  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
echo.
echo  SmartInbox SMS Spam Detection API
echo  Starting FastAPI backend...
echo.

REM Check we're in the right directory
if not exist "run.py" (
    echo [ERROR] run.py not found. Please run this script from the SmartInbox\ root directory.
    pause
    exit /b 1
)

if not exist ".env" (
    echo [WARN] .env file not found. Using default settings.
)

REM Activate virtual environment if it exists
if exist ".venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment...
    call .venv\Scripts\activate.bat
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Kill any existing process on port 8000
echo [INFO] Checking port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    echo [INFO] Killing existing process %%a on port 8000...
    taskkill /PID %%a /F >nul 2>&1
)

echo [INFO] Starting uvicorn on http://localhost:8000
echo [INFO] API Docs: http://localhost:8000/docs
echo [INFO] Press Ctrl+C to stop
echo.

REM Start uvicorn using the venv explicitly (ensures correct numpy/sklearn match the model)
if exist ".venv\Scripts\python.exe" (
    echo [INFO] Using .venv python -m uvicorn
    ".venv\Scripts\python.exe" -m uvicorn run:app --reload --host 0.0.0.0 --port 8000 --log-level info
) else if exist "venv\Scripts\python.exe" (
    echo [INFO] Using venv python -m uvicorn
    "venv\Scripts\python.exe" -m uvicorn run:app --reload --host 0.0.0.0 --port 8000 --log-level info
) else (
    echo [WARN] No venv found, using system python -m uvicorn
    python -m uvicorn run:app --reload --host 0.0.0.0 --port 8000 --log-level info
)

pause
