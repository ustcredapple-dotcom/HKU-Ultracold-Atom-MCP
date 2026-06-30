@echo off
setlocal
set PORT=8765
cd /d "%~dp0..\.."
start "" "http://127.0.0.1:%PORT%/Speaker/Lab_Wiring_Editor/web/index.html"
python -m http.server %PORT% --bind 127.0.0.1
pause
