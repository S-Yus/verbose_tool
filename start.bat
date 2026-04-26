@echo off
echo Starting Verbose Tool...

start cmd /k "cd /d %~dp0backend && uvicorn main:app --reload"
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
