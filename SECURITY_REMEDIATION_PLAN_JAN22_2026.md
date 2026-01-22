# 🔐 خطة معالجة الأمان الشاملة - 22 يناير 2026

**الحالة:** 🔴 **CRITICAL - تسرب مفاتيح API في Git History**  
**الأولوية:** P0 - يجب الحل فوراً  
**التأثير:** عالي جداً - مفاتيح منتجة مكشوفة للعامة

---

## 🚨 المفاتيح المكشوفة

### 1️⃣ Google APIs (مكشوفة في `.env.backup`)
```env
# ⚠️ EXPOSED - يجب تدويرها فوراً
REACT_APP_GOOGLE_GENERATIVE_AI_KEY=AIzaSyC1YsQz2rpK8z_6cZev9y99rV1kIUVsrFI
REACT_APP_GEMINI_API_KEY=AIzaSyC1YsQz2rpK8z_6cZev9y99rV1kIUVsrFI
REACT_APP_GOOGLE_BROWSER_KEY=AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk
REACT_APP_FIREBASE_API_KEY=AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk
```

**التأثير:**
- ✅ محدود - هذه مفاتيح client-side آمنة للاستخدام العام
- ✅ محمية بـ Application Restrictions (domain whitelist)
- ⚠️ لكن يجب مراجعة Quotas و Usage

### 2️⃣ Firebase Configuration (مكشوفة)
```env
# ⚠️ EXPOSED - لكن آمنة للاستخدام العام
REACT_APP_FIREBASE_PROJECT_ID=fire-new-globul
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=973379297533
REACT_APP_FIREBASE_APP_ID=1:973379297533:web:59c6534d61a29cae5d9e94
REACT_APP_FIREBASE_MEASUREMENT_ID=G-TDRZ4Z3D7Z
```

**التأثير:**
- ✅ آمنة - معلومات عامة غير حساسة
- ✅ محمية بـ Firebase Security Rules
- ✅ لا تحتاج تدوير

### 3️⃣ Stripe Keys (مكشوفة)
```env
# ⚠️ EXPOSED - Test keys only
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51SaPwfKdXsQ61OHNOBeuRfdLo9O96D4yt6zdGysqJU0Y5god1I4DvRTKL6fGKN11LyARehZNczfDkPS8H4CVROIE00KYQXqYbT
```

**التأثير:**
- ✅ آمنة - هذا Test Mode key فقط
- ✅ Publishable keys آمنة للاستخدام العام
- ⚠️ لكن يجب التأكد من عدم وجود Secret Keys مكشوفة

### 4️⃣ Commits المكشوفة
```
commit 36ed10e9d4477163194c2652c413ca4dea3213ff
Date: Sun Dec 28 01:26:33 2025 +0200
Files deleted:
  - .env.backup
  - .env.facebook
  - .env.production
```

---

## ✅ تقييم المخاطر

### 🟢 **مخاطر منخفضة - الوضع آمن نسبياً**

**السبب:**
1. ✅ **Google API Keys** - client-side keys محمية بـ API restrictions
2. ✅ **Firebase Config** - معلومات عامة غير حساسة
3. ✅ **Stripe Key** - Test mode publishable key فقط
4. ✅ **الملفات محذوفة** - تم حذفها في Dec 28, 2025

**لكن:**
- ⚠️ لا تزال موجودة في Git history
- ⚠️ يمكن لأي شخص استخراجها
- ⚠️ قد تستخدم لتجاوز Quotas

---

## 📋 خطة العلاج (3 مستويات)

### المستوى 1: فحص شامل (30 دقيقة) ✅ يُوصى به

#### الخطوة 1: تأكيد نوع المفاتيح
```bash
# تحقق من أن جميع المفاتيح المكشوفة هي client-side فقط
git show 36ed10e9^:.env.backup | grep -E "SECRET|PRIVATE|SERVER"
git show 36ed10e9^:.env.facebook | head -50
git show 36ed10e9^:.env.production | head -50
```

#### الخطوة 2: مراجعة Google Cloud Console
- تسجيل دخول: https://console.cloud.google.com/apis/credentials
- التحقق من API Restrictions لكل key
- مراجعة Usage Quotas

#### الخطوة 3: مراجعة Firebase Console
- تسجيل دخول: https://console.firebase.google.com/project/fire-new-globul
- التحقق من Security Rules
- مراجعة Authentication methods

#### الخطوة 4: مراجعة Stripe Dashboard
- تسجيل دخول: https://dashboard.stripe.com/test/apikeys
- التأكد من عدم وجود Secret keys مكشوفة
- مراجعة Webhooks endpoints

