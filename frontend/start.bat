@echo off
REM Start both backend and frontend easily on Windows

REM Always run from this script's directory (frontend\)
setlocal
pushd "%~dp0"

echo.
echo ====================================================================
echo   Starting Product Recommendation System
echo ====================================================================
echo.

echo [1/2] Starting Backend (Flask)...
pushd "..\backend"
start "Backend Server" cmd /k python app.py
popd
timeout /t 3 /nobreak

echo [2/2] Starting Frontend (React/Vite)...
start "Frontend Server" cmd /k npm run dev

echo.
echo ====================================================================
echo   System Started Successfully!
echo ====================================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Close the command windows to stop the servers.
echo.
pause

popd
