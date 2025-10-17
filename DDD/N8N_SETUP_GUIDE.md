# 🚀 دليل إعداد n8n لمشروع Globul Cars

## 📋 المتطلبات الأساسية

### 1. البرامج المطلوبة
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0  
- **Docker** (اختياري للإنتاج)
- **PostgreSQL** (للإنتاج) أو SQLite (للتطوير)

### 2. الحسابات المطلوبة
- حساب n8n Cloud (اختياري)
- خادم للاستضافة الذاتية
- قاعدة بيانات PostgreSQL

---

## 🛠 إعداد n8n محلياً

### الخطوة 1: تثبيت n8n
```bash
# تثبيت n8n عالمياً
npm install n8n -g

# أو باستخدام npx (مستحسن)
npx n8n
```

### الخطوة 2: إعداد متغيرات البيئة
```bash
# إنشاء ملف .env
touch .env.n8n

# إضافة المتغيرات
echo "N8N_BASIC_AUTH_ACTIVE=true" >> .env.n8n
echo "N8N_BASIC_AUTH_USER=admin" >> .env.n8n
echo "N8N_BASIC_AUTH_PASSWORD=globul2025!" >> .env.n8n
echo "N8N_HOST=0.0.0.0" >> .env.n8n
echo "N8N_PORT=5678" >> .env.n8n
echo "N8N_PROTOCOL=http" >> .env.n8n
echo "WEBHOOK_URL=http://localhost:5678" >> .env.n8n
```

### الخطوة 3: تشغيل n8n
```bash
# تحميل متغيرات البيئة وتشغيل n8n
source .env.n8n && n8n start

# أو باستخدام npx
npx n8n start
```

### الخطوة 4: الوصول لواجهة n8n
افتح المتصفح على: `http://localhost:5678`

---

## 🔧 إنشاء أول Workflow

### 1. Workflow: تسجيل بداية البيع

#### أ. إنشاء Workflow جديد
1. اذهب إلى n8n interface
2. اضغط "New Workflow" 
3. اسم الـ workflow: "Globul Cars - Sell Started"

#### ب. إضافة Webhook Trigger
1. اضغط "+" لإضافة نود جديد
2. اختر "Trigger" → "Webhook"
3. إعدادات Webhook:
   - **HTTP Method**: POST
   - **Path**: `/webhook/sell-started`
   - **Response**: Return JSON

#### ج. إضافة نود معالجة البيانات
1. اضغ "+" بعد Webhook
2. اختر "Core" → "Set" 
3. إعداد البيانات:
```json
{
  "userId": "={{$json.userId}}",
  "timestamp": "={{$json.timestamp}}",
  "event": "sell_started",
  "source": "globul_cars_web",
  "processedAt": "={{new Date().toISOString()}}"
}
```

#### د. إضافة نود تسجيل في قاعدة البيانات
1. اضغط "+" بعد Set
2. اختر "App" → "HTTP Request"
3. إعدادات الطلب:
   - **Method**: POST
   - **URL**: `https://fire-new-globul.firebaseapp.com/api/log-event`
   - **Headers**: 
     ```json
     {
       "Content-Type": "application/json",
       "Authorization": "Bearer {{$env.FIREBASE_TOKEN}}"
     }
     ```
   - **Body**: Raw JSON من النود السابق

#### هـ. إضافة نود الإشعارات
1. اضغط "+" لنود جديد
2. اختر "Communication" → "Email"
3. إعداد الإيميل:
   - **To**: `admin@globul.net`
   - **Subject**: `New Sell Process Started - {{$json.userId}}`
   - **Body**: 
   ```html
   <h2>🚀 New Car Listing Started</h2>
   <p><strong>User ID:</strong> {{$json.userId}}</p>
   <p><strong>Time:</strong> {{$json.timestamp}}</p>
   <p><strong>Source:</strong> {{$json.source}}</p>
   ```

#### و. حفظ وتفعيل الـ Workflow
1. اضغط "Save" أعلى الصفحة
2. اضغط "Active" لتفعيل الـ workflow

---

## 🧪 اختبار التكامل

### 1. اختبار Webhook من التطبيق