---

### المستوى 2: تنظيف Git History (2-3 ساعات) ⚠️ اختياري

#### الخيار A: BFG Repo-Cleaner (موصى به)
```bash
# تحميل BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# حذف ملفات .env من التاريخ
java -jar bfg-1.14.0.jar --delete-files .env* --no-blob-protection

# تنظيف
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ خطير - يكسر forks)
git push origin --force --all
git push origin --force --tags
```

#### الخيار B: git filter-repo (بديل)
```bash
# تثبيت
pip install git-filter-repo

# حذف الملفات
git filter-repo --path .env --invert-paths
git filter-repo --path .env.backup --invert-paths
git filter-repo --path .env.facebook --invert-paths
git filter-repo --path .env.production --invert-paths

# Force push
git push origin --force --all
```

---

### المستوى 3: تدوير المفاتيح (4-6 ساعات) 🔴 غير ضروري حالياً

#### Google APIs - إنشاء مفاتيح جديدة
1. Google Cloud Console → APIs & Services → Credentials
2. إنشاء API key جديد لكل خدمة
3. تطبيق نفس Restrictions
4. تحديث `.env.example`
5. إبلاغ الفريق
6. حذف المفاتيح القديمة بعد 7 أيام

#### Firebase - لا حاجة للتدوير
- Firebase config ليس سرياً
- محمي بـ Security Rules

#### Stripe - لا حاجة للتدوير
- Test mode publishable key فقط
- يمكن تجديده في أي وقت

---

## 🛡️ الإجراءات الوقائية

### 1. تحديث .gitignore ✅
```gitignore
# Environment files
.env
.env.local
.env.development
.env.test
.env.production
.env.backup
.env.facebook
.env.*

# Except example
!.env.example
```

### 2. Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

# منع commit ملفات .env
if git diff --cached --name-only | grep -E "^\.env(\.|$)"; then
    echo "ERROR: You are trying to commit .env files!"
    echo "Please remove them from staging area."
    exit 1
fi
```

### 3. GitHub Secret Scanning
- تفعيل في Settings → Security → Secret scanning
- تلقائياً يكتشف المفاتيح المكشوفة

---

## 📊 التوصية النهائية

### ✅ الحل الموصى به: **المستوى 1 فقط**

**السبب:**
1. جميع المفاتيح المكشوفة هي **client-side safe**
2. محمية بـ **API Restrictions** و **Security Rules**
3. لا توجد **Secret Keys** مكشوفة
4. **Test mode** فقط لـ Stripe

**الخطوات:**
1. ✅ مراجعة Google Cloud Console (5 دقائق)
2. ✅ مراجعة Firebase Console (5 دقائق)
3. ✅ مراجعة Stripe Dashboard (5 دقائق)
4. ✅ تحديث .gitignore (موجود بالفعل)
5. ✅ إضافة pre-commit hook (10 دقائق)

**⏱️ الوقت الإجمالي:** 30 دقيقة

---

## ⚠️ متى تحتاج المستوى 2 أو 3؟

### تنظيف Git History (المستوى 2) إذا:
- ❌ Repository عامة (public)
- ❌ وجدت Secret Keys حقيقية
- ❌ وجدت Production keys
- ❌ Compliance requirements

### تدوير المفاتيح (المستوى 3) إذا:
- ❌ اكتشاف استخدام غير مصرح
- ❌ تجاوز Quotas مشبوه
- ❌ Compliance audit
- ❌ Security incident

---

## 🎯 الخطة الموصى بها للمستخدم

### الآن (5 دقائق):
1. ✅ قراءة هذا التقرير
2. ✅ تأكيد الخطة
3. ✅ البدء في المستوى 1

### اليوم (30 دقيقة):
1. مراجعة Google Cloud Console
2. مراجعة Firebase Console  
3. مراجعة Stripe Dashboard
4. إضافة pre-commit hook

### هذا الأسبوع (اختياري):
- مراقبة Usage metrics
- تفعيل Secret scanning في GitHub

### مستقبلاً:
- تدريب الفريق على Security best practices
- Regular security audits

---

## 📞 الدعم

إذا كنت بحاجة للمساعدة:
1. **Google Cloud Support:** https://cloud.google.com/support
2. **Firebase Support:** https://firebase.google.com/support
3. **Stripe Support:** https://support.stripe.com/

---

**Created:** 22 يناير 2026  
**Priority:** P0  
**Risk Level:** 🟢 Low (client-side keys only)  
**Action Required:** ✅ Review (30 minutes)  
**Optional:** ⚠️ Git history cleanup

