# 🚀 دليل الإعداد المبسّط (بدون API Keys)

> **ملاحظة مهمة:** هذا الدليل للإعداد السريع باستخدام **Webhook Secrets فقط**  
> API Keys اختيارية ويمكن إضافتها لاحقاً عند الحاجة لميزات متقدمة

---

## ✅ ما يعمل بدون API Keys

- ✅ **استقبال إشعارات الدفع** من iCard و Revolut
- ✅ **تحديث حالة الإعلان** تلقائياً بعد الدفع
- ✅ **حفظ سجلات المدفوعات** في Firestore
- ✅ **تتبع المعاملات** وإرسال الإشعارات
- ✅ **التسوية اليومية** (Reconciliation)
- ✅ **تصدير التقارير** بصيغة CSV

---

## 🔧 الإعداد في 3 خطوات

### 📍 الخطوة 1: احصل على Webhook Secrets

#### A) من iCard
1. افتح لوحة تحكم iCard: https://dashboard.icard.bg/
2. اذهب إلى: **Settings → API → Webhooks**
3. اضغط **Add New Webhook**
4. أدخل هذا الرابط:
   ```
   https://europe-west1-fire-new-globul.cloudfunctions.net/icardWebhooks
   ```
5. اختر الأحداث:
   - ✅ payment.created
   - ✅ payment.completed
   - ✅ payment.failed
   - ✅ payment.pending
   - ✅ payment.refunded
6. **توليد Secret:** اضغط "Generate Secret" واحفظه (32+ حرف)
7. اضغط **Save**

#### B) من Revolut
1. افتح لوحة Revolut Business: https://business.revolut.com/
2. اذهب إلى: **Developer → Webhooks**
3. اضغط **Create Webhook**
4. أدخل هذا الرابط:
   ```
   https://europe-west1-fire-new-globul.cloudfunctions.net/revolutWebhooks
   ```
5. اختر الأحداث:
   - ✅ TransactionCreated
   - ✅ TransactionStateChanged
6. **Signing Secret:** سيتم توليده تلقائياً، انسخه
7. اضغط **Create**

---

### 📍 الخطوة 2: احفظ Secrets في Firebase

افتح PowerShell في مجلد `functions`:

```powershell
cd web\functions
```

#### طريقة سهلة (تفاعلية):
```powershell
# iCard Secret
firebase functions:secrets:set ICARD_WEBHOOK_SECRET
# الصق السكريت من iCard واضغط Enter

# Revolut Secret
firebase functions:secrets:set REVOLUT_WEBHOOK_SECRET
# الصق السكريت من Revolut واضغط Enter
```

#### أو استخدم السكريبت:
```powershell
.\setup-payment-secrets.ps1
# عندما يسألك عن API Keys، اختر "Skip"
```

---

### 📍 الخطوة 3: أعد نشر Webhook Functions

```bash
firebase deploy --only functions:icardWebhooks,functions:revolutWebhooks
```

⏱️ **مدة النشر:** 2-3 دقائق

---

## 🧪 اختبار النظام

### اختبار 1: Webhook Signature Validation
```powershell
cd web\functions
.\test-payment-webhooks.ps1
```

**النتيجة المتوقعة:**
```
✅ iCard - Missing signature: 401 Unauthorized
✅ iCard - Invalid signature: 401 Unauthorized
✅ Revolut - Missing signature: 401 Unauthorized
✅ Revolut - Invalid signature: 401 Unauthorized
```

### اختبار 2: دفعة تجريبية (Sandbox)

#### iCard Sandbox:
1. افتح: https://sandbox.icard.bg/
2. اعمل دفعة اختبارية بقيمة **10 EUR**
3. أضف metadata:
   ```json
   {
     "ad_id": "test_ad_12345",
     "user_id": "test_user_001"
   }
   ```
4. راجع اللوج:
   ```powershell
   firebase functions:log --only icardWebhooks --limit 20
   ```

#### Revolut Sandbox:
1. افتح: https://sandbox-business.revolut.com/
2. اعمل دفعة اختبارية بقيمة **10 EUR**
3. في حقل Reference أدخل:
   ```
   ad_test_ad_12345_user_test_user_001
   ```
4. راجع اللوج:
   ```powershell
   firebase functions:log --only revolutWebhooks --limit 20
   ```

---

## 📊 التحقق من Firestore

بعد الاختبار، تحقق من البيانات في Firestore Console:

### مجموعة `payments`:
```javascript
// يجب أن تجد سجلاً جديداً:
{
  transactionId: "icard_123...",
  provider: "icard",
  amount: 10.00,
  currency: "EUR",
  status: "succeeded",
  adId: "test_ad_12345",
  userId: "test_user_001",
  createdAt: Timestamp,
  ...
}
```

