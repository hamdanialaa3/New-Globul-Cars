# 📋 دليل استيراد Workflows إلى حسابك في n8n

## 🎯 **خطوات الاستيراد السريع**

### الخطوة 1: فتح حسابك
1. اذهب إلى: https://globul-cars-bg.app.n8n.cloud
2. سجل الدخول بحسابك

### الخطوة 2: إنشاء Workflow جديد
1. اضغط على **"+ New Workflow"**
2. ستفتح صفحة محرر فارغة

### الخطوة 3: استيراد الـ JSON
1. اضغط على الأيقونة **"⋯"** (ثلاث نقاط) في الأعلى
2. اختر **"Import from JSON"**
3. انسخ المحتوى التالي والصقه:

---

## 🚀 **Workflow الأول: Sell Process Started**

```json
{
  "name": "Globul Cars - Sell Process Started",
  "nodes": [
    {
      "parameters": {
        "path": "sell-started",
        "options": {}
      },
      "id": "f4f89a8f-75e6-4e61-b3e1-c1234567890a",
      "name": "Webhook - Sell Started",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "globul-sell-started"
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "userId",
              "value": "={{$json.userId}}"
            },
            {
              "name": "timestamp",
              "value": "={{$json.timestamp}}"
            },
            {
              "name": "event",
              "value": "sell_started"
            },
            {
              "name": "source",
              "value": "globul_cars_web"
            },
            {
              "name": "processedAt",
              "value": "={{new Date().toISOString()}}"
            }
          ]
        },
        "options": {}
      },
      "id": "b2b89a8f-75e6-4e61-b3e1-c1234567890b",
      "name": "Set Data Structure",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "functionCode": "// معالجة بيانات بدء عملية البيع\nconst { userId, timestamp, source } = items[0].json;\n\n// تحليل نوع المستخدم\nconst userAnalysis = {\n  isNewUser: !userId || userId.includes('temp'),\n  timestamp: new Date(timestamp),\n  dayOfWeek: new Date(timestamp).getDay(),\n  hourOfDay: new Date(timestamp).getHours()\n};\n\n// اقتراحات بناء على التوقيت\nlet suggestions = [];\nif (userAnalysis.hourOfDay >= 9 && userAnalysis.hourOfDay <= 17) {\n  suggestions.push('Peak selling hours - high visibility expected');\n}\nif (userAnalysis.dayOfWeek >= 1 && userAnalysis.dayOfWeek <= 5) {\n  suggestions.push('Weekday listing - business buyers active');\n}\n\n// إرجاع البيانات المعالجة\nreturn [{\n  json: {\n    userId,\n    timestamp,\n    source,\n    userAnalysis,\n    suggestions,\n    nextStep: 'vehicle_type_selection',\n    processingComplete: true\n  }\n}];"
      },
      "id": "c3c89a8f-75e6-4e61-b3e1-c1234567890c",
      "name": "Process Sell Start Data",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/log-event",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "={\n  \"event\": \"sell_process_started\",\n  \"userId\": \"{{$json.userId}}\",\n  \"timestamp\": \"{{$json.timestamp}}\",\n  \"source\": \"{{$json.source}}\",\n  \"analysis\": {{JSON.stringify($json.userAnalysis)}},\n  \"suggestions\": {{JSON.stringify($json.suggestions)}}\n}",
        "headerParametersJson": "{\n  \"Content-Type\": \"application/json\",\n  \"User-Agent\": \"n8n-globul-cars/1.0\"\n}"
      },
      "id": "d4d89a8f-75e6-4e61-b3e1-c1234567890d",
      "name": "Log to Firebase",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [900, 300],
      "continueOnFail": true
    }
  ],
  "connections": {
    "Webhook - Sell Started": {
      "main": [
        [
          {
            "node": "Set Data Structure",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Data Structure": {
      "main": [
        [
          {
            "node": "Process Sell Start Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Sell Start Data": {
      "main": [
        [
          {
            "node": "Log to Firebase",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {},
  "versionId": "00000000-0000-0000-0000-000000000000"
}
```

---

## ✅ **بعد الاستيراد**

### 1. 💾 احفظ الـ Workflow
- اضغط **"Save"** في الأعلى
- سيُحفظ باسم "Globul Cars - Sell Process Started"

### 2. 🔧 فعّل الـ Workflow  
- اضغط زر **"Active"** لتفعيله
- ستظهر نقطة خضراء تدل على التفعيل

### 3. 📋 انسخ Webhook URL
- اضغط على **"Webhook - Sell Started"** node
- انسخ الـ **Production URL**
- ستكون مثل: `https://globul-cars-bg.app.n8n.cloud/webhook/sell-started`

---

## 🔄 **كرر نفس العملية للـ Workflow الثاني**

سأعطيك الـ JSON للـ workflow الثاني في الرسالة التالية.

---

## ⚡ **نصائح سريعة**

### ✅ **تأكد من**
- تفعيل كل workflow بعد الاستيراد
- نسخ Production URLs للـ webhooks
- اختبار التكامل بعد الانتهاء

### 🎯 **النتيجة المتوقعة**
بعد استيراد الـ workflows ستحصل على:
- 📊 تتبع تلقائي لمسار البيع
- 📧 إشعارات إدارية
- 📈 تحليل سلوك المستخدمين
- 🔄 أتمتة كاملة لعمليات الموقع

**ابدأ بالـ workflow الأول، وأخبرني عند الانتهاء للـ workflow الثاني!** 🚀