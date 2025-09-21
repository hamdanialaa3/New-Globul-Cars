@echo off
echo ============================================
echo    تخصيص النظام الأزرق
echo ============================================
echo.
echo النظام الحالي: أزرق احترافي (#007BFF)
echo.
echo اختر التخصيص المطلوب:
echo [1] أزرق أغمق (للمشاريع الرسمية)
echo [2] أزرق أفتح (للمشاريع الحديثة)
echo [3] أزرق ملكي (للمشاريع الفاخرة)
echo [4] تركواز (للمشاريع الطبيعية)
echo [5] أزرق بحري (للمشاريع التقليدية)
echo [6] العودة للأزرق الأساسي
echo.
set /p choice="اختر رقم التخصيص (1-6): "

if "%choice%"=="1" goto darkblue
if "%choice%"=="2" goto lightblue
if "%choice%"=="3" goto royalblue
if "%choice%"=="4" goto turquoise
if "%choice%"=="5" goto navyblue
if "%choice%"=="6" goto defaultblue
goto invalid

:darkblue
echo تطبيق الأزرق الداكن...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#0056CC'', light: ''#3385DD'', dark: ''#004499'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#495057'', light: ''#6C757D'', dark: ''#343A40'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#1E3A8A'', light: ''#4169E1'', dark: ''#152254'', contrastText: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:lightblue
echo تطبيق الأزرق الفاتح...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#4DA6FF'', light: ''#7FBFFF'', dark: ''#1A8CFF'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#ADB5BD'', light: ''#CED4DA'', dark: ''#6C757D'', contrastText: ''#000000'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#6495ED'', light: ''#87CEEB'', dark: ''#4169E1'', contrastText: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:royalblue
echo تطبيق الأزرق الملكي...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#4169E1'', light: ''#6495ED'', dark: ''#1E3A8A'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#6C757D'', light: ''#ADB5BD'', dark: ''#495057'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#1E90FF'', light: ''#87CEFA'', dark: ''#0000CD'', contrastText: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:turquoise
echo تطبيق التركواز...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#00CED1'', light: ''#40E0D0'', dark: ''#008B8B'', contrastText: ''#000000'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#20B2AA'', light: ''#7FFFD4'', dark: ''#008080'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#00FFFF'', light: ''#E0FFFF'', dark: ''#00CED1'', contrastText: ''#000000'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:navyblue
echo تطبيق الأزرق البحري...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#000080'', light: ''#0000CD'', dark: ''#000033'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#191970'', light: ''#4169E1'', dark: ''#000033'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#0000CD'', light: ''#1E90FF'', dark: ''#000080'', contrastText: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:defaultblue
echo العودة للأزرق الأساسي...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#007BFF'', light: ''#4DA6FF'', dark: ''#0056CC'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#6C757D'', light: ''#ADB5BD'', dark: ''#495057'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#4169E1'', light: ''#6495ED'', dark: ''#1E3A8A'', contrastText: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:invalid
echo خيار غير صحيح. يرجى اختيار رقم من 1 إلى 6.
pause
goto end

:end
echo.
echo ✅ تم تطبيق التخصيص بنجاح!
echo.
echo لترى التغييرات:
echo 1. تأكد من تشغيل الخادم (npm start)
echo 2. افتح http://localhost:3002 في المتصفح
echo 3. شاهد التغييرات فوراً
echo.
echo لتخصيص إضافي، غير الألوان مباشرة في:
echo bulgarian-car-marketplace\src\styles\theme.ts
echo.
pause