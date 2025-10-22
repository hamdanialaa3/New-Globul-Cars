# 🚀 استيراد Workflows إلى n8n - دليل سريع

## 📋 الخطوات الأساسية

### 1. الوصول إلى n8n
- افتح المتصفح على: `http://localhost:5678`
- اسم المستخدم: `globul_admin`
- كلمة المرور: `globul2025!`

### 2. استيراد أول Workflow

#### أ. استيراد "Sell Process Started"
1. اضغط على **"New Workflow"** في n8n
2. اضغط على **"⋯"** (ثلاث نقاط) في الأعلى
3. اختر **"Import from JSON"**
4. انسخ محتوى الملف: `n8n-workflows/01-sell-process-started.json`
5. الصق المحتوى واضغط **"Import"**
6. اضغط **"Save"** واعطي الـ workflow اسم: "Globul Cars - Sell Started"
7. اضغط **"Active"** لتفعيل الـ workflow

#### ب. استيراد "Vehicle Type Selected"
1. كرر نفس الخطوات للملف: `n8n-workflows/02-vehicle-type-selected.json`
2. اسم الـ workflow: "Globul Cars - Vehicle Type"

### 3. التحقق من Webhook URLs

بعد الاستيراد، ستحصل على الروابط التالية:
- Sell Started: `http://localhost:5678/webhook/sell-started`
- Vehicle Type: `http://localhost:5678/webhook/vehicle-type-selected`

### 4. اختبار التكامل

افتح Console في المتصفح على `http://localhost:3000` واكتب:
```javascript
// اختبار بسيط
fetch('http://localhost:5678/webhook/sell-started', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-123',
    timestamp: new Date().toISOString(),
    source: 'test'
  })
}).then(r => r.json()).then(console.log);
```

## 🔧 إعداد إضافي

### تفعيل CORS (إذا لزم الأمر)
في n8n، اذهب إلى Settings وأضف:
```
CORS_ORIGIN=http://localhost:3000
```

### مراقبة Executions
- اضغط على "Executions" في الشريط الجانبي
- ستري جميع تنفيذات الـ workflows
- اضغط على أي تنفيذ لرؤية التفاصيل

## 🎯 الخطوات التالية

1. ✅ استيراد الـ workflows الأساسية
2. 🧪 اختبار Webhooks
3. 🔗 ربط React مع n8n
4. 📊 إنشاء workflows إضافية
5. 🚀 النشر للإنتاج

---

**🔗 روابط مفيدة:**
- n8n Editor: http://localhost:5678
- React App: http://localhost:3000  
- Test File: `src/test-n8n-integration.ts`