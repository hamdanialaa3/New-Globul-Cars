# Cloud Functions Verification Payloads

استخدم هذه البيانات (JSON) لاختبار الدوال الجديدة للتأكد من أنها تعمل بشكل صحيح وترسل البيانات إلى Google Cloud.

## 1. اختبار تحليل البحث (BigQuery Analytics)
**اسم الدالة:** `logSearchEvent`
**الغرض:** التأكد من أن بيانات البحث تصل إلى جدول `search_logs` في BigQuery.

### Payload (JSON):
```json
{
  "data": {
    "make": "BMW",
    "model": "X5",
    "year": 2023,
    "priceMax": 65000,
    "city": "Sofia",
    "userId": "test-admin-user"
  }
}
```

**طريقة التحقق:**
1. اذهب إلى Firebase Console > Functions.
2. اختر دالة `logSearchEvent`.
3. اضغط على **"Test"** وألصق الكود أعلاه.
4. بعد النجاح، اذهب إلى BigQuery وتحقق من الجدول `car_market_analytics.search_logs`.

---

## 2. اختبار الأرشفة الفورية (Indexing API)
**اسم الدالة:** `requestIndexing`
**الغرض:** تبليغ جوجل عن رابط جديد أو محدث.

### Payload (JSON):
```json
{
  "data": {
    "url": "https://mobilebg.eu/car/test-car-123",
    "type": "URL_UPDATED"
  }
}
```

**طريقة التحقق:**
1. كرر نفس الخطوات في Firebase Console مع دالة `requestIndexing`.
2. راقب السجلات (Logs) في Firebase يجب أن ترى رسالة: `🚀 SEO Rocket: Google notified about...`.

---

## ملاحظات هامة
*   تأكد من إنشاء الـ Dataset في BigQuery أولاً باستخدام Cloud Shell.
*   تأكد من تفعيل Indexing API في Google Cloud Console.
