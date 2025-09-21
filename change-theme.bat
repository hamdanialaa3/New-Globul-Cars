@echo off
echo ============================================
echo    أداة تغيير مظهر Globul Cars
echo ============================================
echo.
echo الألوان المتاحة:
echo [1] الأزرق الاحترافي
echo [2] الأخضر الطبيعي
echo [3] الأحمر الجريء
echo [4] البنفسجي الأنيق
echo [5] الداكن العصري
echo [6] البسيط الرمادي
echo [7] العودة للأصفر الافتراضي
echo.
set /p choice="اختر رقم المظهر (1-7): "

if "%choice%"=="1" goto blue
if "%choice%"=="2" goto green
if "%choice%"=="3" goto red
if "%choice%"=="4" goto purple
if "%choice%"=="5" goto dark
if "%choice%"=="6" goto minimal
if "%choice%"=="7" goto default
goto invalid

:blue
echo تطبيق المظهر الأزرق...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#007BFF'', light: ''#4DA6FF'', dark: ''#0056CC'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#6C757D'', light: ''#ADB5BD'', dark: ''#495057'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#28A745'', light: ''#51CF66'', dark: ''#1E7E34'', contrastText: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:green
echo تطبيق المظهر الأخضر...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#28A745'', light: ''#51CF66'', dark: ''#1E7E34'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#6C757D'', light: ''#ADB5BD'', dark: ''#495057'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#007BFF'', light: ''#4DA6FF'', dark: ''#0056CC'', contrastText: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:red
echo تطبيق المظهر الأحمر...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#DC3545'', light: ''#E4606D'', dark: ''#BD2130'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#6C757D'', light: ''#ADB5BD'', dark: ''#495057'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#FFC107'', light: ''#FFCA2C'', dark: ''#D39E00'', contrastText: ''#000000'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:purple
echo تطبيق المظهر البنفسجي...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#6F42C1'', light: ''#9B59B6'', dark: ''#5B2C6F'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#6C757D'', light: ''#ADB5BD'', dark: ''#495057'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#E83E8C'', light: ''#F06292'', dark: ''#C2185B'', contrastText: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:dark
echo تطبيق المظهر الداكن...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#343A40'', light: ''#6C757D'', dark: ''#212529'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#6C757D'', light: ''#ADB5BD'', dark: ''#495057'', contrastText: ''#FFFFFF'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#FFC107'', light: ''#FFCA2C'', dark: ''#D39E00'', contrastText: ''#000000'' }' -replace 'background: \{[^}]*\}', 'background: { default: ''#212529'', paper: ''#343A40'' }' -replace 'text: \{[^}]*\}', 'text: { primary: ''#FFFFFF'', secondary: ''#ADB5BD'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:minimal
echo تطبيق المظهر البسيط...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#6C757D'', light: ''#ADB5BD'', dark: ''#495057'', contrastText: ''#FFFFFF'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#ADB5BD'', light: ''#CED4DA'', dark: ''#6C757D'', contrastText: ''#000000'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#495057'', light: ''#6C757D'', dark: ''#343A40'', contrastText: ''#FFFFFF'' }' -replace 'background: \{[^}]*\}', 'background: { default: ''#F8F9FA'', paper: ''#FFFFFF'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:default
echo العودة للمظهر الافتراضي...
powershell -Command "(Get-Content 'bulgarian-car-marketplace\src\styles\theme.ts') -replace 'primary: \{[^}]*\}', 'primary: { main: ''#FFD700'', light: ''#FFFF99'', dark: ''#B8860B'', contrastText: ''#000000'' }' -replace 'secondary: \{[^}]*\}', 'secondary: { main: ''#FFA500'', light: ''#FFBF00'', dark: ''#CC8400'', contrastText: ''#000000'' }' -replace 'accent: \{[^}]*\}', 'accent: { main: ''#FF6B35'', light: ''#FF8A65'', dark: ''#E64A19'', contrastText: ''#FFFFFF'' }' -replace 'background: \{[^}]*\}', 'background: { default: ''#FFFFFF'', paper: ''#F8F9FA'' }' -replace 'text: \{[^}]*\}', 'text: { primary: ''#333333'', secondary: ''#666666'' }' | Set-Content 'bulgarian-car-marketplace\src\styles\theme.ts'"
goto end

:invalid
echo خيار غير صحيح. يرجى اختيار رقم من 1 إلى 7.
pause
goto end

:end
echo.
echo ✅ تم تطبيق المظهر بنجاح!
echo.
echo لترى التغييرات:
echo 1. تأكد من تشغيل الخادم (npm start)
echo 2. افتح http://localhost:3000 في المتصفح
echo 3. شاهد التغييرات فوراً
echo.
pause