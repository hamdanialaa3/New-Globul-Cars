@echo off
cd /d "c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
set NODE_OPTIONS=--max-old-space-size=4096
set SKIP_PREFLIGHT_CHECK=true
npm start > build-output.txt 2>&1
type build-output.txt
pause
