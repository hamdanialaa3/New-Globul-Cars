# 🛠️ دليل بناء Workflow 3 يدوياً في n8n

## 🎯 **الطريقة البديلة - بناء يدوي**

بما أن الاستيراد لا يعمل، سنبني الـ workflow خطوة بخطوة!

---

## 📋 **الخطوة 1: إنشاء Workflow جديد**

1. في n8n اضغط `+ New Workflow`
2. سمّه: `Globul Cars - Complete Sell Workflow`
3. احفظ (Ctrl+S)

---

## 🔌 **الخطوة 2: إضافة Webhooks (7 webhooks)**

### Webhook 1: Seller Type Selected
1. اضغط `+` لإضافة node
2. ابحث عن `Webhook`
3. اختر `Webhook` node
4. في الإعدادات:
   - **HTTP Method**: `POST`
   - **Path**: `seller-type-selected`
5. احفظ

### Webhook 2: Vehicle Data Entered
1. أضف webhook node جديد
2. **Path**: `vehicle-data-entered`
3. احفظ

### Webhook 3: Equipment Selected
1. أضف webhook node جديد
2. **Path**: `equipment-selected`
3. احفظ

### Webhook 4: Images Uploaded
1. أضف webhook node جديد
2. **Path**: `images-uploaded`
3. احفظ

### Webhook 5: Price Set
1. أضف webhook node جديد
2. **Path**: `price-set`
3. احفظ

### Webhook 6: Contact Info Entered
1. أضف webhook node جديد
2. **Path**: `contact-info-entered`
3. احفظ

### Webhook 7: Listing Published
1. أضف webhook node جديد
2. **Path**: `listing-published`
3. احفظ

---

## 🧠 **الخطوة 3: إضافة Function Node للتحليل**

1. أضف node جديد
2. ابحث عن `Function`
3. اختر `Function` node
4. سمّه: `Analyze Sell Funnel`
5. في خانة الكود، الصق هذا:

```javascript
const inputData = items[0].json;
const { step, userId, data, timestamp } = inputData;

const sellSteps = {
  'seller_type': { stepNumber: 2, completion: 20, nextStep: 'vehicle_data' },
  'vehicle_data': { stepNumber: 3, completion: 40, nextStep: 'equipment' },
  'equipment': { stepNumber: 4, completion: 60, nextStep: 'images' },
  'images': { stepNumber: 5, completion: 75, nextStep: 'price' },
  'price': { stepNumber: 6, completion: 90, nextStep: 'contact' },
  'contact': { stepNumber: 7, completion: 95, nextStep: 'publish' },
  'published': { stepNumber: 8, completion: 100, nextStep: 'complete' }
};

const stepInfo = sellSteps[step] || { stepNumber: 1, completion: 10, nextStep: 'unknown' };

return [{
  json: {
    userId,
    step,
    stepInfo,
    processedAt: new Date().toISOString(),
    completion: stepInfo.completion
  }
}];
```

6. احفظ

---

## ⚡ **الخطوة 4: إضافة IF Node**

1. أضف node جديد
2. ابحث عن `IF`
3. اختر `IF` node
4. سمّه: `Needs Attention?`
5. في الشرط:
   - **Value 1**: `{{$json.completion}}`
   - **Operation**: `Smaller`
   - **Value 2**: `50`
6. احفظ

---

## 🌐 **الخطوة 5: إضافة HTTP Request Nodes**

### HTTP Request 1: Urgent Intervention
1. أضف node جديد
2. ابحث عن `HTTP Request`
3. سمّه: `Send Urgent Intervention`
4. في الإعدادات:
   - **Method**: `POST`
   - **URL**: `https://fire-new-globul.firebaseapp.com/api/urgent-intervention`
   - **Body Content Type**: `JSON`
   - **Body**: 
```json
{
  "userId": "{{$json.userId}}",
  "step": "{{$json.step}}",
  "completion": {{$json.completion}},
  "timestamp": "{{$json.processedAt}}"
}
```
5. احفظ

### HTTP Request 2: Log Analytics
1. أضف HTTP Request node آخر
2. سمّه: `Log Sell Analytics`
3. **URL**: `https://fire-new-globul.firebaseapp.com/api/sell-funnel-analytics`
4. نفس الإعدادات السابقة
5. احفظ

---

## 🔗 **الخطوة 6: ربط الـ Nodes**

### الربط:
1. **اربط جميع الـ 7 webhooks** → `Analyze Sell Funnel`
2. **اربط** `Analyze Sell Funnel` → `Needs Attention?`
3. **من IF node**:
   - **True branch** → `Send Urgent Intervention`
   - **False branch** → `Log Sell Analytics`
4. **اربط** `Send Urgent Intervention` → `Log Sell Analytics`

---

## ✅ **الخطوة 7: التفعيل**

1. احفظ الـ workflow (Ctrl+S)
2. اضغط على زر **Active** لتشغيله
3. ✅ تم!

---

## 📊 **النتيجة النهائية:**

```
[7 Webhooks] → [Function] → [IF] → [HTTP Request 1]
                                  → [HTTP Request 2]
```

- ✅ 7 webhook endpoints للـ sell process
- ✅ AI analysis للبيانات
- ✅ Smart routing حسب الحالة
- ✅ Analytics logging

---

## 🚀 **بعد الانتهاء:**

اكتب "تم" وسأعطيك دليل بناء الـ Workflow 4!

---

**💡 نصيحة:** 
البناء اليدوي أفضل أحياناً لأنك تفهم كل خطوة!
