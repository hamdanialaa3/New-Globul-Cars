@echo off
echo === Start dev on port 3000 ===
cd /d "%~dp0"
set PORT=3000
set NODE_OPTIONS=--max_old_space_size=4096
npm start
n