في مشروع React، اضف هذا الكود لاختبار n8n:

```typescript
// Test n8n integration
const testN8nIntegration = async () => {
  try {
    const response = await fetch('http://localhost:5678/webhook/sell-started', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        timestamp: new Date().toISOString(),
        source: 'globul_cars_web',
        testMode: true
      })
    });
    
    const result = await response.json();
    console.log('N8N Response:', result);
  } catch (error) {
    console.error('N8N Test Failed:', error);
  }
};

// اتصل بالدالة عند اختبار النظام
testN8nIntegration();
```

### 2. مراقبة تنفيذ الـ Workflow
1. اذهب لـ n8n interface
2. اضغط "Executions" في الشريط الجانبي
3. ستري جميع تنفيذات الـ workflows

---

## 🔄 إعداد Workflows إضافية

### Workflow 2: معالجة اختيار نوع السيارة

```json
{
  "name": "Vehicle Type Selected",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "vehicle-type-selected",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Analyze Vehicle Type",
      "type": "n8n-nodes-base.function", 
      "parameters": {
        "functionCode": `
          const { userId, vehicleType } = items[0].json;
          
          // تحليل نوع السيارة
          const isCommercial = ['truck', 'bus', 'van'].includes(vehicleType);
          const recommendations = {
            car: ['Focus on fuel efficiency', 'Highlight safety features'],
            suv: ['Emphasize space and power', 'Target family buyers'],
            truck: ['Commercial use cases', 'Payload capacity'],
            motorcycle: ['Performance specs', 'Safety gear recommendations']
          };
          
          return [{
            json: {
              userId,
              vehicleType,
              isCommercial,
              recommendations: recommendations[vehicleType] || [],
              suggestedSellerType: isCommercial ? 'dealer' : 'private',
              nextStepAdvice: 'Select appropriate seller type'
            }
          }];
        `
      }
    },
    {
      "name": "Log to Firebase",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.FIREBASE_API_URL}}/log-vehicle-selection",
        "method": "POST"
      }
    }
  ]
}
```

### Workflow 3: معالجة رفع الصور

```json
{
  "name": "Images Processing Pipeline", 
  "nodes": [
    {
      "name": "Images Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "images-uploaded"
      }
    },
    {
      "name": "Process Images",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": `
          const { userId, carId, imageCount } = items[0].json;
          
          // قوائم تحقق من جودة الصور
          const checks = {
            minimumImages: imageCount >= 3,
            recommendedImages: imageCount >= 5,
            qualityScore: Math.min(imageCount * 20, 100)
          };
          
          // اقتراحات تحسين
          const suggestions = [];
          if (imageCount < 3) {
            suggestions.push('أضف على الأقل 3 صور للحصول على اهتمام أكبر');
          }
          if (imageCount < 8) {
            suggestions.push('صور إضافية من الداخل والخارج ستزيد من جاذبية الإعلان');
          }
          
          return [{
            json: {
              userId,
              carId,
              imageCount,
              qualityChecks: checks,
              suggestions,
              processingStatus: 'completed',
              nextStep: 'pricing'
            }
          }];
        `
      }
    },
    {
      "name": "Send Processing Results",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

---

## 📊 إعداد Dashboard للمراقبة

### 1. إنشاء Workflow للإحصائيات اليومية

```javascript
// Node Function: Daily Stats Collection
const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

// جمع الإحصائيات من Firebase
const stats = {
  newUsers: 0,      // سيتم جلبها من Firebase
  newCars: 0,       // عدد السيارات المضافة اليوم
  messagesExchanged: 0, // الرسائل المتبادلة
  sellWorkflowsStarted: 0, // عدد مرات بدء البيع
  sellWorkflowsCompleted: 0, // عدد الإكمالات
  conversionRate: 0 // معدل التحويل
};

