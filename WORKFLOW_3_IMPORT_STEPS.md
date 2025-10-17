# 🎯 خطوات الاستيراد التفصيلية - Workflow 3

## 📋 **الخطوة 1: تحضير الـ JSON**

انسخ هذا الكود بالكامل:

```json
{
  "name": "Globul Cars - Complete Sell Workflow",
  "nodes": [
    {
      "parameters": {
        "path": "seller-type-selected",
        "options": {}
      },
      "id": "webhook-seller-type",
      "name": "Webhook - Seller Type Selected",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "seller-type-webhook"
    },
    {
      "parameters": {
        "path": "vehicle-data-entered",
        "options": {}
      },
      "id": "webhook-vehicle-data",
      "name": "Webhook - Vehicle Data Entered",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 500],
      "webhookId": "vehicle-data-webhook"
    },
    {
      "parameters": {
        "path": "equipment-selected",
        "options": {}
      },
      "id": "webhook-equipment",
      "name": "Webhook - Equipment Selected",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 700],
      "webhookId": "equipment-webhook"
    },
    {
      "parameters": {
        "path": "images-uploaded",
        "options": {}
      },
      "id": "webhook-images",
      "name": "Webhook - Images Uploaded",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 900],
      "webhookId": "images-webhook"
    },
    {
      "parameters": {
        "path": "price-set",
        "options": {}
      },
      "id": "webhook-price",
      "name": "Webhook - Price Set",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 1100],
      "webhookId": "price-webhook"
    },
    {
      "parameters": {
        "path": "contact-info-entered",
        "options": {}
      },
      "id": "webhook-contact",
      "name": "Webhook - Contact Info Entered",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 1300],
      "webhookId": "contact-webhook"
    },
    {
      "parameters": {
        "path": "listing-published",
        "options": {}
      },
      "id": "webhook-published",
      "name": "Webhook - Listing Published",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 1500],
      "webhookId": "published-webhook"
    },
    {
      "parameters": {
        "functionCode": "const inputData = items[0].json;\nconst { step, userId, data, timestamp } = inputData;\n\nconst sellSteps = {\n  'seller_type': { stepNumber: 2, completion: 20, nextStep: 'vehicle_data', criticalData: ['sellerType', 'businessInfo'] },\n  'vehicle_data': { stepNumber: 3, completion: 40, nextStep: 'equipment', criticalData: ['make', 'model', 'year', 'mileage'] },\n  'equipment': { stepNumber: 4, completion: 60, nextStep: 'images', criticalData: ['safety', 'comfort', 'tech'] },\n  'images': { stepNumber: 5, completion: 75, nextStep: 'price', criticalData: ['imageCount', 'mainImage'] },\n  'price': { stepNumber: 6, completion: 90, nextStep: 'contact', criticalData: ['price', 'currency', 'negotiable'] },\n  'contact': { stepNumber: 7, completion: 95, nextStep: 'publish', criticalData: ['name', 'phone', 'location'] },\n  'published': { stepNumber: 8, completion: 100, nextStep: 'complete', criticalData: ['listingId', 'publicUrl'] }\n};\n\nconst stepInfo = sellSteps[step] || { stepNumber: 1, completion: 10, nextStep: 'unknown', criticalData: [] };\nconst dataQuality = { complete: stepInfo.criticalData.every(field => data && data[field]), missing: stepInfo.criticalData.filter(field => !data || !data[field]), score: data ? (Object.keys(data).length / stepInfo.criticalData.length) * 100 : 0 };\nconst dropOffRisk = { high: stepInfo.completion > 80 && dataQuality.score < 70, medium: stepInfo.completion > 50 && dataQuality.score < 50, low: dataQuality.score > 80 };\n\nlet interventions = [];\nif (dropOffRisk.high) { interventions.push('Send urgent assistance offer'); interventions.push('Activate customer support chat'); }\nif (dataQuality.missing.length > 0) { interventions.push(`Help with: ${dataQuality.missing.join(', ')}`); }\nif (stepInfo.completion > 70) { interventions.push('Send completion encouragement'); }\n\nreturn [{ json: { userId, step, stepInfo, dataQuality, dropOffRisk, interventions, processedAt: new Date().toISOString(), needsAttention: dropOffRisk.high || dataQuality.score < 50 } }];"
      },
      "id": "analyze-sell-funnel",
      "name": "Analyze Sell Funnel",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [600, 800]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.needsAttention}}",
              "value2": true
            }
          ]
        }
      },
      "id": "needs-attention-check",
      "name": "Needs Attention?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [820, 800]
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/urgent-intervention",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"userId\": \"{{$json.userId}}\",\n  \"step\": \"{{$json.step}}\",\n  \"riskLevel\": \"high\",\n  \"interventions\": {{JSON.stringify($json.interventions)}},\n  \"dataQuality\": {{$json.dataQuality.score}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "urgent-intervention",
      "name": "Send Urgent Intervention",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1040, 700],
      "continueOnFail": true
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/sell-funnel-analytics",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"userId\": \"{{$json.userId}}\",\n  \"step\": \"{{$json.step}}\",\n  \"completion\": {{$json.stepInfo.completion}},\n  \"dataQuality\": {{$json.dataQuality.score}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "log-analytics",
      "name": "Log Sell Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1040, 900],
      "continueOnFail": true
    }
  ],
  "connections": {
    "Webhook - Seller Type Selected": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Vehicle Data Entered": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Equipment Selected": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Images Uploaded": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Price Set": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Contact Info Entered": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Listing Published": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Analyze Sell Funnel": { "main": [[ { "node": "Needs Attention?", "type": "main", "index": 0 } ]] },
    "Needs Attention?": { "main": [[ { "node": "Send Urgent Intervention", "type": "main", "index": 0 } ], [ { "node": "Log Sell Analytics", "type": "main", "index": 0 } ]] },
    "Send Urgent Intervention": { "main": [[ { "node": "Log Sell Analytics", "type": "main", "index": 0 } ]] }
  },
  "active": false,
  "settings": {},
  "versionId": "00000000-0000-0000-0000-000000000000"
}
```

---

## 🔥 **الخطوة 2: الاستيراد في n8n**

### في المتصفح المفتوح:

1. **اضغط على** `+ New Workflow` (الزر الأزرق)

2. **اضغط على** الثلاث نقاط `⋯` في أعلى اليمين

3. **اختر** `Import from JSON`

4. **الصق** الكود المنسوخ أعلاه

5. **اضغط** `Import`

6. **اضغط** `Save` (Ctrl+S)

7. **اضغط** `Active` (تشغيل الـ workflow)

---

## ✅ **النتيجة المتوقعة:**

- **7 webhooks جديدة** للـ sell process
- **AI Analysis** لـ funnel optimization  
- **Smart interventions** لمنع المستخدمين من التوقف
- **Real-time analytics** لعملية البيع

---

## 🚀 **بعد الانتهاء:**

اكتب "تم" وسأعطيك الـ workflow التالي!

**Workflow 3 Status**: 🔄 في الانتظار...