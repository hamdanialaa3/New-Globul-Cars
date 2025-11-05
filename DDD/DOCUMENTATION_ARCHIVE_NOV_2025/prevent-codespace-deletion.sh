#!/bin/bash
# prevent-codespace-deletion.sh
# سكريبت لمنع حذف Codespaces

echo "🔧 منع حذف GitHub Codespaces..."

# 1. تفعيل جلسة الـ Codespace الحالية
echo "✅ تفعيل الجلسة الحالية..."
touch .codespace-keepalive-$(date +%Y%m%d-%H%M%S)

# 2. تحديث آخر وقت تعديل
echo "⏰ تحديث وقت آخر تعديل..."
git add .
git commit -m "Keep Codespace active - $(date)" --allow-empty
git push origin backup/SAFE-CHECKPOINT-COMPLETE-20251103

# 3. إنشاء ملف مراقبة
cat > .codespace-monitor << 'EOF'
{
  "lastAccess": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "projectName": "New-Globul-Cars",
  "branch": "backup/SAFE-CHECKPOINT-COMPLETE-20251103",
  "keepAlive": true,
  "autoBackup": true
}
EOF

echo "🎉 تم تطبيق إعدادات منع الحذف!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. اذهب إلى: https://github.com/codespaces"
echo "2. تأكد من أن جميع Codespaces تظهر كـ 'Active'"
echo "3. غيّر إعدادات Retention إلى 'Keep indefinitely'"
echo ""
echo "⚠️  تذكير: كرر هذا كل أسبوعين لضمان الأمان"