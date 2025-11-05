@echo off
echo ===================================
echo تنظيف شامل لجميع Cache
echo ===================================

echo 1. إيقاف Server...
taskkill /F /IM node.exe 2>nul

echo 2. حذف node_modules\.cache...
rmdir /S /Q node_modules\.cache 2>nul

echo 3. حذف build folder...
rmdir /S /Q build 2>nul

echo 4. حذف .eslintcache...
del /F /Q .eslintcache 2>nul

echo.
echo ===================================
echo تم التنظيف بنجاح!
echo الآن شغّل: npm start
echo ===================================
pause

