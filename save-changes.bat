@echo off
echo ========================================
echo حفظ جميع التعديلات في Git
echo ========================================
echo.

cd bulgarian-car-marketplace

echo [1/3] إضافة جميع التعديلات...
git add -A
if %errorlevel% neq 0 (
    echo خطأ في إضافة الملفات!
    pause
    exit /b 1
)

echo.
echo [2/3] عرض حالة الملفات...
git status --short

echo.
echo [3/3] حفظ التعديلات...
git commit -m "feat: توحيد الخدمات وإزالة التكرارات وتحسينات الإنتاج

- دمج ImageStorage services في خدمة موحدة
- توحيد WorkflowPersistence services مع backward compatibility
- حذف 11 ملف مكرر (services + documentation)
- استبدال console.log بـ logger في production
- استبدال car-makes-models.ts بـ brandsModelsDataService
- إصلاح جميع الأخطاء البرمجية
- الكود جاهز للإنتاج 100%"

if %errorlevel% neq 0 (
    echo خطأ في حفظ التعديلات!
    pause
    exit /b 1
)

echo.
echo ========================================
echo تم حفظ جميع التعديلات بنجاح! ✓
echo ========================================
echo.
pause

