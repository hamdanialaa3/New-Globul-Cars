@echo off
echo ===================================
echo تنظيف Cache وإعادة تشغيل Dev Server
echo ===================================

:: Stop any running processes on port 3000
echo توقيف Server القديم...
taskkill /F /IM node.exe 2>nul

:: Clear node modules cache
echo تنظيف Cache...
rmdir /S /Q node_modules\.cache 2>nul

:: Clear build cache
rmdir /S /Q build 2>nul

:: Start fresh
echo بدء Server جديد...
npm start

pause

