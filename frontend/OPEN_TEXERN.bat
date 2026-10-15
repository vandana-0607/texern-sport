
@echo off
cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing website dependencies...
    call npm install
)

start "Texern Sport Server" cmd /k "npm run dev -- --host 127.0.0.1"

timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

exit