### مجموعة `ads`:
```javascript
// يجب أن يتم تحديث الإعلان:
{
  id: "test_ad_12345",
  status: "paid",  // أو "published" حسب الإعدادات
  paymentStatus: "completed",
  paidAt: Timestamp,
  ...
}
```

---

## 🔍 المراقبة

### عرض اللوجات الحية:
```bash
# iCard webhooks
firebase functions:log --only icardWebhooks

# Revolut webhooks
firebase functions:log --only revolutWebhooks

# كل الوظائف
firebase functions:log
```

### Cloud Console Dashboard:
1. افتح: https://console.firebase.google.com/project/fire-new-globul/functions
2. اختر `icardWebhooks` أو `revolutWebhooks`
3. راجع:
   - **Logs:** سجل كل الطلبات
   - **Metrics:** عدد الاستدعاءات والأخطاء
   - **Health:** حالة الوظيفة

---

## ❌ استكشاف الأخطاء

### خطأ: `401 Unauthorized`
**السبب:** Webhook secret غير صحيح أو غير موجود  
**الحل:**
```powershell
# تحقق من السكريت الحالي
firebase functions:secrets:access ICARD_WEBHOOK_SECRET
firebase functions:secrets:access REVOLUT_WEBHOOK_SECRET

# أعد ضبطه إذا لزم الأمر
firebase functions:secrets:set ICARD_WEBHOOK_SECRET --force
```

### خطأ: `400 Bad Request - Missing required fields`
**السبب:** البيانات المرسلة ناقصة  
**الحل:** تحقق من payload الويبهوك:
```javascript
// iCard يجب أن يحتوي:
{ transactionId, amount, currency, status, metadata }

// Revolut يجب أن يحتوي:
{ id, amount, currency, state, reference }
```

### خطأ: `409 Conflict - Webhook already processed`
**السبب:** تكرار webhook (دالة الحماية من التكرار تعمل ✅)  
**الحل:** لا داعي لفعل شيء، هذا سلوك طبيعي

### خطأ: `500 Internal Server Error`
**السبب:** خطأ في معالجة البيانات  
**الحل:**
1. راجع اللوج الكامل: `firebase functions:log --only icardWebhooks --limit 50`
2. ابحث عن `ERROR` في اللوج
3. تحقق من بنية Firestore (ads collection يجب أن تكون موجودة)

---

## 📈 الخطوات التالية (اختيارية)

### إضافة API Keys لاحقاً
عندما تحتاج لميزات متقدمة:
```powershell
# احصل على API keys من:
# - iCard: Settings → API → API Keys
# - Revolut: Settings → Developer → API Keys

firebase functions:secrets:set ICARD_API_KEY
firebase functions:secrets:set REVOLUT_API_KEY

# لا حاجة لإعادة النشر (hot-reload)
```

### ميزات تحتاج API Keys:
- ✨ **استرجاع المدفوعات (Refunds):** `POST /refunds`
- ✨ **الاستعلام عن حالة الدفع:** `GET /payments/:id`
- ✨ **إلغاء المدفوعات:** `POST /payments/:id/cancel`
- ✨ **تحديث البيانات يدوياً:** للتسوية اليدوية

---

## 📚 المراجع

| **الملف** | **الغرض** |
|-----------|----------|
| [PAYMENT_QUICK_START.md](PAYMENT_QUICK_START.md) | دليل شامل مع API Keys |
| [PAYMENT_TEST_SCENARIOS.md](PAYMENT_TEST_SCENARIOS.md) | 15+ سيناريو اختبار |
| [PAYMENT_INTEGRATION_GUIDE.md](PAYMENT_INTEGRATION_GUIDE.md) | دليل تقني كامل |
| [setup-payment-secrets.ps1](setup-payment-secrets.ps1) | سكريبت إعداد تلقائي |
| [test-payment-webhooks.ps1](test-payment-webhooks.ps1) | سكريبت اختبار تلقائي |

---

## ✅ قائمة التحقق النهائية

- [ ] حصلت على webhook secrets من iCard و Revolut
- [ ] حفظت الـ secrets في Firebase
- [ ] أعدت نشر webhook functions
- [ ] اختبرت signature validation (401/401)
- [ ] عملت دفعة تجريبية في sandbox
- [ ] تحققت من Firestore (payments + ads)
- [ ] راجعت اللوجات (لا أخطاء)
- [ ] جهزت المراقبة (Cloud Console)

---

## 🆘 الدعم

إذا واجهت مشاكل:
1. **راجع اللوجات:** `firebase functions:log --only icardWebhooks,revolutWebhooks`
2. **تحقق من Secrets:** `firebase functions:secrets:list`
3. **اختبر Webhooks:** `.\test-payment-webhooks.ps1`
4. **راجع التوثيق:** `PAYMENT_INTEGRATION_GUIDE.md`

---

**🎉 الآن جاهز لاستقبال المدفوعات!**
