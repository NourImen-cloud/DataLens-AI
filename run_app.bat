@echo off
echo ===================================================
echo             DATALENS AI - FAST LAUNCH
echo   "Upload your data. Ask anything. Understand everything."
echo ===================================================
echo.
cd /d "%~dp0backend"
echo Starting FastAPI Backend + Frontend on http://127.0.0.1:8000 ...
python -m uvicorn main:app --host 127.0.0.1 --port 8000
pause
