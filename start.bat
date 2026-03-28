@echo off
setlocal
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo Starting PG Trust (backend + frontend)...
echo.

rem Use PowerShell so paths with spaces work reliably
start "PG Trust - Backend" powershell -NoExit -Command "Set-Location -LiteralPath '%BACKEND%'; python -m uvicorn app.main:app --reload --port 8000"
start "PG Trust - Frontend" powershell -NoExit -Command "Set-Location -LiteralPath '%FRONTEND%'; npm run dev"

echo.
echo Two windows should open:
echo   Backend:  http://127.0.0.1:8000  (docs: http://127.0.0.1:8000/docs)
echo   Frontend: http://localhost:3000
echo.
echo Close each window to stop that server.
pause
