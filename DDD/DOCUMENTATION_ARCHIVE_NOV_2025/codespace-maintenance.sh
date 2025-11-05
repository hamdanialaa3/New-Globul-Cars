#!/bin/bash
# codespace-maintenance.sh
# سكريبت للصيانة الدورية لـ Codespaces

echo "🔄 بدء صيانة Codespaces الدورية..."

# تحديث تاريخ آخر استخدام
echo "📅 تحديث تاريخ آخر استخدام..."
git add .
git commit -m "Codespace maintenance - $(date +%Y-%m-%d)" --allow-empty
git push

# إنشاء ملف تتبع الصيانة
cat > .codespace-maintenance-log << EOF
{
  "lastMaintenance": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nextMaintenance": "$(date -u -d '+2 weeks' +%Y-%m-%dT%H:%M:%SZ)",
  "maintenanceCount": $(($(grep -c "lastMaintenance" .codespace-maintenance-log 2>/dev/null || echo 0) + 1)),
  "status": "active",
  "notes": "Regular maintenance to prevent deletion"
}
EOF

echo "✅ تمت الصيانة بنجاح!"
echo "🔔 الصيانة التالية مطلوبة في: $(date -d '+2 weeks' +%Y-%m-%d)"

# إرسال تذكير (اختياري)
echo "💡 تذكير: راجع Codespaces في GitHub كل أسبوعين"
echo "🔗 الرابط: https://github.com/codespaces"