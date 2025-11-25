#!/bin/bash
# ========================================
# Complete Cache Clear & Rebuild
# حل شامل لمشكلة عدم تحديث الألوان
# ========================================

echo "🧹 تنظيف شامل للكاش..."
echo ""

# الانتقال إلى مجلد التطبيق
cd bulgarian-car-marketplace

# 1. حذف جميع ملفات الكاش
echo "🗑️  حذف ملفات الكاش..."
rm -rf node_modules/.cache
rm -rf .cache
rm -rf build
rm -rf .webpack-cache
rm -rf public/static

# 2. حذف Service Workers (قد تسبب مشاكل كاش)
rm -rf public/sw.js
rm -rf public/workbox-*.js

echo ""
echo "✅ تم حذف ملفات الكاش"
echo ""

# 3. إعادة البناء
echo "🔨 إعادة البناء..."
npm run build

echo ""
echo "✅ تم البناء بنجاح!"
echo ""

# 4. تعليمات للمستخدم
echo "📋 خطوات إضافية:"
echo "  1. في المتصفح: Ctrl+Shift+Delete → امسح الكاش"
echo "  2. أو استخدم وضع Incognito: Ctrl+Shift+N"
echo "  3. شغّل: npm start"
echo "  4. عند فتح الصفحة: اضغط Ctrl+F5 (Hard Refresh)"
echo ""
echo "🌐 الصفحة: http://localhost:3000/car/1yzZjuCay3kAdNJUPkzy"
echo ""