return [{
  json: {
    date: new Date().toISOString().split('T')[0],
    stats,
    generated: new Date()
  }
}];
```

### 2. إرسال تقرير يومي

```javascript
// Email Template Node
const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: linear-gradient(135deg, #ff8f10, #005ca9); color: white; padding: 20px; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
    .number { font-size: 2em; font-weight: bold; color: #ff8f10; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚗 Globul Cars - Daily Report</h1>
    <p>{{$json.date}}</p>
  </div>
  
  <div class="stats">
    <div class="stat-card">
      <div class="number">{{$json.stats.newUsers}}</div>
      <div>New Users</div>
    </div>
    <div class="stat-card">
      <div class="number">{{$json.stats.newCars}}</div>
      <div>Cars Listed</div>
    </div>
    <div class="stat-card">
      <div class="number">{{$json.stats.conversionRate}}%</div>
      <div>Conversion Rate</div>
    </div>
  </div>
</body>
</html>
`;
```

---

## 🚀 النشر في الإنتاج

### 1. إعداد خادم الإنتاج

```bash
# إنشاء مستخدم n8n
sudo useradd -m -s /bin/bash n8n

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت n8n
sudo npm install n8n -g

# إعداد قاعدة البيانات PostgreSQL
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb n8n_db
sudo -u postgres createuser -P n8n_user
```

### 2. إعداد متغيرات البيئة للإنتاج

```bash
# /home/n8n/.env
export DB_TYPE=postgresdb
export DB_POSTGRESDB_HOST=localhost
export DB_POSTGRESDB_PORT=5432
export DB_POSTGRESDB_DATABASE=n8n_db
export DB_POSTGRESDB_USER=n8n_user
export DB_POSTGRESDB_PASSWORD=your_password

export N8N_HOST=0.0.0.0
export N8N_PORT=5678
export N8N_PROTOCOL=https
export WEBHOOK_URL=https://n8n.globul.net

export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=globul_admin
export N8N_BASIC_AUTH_PASSWORD=strong_password_here
```

### 3. إعداد SSL والنطاق

```nginx
# /etc/nginx/sites-available/n8n.globul.net
server {
    listen 80;
    server_name n8n.globul.net;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name n8n.globul.net;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 📈 المراقبة والصيانة

### 1. إعداد مراقبة الصحة

```javascript
// Health Check Workflow
const healthChecks = [
  {
    name: 'Firebase Connection',
    test: () => fetch('https://fire-new-globul.firebaseapp.com/health'),
    critical: true
  },
  {
    name: 'Database Connection', 
    test: () => checkDatabaseConnection(),
    critical: true
  },
  {
    name: 'Webhook Response Time',
    test: () => measureWebhookLatency(),
    critical: false
  }
];

// تشغيل الفحوصات
const results = await Promise.all(
  healthChecks.map(async check => {
    try {
      const result = await check.test();
      return { name: check.name, status: 'OK', result };
    } catch (error) {
      return { name: check.name, status: 'FAILED', error: error.message };
    }
  })
);

return [{ json: { timestamp: new Date(), checks: results } }];
```

### 2. إعداد التنبيهات

```yaml
# Alert Rules
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 5%"
    action: "Send Slack notification"
    
  - name: "Slow Response Time" 
    condition: "avg_response_time > 5s"
    action: "Send email to DevOps team"
    
  - name: "Low Conversion Rate"
    condition: "daily_conversion < 2%"
    action: "Notify marketing team"
```

---

## 🎯 الخطوات التالية

1. **إعداد n8n محلياً** ✅
2. **إنشاء أول 3 workflows أساسية**
3. **اختبار التكامل مع React**
4. **إعداد قاعدة بيانات الإنتاج**
5. **نشر على خادم الإنتاج**
6. **إعداد المراقبة والتنبيهات**
7. **تدريب الفريق على إدارة n8n**

---

## 🆘 المساعدة والدعم

### الموارد المفيدة:
- **n8n Documentation**: https://docs.n8n.io
- **Community Forum**: https://community.n8n.io
- **GitHub Repository**: https://github.com/n8n-io/n8n

### الاتصال للدعم:
- **Email**: support@globul.net
- **Slack**: #n8n-integration
- **Documentation**: هذا الملف!

---

**تم إعداد هذا الدليل خصيصاً لمشروع Globul Cars**  
**التاريخ**: 16 أكتوبر 2025  
**الإصدار**: 1.0