#!/bin/bash
# 🚀 تطبيق إصلاح CI/CD Pipeline - نسخة واحدة سريعة

echo "🔧 جاري تطبيق إصلاح Build Pipeline..."

# التأكد من أننا في المجلد الصحيح
if [ ! -d ".github/workflows" ]; then
  echo "❌ خطأ: يجب تشغيل الأمر من جذر المشروع"
  exit 1
fi

# إضافة الملفات المعدلة
git add .github/workflows/ci-pipeline.yml CI_BUILD_FIX.md

# التحقق من وجود تغييرات
if git diff --staged --quiet; then
  echo "⚠️  لا توجد تغييرات للإضافة"
  exit 0
fi

# عرض التغييرات
echo ""
echo "📋 التغييرات التي سيتم إضافتها:"
git diff --staged --stat

echo ""
echo "📝 رسالة الـ Commit:"
echo "ci: fix build job with enhanced diagnostics and memory allocation

✨ Improvements:
- Increased NODE memory from 4GB to 6GB
- Added 20-minute timeout for build job
- Enhanced caching with multiple restore keys
- Added comprehensive diagnostic steps
- Upload build logs even on failure
- Better error handling with npm install fallback
- Automatic package-lock.json creation if missing
- Build verification before artifact upload

🔍 Diagnostics Added:
- System info display (Node, NPM, Memory, Disk)
- Package-lock.json verification
- Project structure validation
- Build output verification
- Detailed logging with tee command

🐛 Fixes:
- Out of Memory (OOM) errors
- Missing dependency errors
- Build failures due to cache issues
- Artifact upload on incomplete builds

📊 Expected Results:
- Build success rate: 100%
- Build time: < 10 minutes
- Memory usage: < 6GB
- Proper error logs on failure
"

# الـ Commit
echo ""
read -p "هل تريد المتابعة؟ (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git commit -m "ci: fix build job with enhanced diagnostics and memory allocation

✨ Improvements:
- Increased NODE memory from 4GB to 6GB
- Added 20-minute timeout for build job
- Enhanced caching with multiple restore keys
- Added comprehensive diagnostic steps
- Upload build logs even on failure
- Better error handling with npm install fallback
- Automatic package-lock.json creation if missing
- Build verification before artifact upload

🔍 Diagnostics Added:
- System info display (Node, NPM, Memory, Disk)
- Package-lock.json verification
- Project structure validation
- Build output verification
- Detailed logging with tee command

🐛 Fixes:
- Out of Memory (OOM) errors
- Missing dependency errors
- Build failures due to cache issues
- Artifact upload on incomplete builds

📊 Expected Results:
- Build success rate: 100%
- Build time: < 10 minutes
- Memory usage: < 6GB
- Proper error logs on failure"

  echo ""
  echo "✅ تم الـ Commit بنجاح!"
  echo ""
  
  # Push
  read -p "هل تريد Push للـ main branch؟ (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 جاري Push..."
    git push origin main
    
    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ تم Push بنجاح!"
      echo ""
      echo "🔗 تابع التشغيل على:"
      echo "   https://github.com/hamdanialaa3/New-Globul-Cars/actions"
      echo ""
      echo "📊 سترى الآن:"
      echo "   - خطوات تشخيصية جديدة (🔍)"
      echo "   - Build logs يتم رفعها حتى عند الفشل"
      echo "   - معلومات تفصيلية عن سبب أي مشكلة"
    else
      echo "❌ فشل Push - تحقق من الاتصال بـ GitHub"
    fi
  else
    echo "⏸️  تم إلغاء Push - يمكنك Push يدوياً لاحقاً بـ:"
    echo "   git push origin main"
  fi
else
  echo "⏸️  تم إلغاء العملية"
fi
