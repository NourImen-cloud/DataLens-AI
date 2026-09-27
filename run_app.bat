@echo off
setlocal
echo ================================================================
echo                   DATALENS AI - FAST LAUNCH
echo     "Upload your data. Ask anything. Understand everything."
echo ================================================================
echo.

if not "%~1"=="" (
    echo Launching on requested port %~1...
    python "%~dp0run.py" --port %~1
) else (
    echo Auto-detecting available port to prevent port conflicts...
    python "%~dp0run.py"
)

pause
