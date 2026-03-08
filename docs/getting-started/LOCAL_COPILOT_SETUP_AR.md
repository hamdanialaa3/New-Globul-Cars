# 🖥️ دليل العمل المحلي مع GitHub Copilot

**للمطورين الذين يريدون تعديل الملفات محلياً ورفعها إلى GitHub**

---

## 🎯 ما الذي يغطيه هذا الدليل؟

1. **كيف تعمل محلياً** على ملفات المشروع في حاسوبك
2. **كيف ترفع التعديلات** إلى GitHub بعد الانتهاء منها
3. **كيف تُعطي GitHub Copilot صلاحية العمل على حاسوبك** (عبر VS Code)

---

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من توفر ما يلي:

| المتطلب | الإصدار | رابط التثبيت |
|---------|---------|--------------|
| **Git** | 2.x أو أحدث | https://git-scm.com/downloads |
| **Node.js** | 20.x أو أحدث | https://nodejs.org |
| **VS Code** | أحدث إصدار | https://code.visualstudio.com |
| **حساب GitHub** | — | https://github.com |
| **اشتراك GitHub Copilot** | Individual / Business | https://github.com/features/copilot |

---

## 🔑 الجزء الأول: منح GitHub Copilot صلاحية العمل محلياً

### الخطوة 1: تثبيت إضافة GitHub Copilot في VS Code

```
1. افتح VS Code
2. اضغط على أيقونة Extensions (Ctrl+Shift+X)
3. ابحث عن: "GitHub Copilot"
4. ثبّت الإضافتين:
   - GitHub Copilot          ← (اقتراحات الكود التلقائية)
   - GitHub Copilot Chat     ← (المحادثة والتفاعل النصي)
```

### الخطوة 2: تسجيل الدخول إلى GitHub من VS Code

```
1. بعد التثبيت، ستظهر رسالة "Sign in to GitHub"
2. اضغط "Sign in"
3. سيفتح المتصفح لتأكيد الصلاحيات
4. اضغط "Authorize GitHub Copilot"
5. عُد إلى VS Code — أنت الآن مسجّل الدخول ✅
```

> **ملاحظة:** هذه الخطوة تمنح Copilot صلاحية قراءة ملفاتك المفتوحة في VS Code وتقديم اقتراحات بناءً عليها. **لا يمكنه الوصول إلى حاسوبك خارج VS Code.**

### الخطوة 3: التحقق من أن Copilot يعمل

افتح أي ملف `.ts` أو `.tsx` في المشروع، ابدأ بالكتابة — ستظهر اقتراحات Copilot باللون الرمادي.  
اضغط **Tab** لقبول الاقتراح.

---

## 📥 الجزء الثاني: نسخ المشروع محلياً

### الخطوة 1: نسخ (Clone) المستودع

```bash
# افتح Terminal أو Command Prompt، ثم شغّل:
git clone https://github.com/hamdanialaa3/New-Globul-Cars.git

# انتقل إلى مجلد المشروع
cd New-Globul-Cars
```

### الخطوة 2: تثبيت المكتبات

```bash
npm install --legacy-peer-deps
```

### الخطوة 3: إعداد متغيرات البيئة

```bash
# انسخ ملف المثال
cp .env.example .env.local

# افتح .env.local وأضف مفاتيحك الحقيقية
# (اطلب مفاتيح Firebase من مالك المشروع)
```

### الخطوة 4: تشغيل المشروع محلياً

```bash
npm start
# سيفتح المتصفح على http://localhost:3000
```

---

## ✏️ الجزء الثالث: تعديل الملفات ورفعها إلى GitHub

### سير العمل الكامل (خطوة بخطوة)

```bash
# 1. تأكد أنك على الفرع الصحيح
git checkout main

# 2. سحب آخر التحديثات من GitHub
git pull origin main

# 3. إنشاء فرع جديد لتعديلاتك (مستحسن)
git checkout -b feature/اسم-التعديل

# 4. قم بتعديل الملفات التي تريدها في VS Code...

# 5. بعد الانتهاء، تحقق مما تغيّر
git status
git diff

# 6. أضف الملفات المعدّلة
git add .                    # إضافة كل التغييرات
# أو
git add src/components/...   # إضافة ملف بعينه

# 7. قبل الرفع — شغّل فحوصات الجودة
npm run type-check           # فحص TypeScript

# 8. حفظ التغييرات (Commit)
git commit -m "feat: وصف مختصر للتعديل"

# 9. رفع التعديلات إلى GitHub
git push origin feature/اسم-التعديل
```

### الخطوة 10: إنشاء Pull Request

```
1. افتح: https://github.com/hamdanialaa3/New-Globul-Cars
2. ستظهر رسالة "Compare & pull request"
3. اضغط عليها
4. اكتب وصفاً للتعديل
5. اضغط "Create pull request"
```

---

## 🤖 الجزء الرابع: استخدام GitHub Copilot Chat محلياً

بعد إعداد كل شيء، يمكنك التحدث مع Copilot مباشرة في VS Code:

### فتح نافذة المحادثة

```
اضغط: Ctrl+Shift+P
اكتب: "GitHub Copilot Chat"
أو استخدم الاختصار: Ctrl+Shift+I
```

### أمثلة على الأوامر التي يمكنك كتابتها

