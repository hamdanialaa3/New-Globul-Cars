# دليل النسخ الاحتياطي لـ GitHub Codespaces

## نصائح لتجنب فقدان Codespaces

### 1. النسخ الاحتياطي الفوري
```bash
# في Codespace، قم بتشغيل:
git add .
git commit -m "Backup before Codespace deletion"
git push origin backup/SAFE-CHECKPOINT-COMPLETE-20251103
```

### 2. تصدير ملفات البيئة
```bash
# نسخ ملفات التكوين المهمة
cp .env .env.backup
cp -r .vscode .vscode-backup
cp package.json package.json.backup
```

### 3. تصدير قاعدة البيانات المحلية (إن وجدت)
```bash
# إذا كان لديك قاعدة بيانات محلية
firebase emulators:export ./firestore-backup
```

### 4. إعدادات Codespaces لتجنب الحذف التلقائي

#### في GitHub Settings:
1. اذهب إلى: https://github.com/settings/codespaces
2. تحت "Default retention period":
   - غيّر من "30 days" إلى "Indefinitely" (إذا متاح)
   - أو اختر أطول فترة ممكنة

#### لكل Codespace على حدة:
1. في صفحة Codespaces: https://github.com/codespaces
2. اضغط على الثلاث نقاط (...) بجانب كل Codespace
3. اختر "Settings"
4. تحت "Retention policy" غيّر إلى "Keep indefinitely"

### 5. بدائل Codespaces

#### أ) GitHub Desktop + VS Code محلياً:
- استنسخ المشروع محلياً
- استخدم VS Code مع GitHub Copilot
- مزامنة مع المشروع عبر Git

#### ب) استخدام Local Development:
```bash
# استنساخ المشروع محلياً
git clone https://github.com/hamdanialaa3/New-Globul-Cars.git
cd New-Globul-Cars
git checkout backup/SAFE-CHECKPOINT-COMPLETE-20251103

# تثبيت البيئة المحلية
npm install
firebase init
```

### 6. إعداد تنبيهات للمراقبة
- ضع تذكير شهري لتفعيل Codespaces المهمة
- تحقق من https://github.com/codespaces كل أسبوعين

### 7. استراتيجية النسخ الاحتياطي طويلة المدى

#### نسخ احتياطي أسبوعي:
```bash
#!/bin/bash
# backup-codespace.sh
DATE=$(date +%Y%m%d)
BRANCH_NAME="backup/codespace-$DATE"

git checkout -b $BRANCH_NAME
git add .
git commit -m "Weekly Codespace backup - $DATE"
git push origin $BRANCH_NAME
```

#### مراقبة المساحة التخزينية:
- GitHub Free: 15 GB شهرياً
- GitHub Pro: 20 GB شهرياً  
- راقب الاستخدام في: https://github.com/settings/billing

### 8. إعداد البيئة المحلية الطارئة

#### متطلبات النظام:
- Node.js 18+
- Firebase CLI
- Git
- VS Code + GitHub Copilot

#### سكريبت الإعداد السريع:
```bash
# quick-setup.sh
npm install -g firebase-tools
npm install -g @firebase/dataconnect-cli
code --install-extension GitHub.copilot
```

## خطة الطوارئ (إذا تم الحذف):

### 1. استعادة من Git:
```bash
git clone https://github.com/hamdanialaa3/New-Globul-Cars.git
git checkout backup/SAFE-CHECKPOINT-COMPLETE-20251103
```

### 2. إعادة إنشاء البيئة:
```bash
# في مجلد المشروع
cp .env.example .env
# أضف متغيرات البيئة المطلوبة
npm install
firebase emulators:start
```

### 3. استعادة قاعدة البيانات:
```bash
# إذا كان لديك نسخة احتياطية
firebase emulators:import ./firestore-backup
```

## الخلاصة:
- **الأولوية العليا**: تفعيل Codespaces قبل 05 نوفمبر
- **الأولوية الثانية**: تصدير كامل للكود والإعدادات
- **طويل المدى**: إعداد بيئة تطوير محلية مستقلة