```
@workspace اشرح لي بنية هذا المشروع

@workspace كيف أضيف صفحة جديدة لعرض السيارات؟

/fix أصلح الخطأ في هذا الكود

/explain اشرح لي هذا الكود

/tests اكتب اختبارات لهذه الدالة
```

### منح Copilot صلاحية قراءة ملفات المشروع

Copilot يقرأ تلقائياً الملفات المفتوحة في VS Code.  
لمنحه رؤية أوسع للمشروع:

```
1. افتح VS Code في مجلد المشروع الجذر:
   File → Open Folder → اختر مجلد New-Globul-Cars

2. في نافذة Chat، استخدم @workspace
   مثال: "@workspace أين يتم التحقق من هوية المستخدم؟"
```

---

## 🚀 الجزء الخامس: استخدام GitHub Copilot Agent (المهام التلقائية)

GitHub Copilot Agent هو ميزة متقدمة تتيح لـ Copilot تنفيذ مهام كاملة تلقائياً على GitHub.

### كيف يعمل؟

```
GitHub.com (المستودع)
       ↓
  Copilot Agent (على خوادم GitHub)
       ↓
  يُنشئ PR تلقائياً بالتغييرات
       ↓
  أنت تراجع وتوافق على PR
```

> **مهم:** Copilot Agent يعمل على خوادم GitHub — **لا يصل إلى حاسوبك الشخصي مباشرة**.  
> هذا هو التصميم المقصود لحماية أمان حاسوبك.

### كيف تُعطيه مهمة؟

```
1. افتح: https://github.com/hamdanialaa3/New-Globul-Cars/issues
2. أنشئ Issue جديدة واصف فيها المهمة بالتفصيل
3. في تعليق على الـ Issue، اكتب:
   @copilot نفّذ هذه المهمة
4. سيُنشئ Copilot PR تلقائياً بالتغييرات
5. راجع الـ PR وادمجه إذا كان صحيحاً
```

---

## 🔄 الجزء السادس: سير العمل المثالي (محلي + Copilot)

```
┌─────────────────────────────────────────────────────┐
│                    سير العمل الموصى به               │
└─────────────────────────────────────────────────────┘

1. git pull origin main          ← سحب آخر التحديثات
2. git checkout -b feature/xxx   ← إنشاء فرع جديد
3. افتح VS Code + Copilot Chat   ← استخدم @workspace
4. طلب مساعدة من Copilot         ← اكتب المهمة بوضوح
5. راجع الكود المقترح            ← لا تقبل كل شيء بلا مراجعة
6. npm run type-check            ← فحص الأخطاء
7. git add . && git commit       ← حفظ التغييرات
8. git push origin feature/xxx   ← رفع إلى GitHub
9. أنشئ Pull Request             ← للمراجعة والدمج
```

---

## 🆘 حل المشاكل الشائعة

### مشكلة: "git push" يطلب اسم المستخدم وكلمة المرور

```bash
# استخدم Personal Access Token بدلاً من كلمة المرور:
# 1. GitHub → Settings → Developer settings → Personal access tokens
# 2. أنشئ Token جديد مع صلاحية "repo"
# 3. استخدم الـ Token كـ Password عند الطلب
```

### مشكلة: Copilot لا يظهر في VS Code

```
1. تحقق من الاشتراك: https://github.com/settings/copilot
2. أعد تسجيل الدخول: VS Code → Accounts → Sign out → Sign in
3. أعد تشغيل VS Code
```

### مشكلة: أخطاء TypeScript بعد التعديل

```bash
npm run type-check    # لرؤية الأخطاء
# أصلح الأخطاء التي يشير إليها
# أو استخدم Copilot Chat: /fix
```

### مشكلة: نسيت رفع آخر التحديثات وهناك تعارض

```bash
git fetch origin
git rebase origin/main    # أو git merge origin/main
# حلّ التعارضات في VS Code (يعرضها بشكل مرئي)
git add .
git rebase --continue
```

---

## 📚 روابط مفيدة

- **توثيق VS Code + Copilot:** https://code.visualstudio.com/docs/copilot/overview
- **دليل Git الأساسي:** https://git-scm.com/book/ar/v2
- **إعداد GitHub Secrets:** [.github/GITHUB_SECRETS_SETUP.md](../../.github/GITHUB_SECRETS_SETUP.md)
- **الأسئلة الشائعة:** [docs/getting-started/FIXY.md](FIXY.md)
- **بدء التطوير:** [QUICK_START.md](../../QUICK_START.md)

---

## ✅ ملخص الخطوات

```
□ تثبيت Git + Node.js + VS Code
□ تثبيت إضافة "GitHub Copilot" + "GitHub Copilot Chat" في VS Code
□ تسجيل الدخول إلى GitHub من VS Code
□ git clone https://github.com/hamdanialaa3/New-Globul-Cars.git
□ npm install --legacy-peer-deps
□ cp .env.example .env.local  (وإضافة المفاتيح)
□ npm start  (للتحقق من أن كل شيء يعمل)
□ ابدأ التعديل باستخدام VS Code + Copilot
□ git add . && git commit -m "وصف التعديل"
□ git push origin اسم-الفرع
□ أنشئ Pull Request على GitHub
```

---

**© 2026 Koli One — هذا الدليل باللغة العربية لتسهيل الوصول** 🚀
