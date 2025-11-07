# 📧 SendGrid Email Setup Guide
**الوقت المطلوب:** 1 ساعة  
**التكلفة:** €0 (حتى 100 email/day)  
**الترقية:** €12-15/month (unlimited emails + templates)

---

## 🎯 ما سنفعله (1 ساعة)

1. ✅ إنشاء حساب SendGrid (10 دقائق)
2. ✅ التحقق من Domain (15 دقيقة)
3. ✅ إنشاء Email Templates (15 دقائق)
4. ✅ Firebase Function للإرسال (15 دقائق)
5. ✅ اختبار (5 دقائق)

---

## لماذا SendGrid؟

### المشكلة بدون SendGrid:
```
❌ Gmail SMTP: 500 emails/day limit
❌ Outlook SMTP: Lands in spam
❌ Firebase Extensions: €0.01/email = €60/month for 6K emails
❌ NodeMailer مباشر: معقد + IP blacklisting
```

### الحل مع SendGrid:
```
✅ 100 emails/day مجانًا (3,000/month)
✅ Professional delivery (99% inbox rate)
✅ Email templates with Bulgarian/English
✅ Analytics (open rate, click rate)
✅ Dedicated IP (في الخطط المدفوعة)
✅ API بسيط
✅ Automatic retry logic
✅ Bounce management
```

---

## الخطة المجانية vs المدفوعة

| Feature | Free | Essentials (€12/month) | Pro (€80/month) |
|---------|------|------------------------|-----------------|
| **Emails/day** | 100 | 100,000 | 1.5M |
| **Emails/month** | 3,000 | Unlimited | Unlimited |
| **Email templates** | ✅ Basic | ✅ Advanced | ✅ Advanced |
| **Analytics** | ✅ Basic | ✅ Advanced | ✅ Advanced |
| **Dedicated IP** | ❌ | ❌ | ✅ |
| **Support** | Community | Email | Phone + Priority |
| **Custom domain** | ✅ | ✅ | ✅ |

**توصيتنا:** 
- شهر 1-3: **Free plan** (100 emails/day كافية)
- شهر 4+: **Essentials** عند إرسال newsletters

---

## الخطوة 1: إنشاء حساب SendGrid (10 دقائق)

### 1.1 التسجيل

**1. انتقل إلى:**
```
https://signup.sendgrid.com
```

**2. املأ البيانات:**
```
Email: your-email@example.com
Password: (strong password)
Company Name: Globul Cars
Website: https://globulcars.bg
```

**3. تأكيد Email:**
```
- تحقق من صندوق البريد
- انقر على "Verify Email Address"
- سيُعيد توجيهك إلى Dashboard
```

---

### 1.2 إكمال Onboarding

**SendGrid سيسأل:**

**1. What do you want to do first?**
```
اختر: "Integrate using our Web API or SMTP Relay"
```

**2. How are you sending email?**
```
اختر: "I'm using a programming language"
→ Node.js
```

**3. Tell us about your email:**
```
- I send: Transactional emails (ترحيب، تأكيد، إشعارات)
- Monthly volume: 0-3,000 (Free tier)
```

**4. Create API Key:**
```
API Key Name: globul-cars-api-key
Permissions: Full Access

⚠️ IMPORTANT: احفظ API Key الآن!
سيظهر مرة واحدة فقط:
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

احفظه في ملف آمن (ستحتاجه في Firebase Functions)
```

---

## الخطوة 2: التحقق من Domain (15 دقيقة)

### لماذا Domain Verification؟
```
بدون verification:
- Emails تذهب للـ spam
- "Via sendgrid.net" يظهر في From address

مع verification:
- Emails من "noreply@globulcars.bg"
- Professional appearance
- Higher inbox rate (99% vs 70%)
```

---

### 2.1 Domain Authentication

**1. في SendGrid Dashboard:**
```
Settings → Sender Authentication → Authenticate Your Domain
```

**2. DNS Provider:**
```
اختر: Other Host (أو Cloudflare إذا تستخدمه)
```

**3. Domain Details:**
```
Domain: globulcars.bg
Advanced Settings:
- Use automated security: ✅ Yes
- Custom return path: ✅ Yes (mail.globulcars.bg)
```

**4. DNS Records:**
```
SendGrid سيُعطيك 3 DNS records:

CNAME Record 1:
Host: em1234.globulcars.bg
Value: u12345678.wl123.sendgrid.net
TTL: 3600

CNAME Record 2:
Host: s1._domainkey.globulcars.bg
Value: s1.domainkey.u12345678.wl123.sendgrid.net
TTL: 3600

CNAME Record 3:
Host: s2._domainkey.globulcars.bg
Value: s2.domainkey.u12345678.wl123.sendgrid.net
TTL: 3600
```

---

### 2.2 إضافة DNS Records

**إذا كنت تستخدم Cloudflare:**

```
1. انتقل إلى: https://dash.cloudflare.com
2. اختر domain: globulcars.bg
3. DNS → Add record

لكل Record:
- Type: CNAME
- Name: (copy from SendGrid)
- Target: (copy from SendGrid)
- Proxy status: DNS only (رمادي، ليس برتقالي!)
- TTL: Auto
- انقر "Save"
```

**إذا كنت تستخدم GoDaddy/Namecheap:**
```
1. انتقل إلى Domain DNS settings
2. Add CNAME record
3. Host: (من SendGrid)
4. Points to: (من SendGrid)
5. TTL: 1 Hour
6. Save
```

---

### 2.3 التحقق من Verification

**في SendGrid Dashboard:**
```
1. انقر "Verify" بعد إضافة DNS records
2. إذا فشل: انتظر 5-10 دقائق (DNS propagation)
3. جرّب مرة أخرى
4. عندما ينجح: سترى ✅ "Verified"
```

**تحقق يدويًا:**
```bash
# في Command Prompt/PowerShell:
nslookup em1234.globulcars.bg

# يجب أن ترى:
Non-authoritative answer:
em1234.globulcars.bg canonical name = u12345678.wl123.sendgrid.net
```

---

## الخطوة 3: إنشاء Email Templates (15 دقيقة)

### 3.1 Welcome Email Template

**في SendGrid:**
```
Email API → Dynamic Templates → Create a Dynamic Template
```

**Template Name:** `welcome-email-bg-en`

**Design Editor → Blank Template**

**HTML Code (Bulgarian + English):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #FF8F10 0%, #FF6600 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
      line-height: 1.6;
      color: #333;
    }
    .button {
      display: inline-block;
      background: #FF8F10;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{#if language_bg}}Добре дошли в Globul Cars!{{else}}Welcome to Globul Cars!{{/if}}</h1>
    </div>
    
    <div class="content">
      {{#if language_bg}}
      <p>Здравейте {{userName}},</p>
      <p>Благодарим ви, че се присъединихте към Globul Cars - най-големият пазар за автомобили в България!</p>
      
      <h3>Какво можете да правите:</h3>
      <ul>
        <li>✅ Разгледайте над 10,000 автомобила</li>
        <li>✅ Публикувайте вашата обява безплатно</li>
        <li>✅ Свържете се директно с продавачи</li>
        <li>✅ Получавайте ценови алерти</li>
      </ul>
      
      <a href="{{dashboardUrl}}" class="button">Отидете на Табло</a>
      
      <p>Ако имате въпроси, просто отговорете на този имейл.</p>
      
      <p>Поздрави,<br>Екипът на Globul Cars</p>
      {{else}}
      <p>Hello {{userName}},</p>
      <p>Thank you for joining Globul Cars - Bulgaria's largest car marketplace!</p>
      
      <h3>What you can do:</h3>
      <ul>
        <li>✅ Browse over 10,000 cars</li>
        <li>✅ Post your listing for free</li>
        <li>✅ Connect directly with sellers</li>
        <li>✅ Receive price alerts</li>
      </ul>
      
      <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
      
      <p>If you have questions, just reply to this email.</p>
      
      <p>Regards,<br>The Globul Cars Team</p>
      {{/if}}
    </div>
    
    <div class="footer">
      <p>Globul Cars &copy; 2025 | Sofia, Bulgaria</p>
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
```

**Test Data:**
```json
{
  "language_bg": true,
  "userName": "Иван Иванов",
  "dashboardUrl": "https://globulcars.bg/dashboard",
  "unsubscribeUrl": "https://globulcars.bg/unsubscribe"
}
```

**احفظ Template وخذ Template ID:**
```
d-1234567890abcdef1234567890abcdef
```

---

### 3.2 Listing Approved Template

**Template Name:** `listing-approved-bg-en`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{#if language_bg}}Вашата обява е одобрена!{{else}}Your listing is approved!{{/if}}</h1>
    </div>
    
    <div class="content">
      {{#if language_bg}}
      <p>Поздравления {{userName}}!</p>
      <p>Вашата обява за <strong>{{carMake}} {{carModel}} {{carYear}}</strong> е одобрена и вече е онлайн!</p>
      
      <h3>Следващи стъпки:</h3>
      <ul>
        <li>📊 Вашата обява е видима за хиляди купувачи</li>
        <li>📞 Ще получавате съобщения от заинтересовани</li>
        <li>💎 Повишете обявата за още видимост</li>
      </ul>
      
      <a href="{{listingUrl}}" class="button">Вижте обявата</a>
      
      <p><strong>Съвет:</strong> Отговаряйте бързо на запитвания за по-високи шансове за продажба!</p>
      {{else}}
      <p>Congratulations {{userName}}!</p>
      <p>Your listing for <strong>{{carMake}} {{carModel}} {{carYear}}</strong> is approved and now live!</p>
      
      <h3>Next steps:</h3>
      <ul>
        <li>📊 Your listing is visible to thousands of buyers</li>
        <li>📞 You'll receive messages from interested parties</li>
        <li>💎 Promote your listing for more visibility</li>
      </ul>
      
      <a href="{{listingUrl}}" class="button">View Listing</a>
      
      <p><strong>Tip:</strong> Respond quickly to inquiries for higher chances of sale!</p>
      {{/if}}
    </div>
    
    <div class="footer">
      <p>Globul Cars &copy; 2025 | Sofia, Bulgaria</p>
    </div>
  </div>
</body>
</html>
```

---

### 3.3 Price Drop Alert Template

**Template Name:** `price-drop-alert-bg-en`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Same styles */
    .price-badge {
      background: #22c55e;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 20px;
      font-weight: bold;
      display: inline-block;
      margin: 10px 0;
    }
    .old-price {
      text-decoration: line-through;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{#if language_bg}}🔥 Цената падна!{{else}}🔥 Price Dropped!{{/if}}</h1>
    </div>
    
    <div class="content">
      {{#if language_bg}}
      <p>Здравейте {{userName}},</p>
      <p>Автомобилът, който следите, току-що намали цената!</p>
      
      <h3>{{carMake}} {{carModel}} {{carYear}}</h3>
      <p class="old-price">Стара цена: €{{oldPrice}}</p>
      <div class="price-badge">Нова цена: €{{newPrice}}</div>
      <p><strong>Спестявате: €{{savings}}</strong></p>
      
      <a href="{{carUrl}}" class="button">Вижте автомобила</a>
      
      <p>Побързайте - може да бъде продаден скоро!</p>
      {{else}}
      <p>Hello {{userName}},</p>
      <p>A car you're watching just dropped in price!</p>
      
      <h3>{{carMake}} {{carModel}} {{carYear}}</h3>
      <p class="old-price">Old price: €{{oldPrice}}</p>
      <div class="price-badge">New price: €{{newPrice}}</div>
      <p><strong>You save: €{{savings}}</strong></p>
      
      <a href="{{carUrl}}" class="button">View Car</a>
      
      <p>Hurry - it might be sold soon!</p>
      {{/if}}
    </div>
    
    <div class="footer">
      <p>Globul Cars &copy; 2025 | Sofia, Bulgaria</p>
      <p><a href="{{unsubscribeUrl}}">Stop price alerts</a></p>
    </div>
  </div>
</body>
</html>
```

---

## الخطوة 4: Firebase Function للإرسال (15 دقائق)

### 4.1 تثبيت SendGrid SDK

**في directory functions:**
```bash
cd functions
npm install @sendgrid/mail
```

---

### 4.2 إنشاء sendgrid.service.ts

**ملف جديد:** `functions/src/services/sendgrid.service.ts`

```typescript
import * as sgMail from '@sendgrid/mail';
import * as functions from 'firebase-functions';

// تفعيل SendGrid
const SENDGRID_API_KEY = functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️ SendGrid API key not found. Email sending will fail.');
}

// Template IDs (احفظها من SendGrid Dashboard)
export const TEMPLATES = {
  WELCOME: 'd-1234567890abcdef1234567890abcdef',
  LISTING_APPROVED: 'd-fedcba0987654321fedcba0987654321',
  PRICE_DROP: 'd-abcd1234abcd1234abcd1234abcd1234',
};

/**
 * إرسال Welcome Email
 */
export const sendWelcomeEmail = async (
  to: string,
  userName: string,
  language: 'bg' | 'en' = 'bg'
): Promise<void> => {
  const msg = {
    to,
    from: {
      email: 'noreply@globulcars.bg',
      name: language === 'bg' ? 'Globul Cars' : 'Globul Cars'
    },
    templateId: TEMPLATES.WELCOME,
    dynamicTemplateData: {
      language_bg: language === 'bg',
      userName,
      dashboardUrl: 'https://globulcars.bg/dashboard',
      unsubscribeUrl: `https://globulcars.bg/unsubscribe?email=${encodeURIComponent(to)}`
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Welcome email sent to ${to}`);
  } catch (error: any) {
    console.error('❌ SendGrid error:', error.response?.body || error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

/**
 * إرسال Listing Approved Email
 */
export const sendListingApprovedEmail = async (
  to: string,
  userName: string,
  carDetails: {
    make: string;
    model: string;
    year: number;
    listingUrl: string;
  },
  language: 'bg' | 'en' = 'bg'
): Promise<void> => {
  const msg = {
    to,
    from: {
      email: 'noreply@globulcars.bg',
      name: 'Globul Cars'
    },
    templateId: TEMPLATES.LISTING_APPROVED,
    dynamicTemplateData: {
      language_bg: language === 'bg',
      userName,
      carMake: carDetails.make,
      carModel: carDetails.model,
      carYear: carDetails.year,
      listingUrl: carDetails.listingUrl
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Listing approved email sent to ${to}`);
  } catch (error: any) {
    console.error('❌ SendGrid error:', error.response?.body || error);
    throw new Error(`Failed to send listing approved email: ${error.message}`);
  }
};

/**
 * إرسال Price Drop Alert
 */
export const sendPriceDropAlert = async (
  to: string,
  userName: string,
  carDetails: {
    make: string;
    model: string;
    year: number;
    oldPrice: number;
    newPrice: number;
    carUrl: string;
  },
  language: 'bg' | 'en' = 'bg'
): Promise<void> => {
  const savings = carDetails.oldPrice - carDetails.newPrice;

  const msg = {
    to,
    from: {
      email: 'noreply@globulcars.bg',
      name: 'Globul Cars'
    },
    templateId: TEMPLATES.PRICE_DROP,
    dynamicTemplateData: {
      language_bg: language === 'bg',
      userName,
      carMake: carDetails.make,
      carModel: carDetails.model,
      carYear: carDetails.year,
      oldPrice: carDetails.oldPrice.toLocaleString(),
      newPrice: carDetails.newPrice.toLocaleString(),
      savings: savings.toLocaleString(),
      carUrl: carDetails.carUrl,
      unsubscribeUrl: `https://globulcars.bg/unsubscribe?email=${encodeURIComponent(to)}`
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Price drop alert sent to ${to}`);
  } catch (error: any) {
    console.error('❌ SendGrid error:', error.response?.body || error);
    throw new Error(`Failed to send price drop alert: ${error.message}`);
  }
};

/**
 * إرسال Bulk Emails (Newsletter)
 * ⚠️ Free tier: 100 emails/day
 */
export const sendBulkEmail = async (
  recipients: Array<{ email: string; name: string; language?: 'bg' | 'en' }>,
  templateId: string,
  dynamicTemplateData: Record<string, any>
): Promise<{ sent: number; failed: number }> => {
  let sent = 0;
  let failed = 0;

  // إرسال بـ batches (100 emails per request)
  for (let i = 0; i < recipients.length; i += 100) {
    const batch = recipients.slice(i, i + 100);

    const messages = batch.map(recipient => ({
      to: recipient.email,
      from: {
        email: 'noreply@globulcars.bg',
        name: 'Globul Cars'
      },
      templateId,
      dynamicTemplateData: {
        ...dynamicTemplateData,
        userName: recipient.name,
        language_bg: recipient.language === 'bg'
      }
    }));

    try {
      await sgMail.send(messages);
      sent += batch.length;
      console.log(`✅ Batch sent: ${batch.length} emails`);
    } catch (error: any) {
      console.error('❌ Batch failed:', error.response?.body || error);
      failed += batch.length;
    }

    // Rate limiting: انتظر 1 ثانية بين batches
    if (i + 100 < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`📧 Bulk email complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
};
```

---

### 4.3 إنشاء Cloud Function

**ملف جديد:** `functions/src/email/email-functions.ts`

```typescript
import * as functions from 'firebase-functions';
import { sendWelcomeEmail, sendListingApprovedEmail, sendPriceDropAlert } from '../services/sendgrid.service';

/**
 * Trigger: عند إنشاء مستخدم جديد
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const { email, displayName } = user;

  if (!email) {
    console.log('User has no email, skipping welcome email');
    return;
  }

  try {
    await sendWelcomeEmail(
      email,
      displayName || email.split('@')[0],
      'bg' // Default Bulgarian
    );
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw - email failure shouldn't break user creation
  }
});

/**
 * Trigger: عند الموافقة على listing
 */
export const onListingApproved = functions.firestore
  .document('cars/{carId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // تحقق إذا تغيرت status من pending إلى approved
    if (before.status === 'pending' && after.status === 'approved') {
      const ownerEmail = after.sellerInfo?.email;
      const ownerName = after.sellerInfo?.name || 'Car Owner';

      if (!ownerEmail) {
        console.log('No owner email, skipping notification');
        return;
      }

      try {
        await sendListingApprovedEmail(
          ownerEmail,
          ownerName,
          {
            make: after.make,
            model: after.model,
            year: after.year,
            listingUrl: `https://globulcars.bg/car/${context.params.carId}`
          },
          after.sellerInfo?.language || 'bg'
        );
        console.log(`✅ Listing approved email sent for car ${context.params.carId}`);
      } catch (error) {
        console.error('❌ Failed to send listing approved email:', error);
      }
    }
  });

/**
 * Scheduled Function: Price Drop Alerts
 * Runs daily at 9 AM
 */
export const dailyPriceDropAlerts = functions.pubsub
  .schedule('0 9 * * *') // 9:00 AM daily
  .timeZone('Europe/Sofia')
  .onRun(async () => {
    const admin = await import('firebase-admin');
    const db = admin.firestore();

    console.log('🔍 Checking for price drops...');

    // Find cars with price changes in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const priceChangesSnapshot = await db.collection('priceChanges')
      .where('changedAt', '>=', yesterday)
      .where('newPrice', '<', 'oldPrice') // Price decreased
      .get();

    console.log(`Found ${priceChangesSnapshot.size} price drops`);

    for (const doc of priceChangesSnapshot.docs) {
      const change = doc.data();
      const carId = change.carId;

      // Get car details
      const carDoc = await db.collection('cars').doc(carId).get();
      if (!carDoc.exists) continue;
      const car = carDoc.data()!;

      // Get users watching this car
      const watchersSnapshot = await db.collection('watchlists')
        .where('carIds', 'array-contains', carId)
        .get();

      console.log(`Car ${carId}: ${watchersSnapshot.size} watchers`);

      // Send alert to each watcher
      for (const watcherDoc of watchersSnapshot.docs) {
        const watcher = watcherDoc.data();
        const userEmail = watcher.email;
        const userName = watcher.name || 'Car Enthusiast';
        const language = watcher.language || 'bg';

        try {
          await sendPriceDropAlert(
            userEmail,
            userName,
            {
              make: car.make,
              model: car.model,
              year: car.year,
              oldPrice: change.oldPrice,
              newPrice: change.newPrice,
              carUrl: `https://globulcars.bg/car/${carId}`
            },
            language
          );
          console.log(`✅ Price drop alert sent to ${userEmail}`);
        } catch (error) {
          console.error(`❌ Failed to send to ${userEmail}:`, error);
        }

        // Rate limiting: 1 email per second (free tier protection)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('✅ Daily price drop alerts complete');
  });
```

---

### 4.4 Export Functions

**في:** `functions/src/index.ts`

```typescript
// ... existing imports

// Email functions
import * as emailFunctions from './email/email-functions';

// ... existing exports

// Export email functions
exports.onUserCreated = emailFunctions.onUserCreated;
exports.onListingApproved = emailFunctions.onListingApproved;
exports.dailyPriceDropAlerts = emailFunctions.dailyPriceDropAlerts;
```

---

### 4.5 إضافة SendGrid API Key

**Option 1: Firebase Config (موصى به)**

```bash
# في terminal:
cd functions
firebase functions:config:set sendgrid.api_key="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Option 2: Environment Variables**

**في:** `functions/.env`
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 4.6 Deploy Functions

```bash
cd functions
npm run build
firebase deploy --only functions:onUserCreated,functions:onListingApproved,functions:dailyPriceDropAlerts
```

---

## الخطوة 5: اختبار (5 دقائق)

### 5.1 Test Welcome Email (Manual)

**في Firebase Console:**
```
Authentication → Users → Add User

Email: test@example.com
Password: Test123456!

انقر "Add User"
```

**تحقق:**
```
1. صندوق البريد test@example.com
2. يجب أن يصل welcome email خلال 10 ثوانٍ
3. تحقق من التنسيق، اللغة، الروابط
```

---

### 5.2 Test Listing Approved (Manual)

**في Firestore:**
```
1. افتح Firestore Console
2. Collection: cars
3. اختر أي document
4. Edit field: status
5. غيّر من "pending" إلى "approved"
6. Save

تحقق: يجب أن يصل email للـ sellerInfo.email
```

---

### 5.3 Test Price Drop Alert (Scheduled)

**الطريقة السريعة:**

```bash
# في Functions directory:
npm run shell

# في Firebase Shell:
> dailyPriceDropAlerts()

# انتظر التنفيذ...
# تحقق من Logs
```

**تحقق:**
```
- Console logs: "🔍 Checking for price drops..."
- Email arrives to watchers
```

---

## 🎯 استخدامات عملية

### 1. إرسال Newsletter شهري

**في:** `functions/src/email/newsletter-function.ts`

```typescript
import { sendBulkEmail } from '../services/sendgrid.service';

export const sendMonthlyNewsletter = functions.pubsub
  .schedule('0 10 1 * *') // 10 AM, 1st of month
  .timeZone('Europe/Sofia')
  .onRun(async () => {
    const admin = await import('firebase-admin');
    const db = admin.firestore();

    // Get all subscribed users
    const usersSnapshot = await db.collection('users')
      .where('emailPreferences.newsletter', '==', true)
      .get();

    const recipients = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        email: data.email,
        name: data.displayName || 'Car Enthusiast',
        language: data.language || 'bg'
      };
    });

    console.log(`Sending newsletter to ${recipients.length} users`);

    const result = await sendBulkEmail(
      recipients,
      TEMPLATES.NEWSLETTER, // Create this template in SendGrid
      {
        month: new Date().toLocaleDateString('bg-BG', { month: 'long' }),
        year: new Date().getFullYear(),
        topCarsUrl: 'https://globulcars.bg/top-cars',
        unsubscribeUrl: 'https://globulcars.bg/unsubscribe'
      }
    );

    console.log(`Newsletter sent: ${result.sent} ✅, ${result.failed} ❌`);
  });
```

---

### 2. إرسال Verification Email

```typescript
export const sendVerificationEmail = async (
  email: string,
  verificationCode: string
): Promise<void> => {
  const msg = {
    to: email,
    from: 'noreply@globulcars.bg',
    templateId: TEMPLATES.VERIFICATION,
    dynamicTemplateData: {
      verificationCode,
      verificationUrl: `https://globulcars.bg/verify?code=${verificationCode}`
    }
  };

  await sgMail.send(msg);
};
```

---

## 📊 Analytics & Monitoring

### في SendGrid Dashboard:

```
Activity → Email Activity

ستجد:
- Delivery rate (99%+ = ممتاز)
- Open rate (15-25% = normal)
- Click rate (2-5% = good)
- Bounces (< 1% = healthy)
- Spam reports (< 0.1% = excellent)
```

### تحسين Deliverability:

```
1. ✅ Domain verified (DKIM, SPF)
2. ✅ Professional templates
3. ✅ Unsubscribe link واضح
4. ✅ لا ترسل spam
5. ✅ Warm up: ابدأ بـ 50-100 emails/day، زِد تدريجيًا
```

---

## 💰 Cost Management

### Free Tier Limits:
```
100 emails/day = 3,000/month

Scenarios:
- 10 users/day signup = 10 welcome emails = 300/month ✅
- 5 listings/day approved = 5 emails = 150/month ✅
- Daily price alerts to 20 users = 600/month ✅
Total: 1,050/month = Well within free tier! 🎉
```

### متى تحتاج الترقية؟
```
Essentials Plan (€12/month) when:
- > 100 signups/day
- Newsletter to 1,000+ users weekly
- Transactional emails > 3,000/month
```

---

## ✅ Checklist

Setup:
- [ ] حساب SendGrid مُنشأ
- [ ] Email verified
- [ ] API Key created & saved
- [ ] Domain authenticated (3 DNS records)
- [ ] 3 Templates created (Welcome, Listing Approved, Price Drop)

Firebase Functions:
- [ ] @sendgrid/mail installed
- [ ] sendgrid.service.ts created
- [ ] email-functions.ts created
- [ ] Functions exported في index.ts
- [ ] API Key added (firebase config or .env)
- [ ] Functions deployed

Testing:
- [ ] Welcome email received (test user)
- [ ] Listing approved email received
- [ ] Price drop alert triggered
- [ ] Templates render correctly (BG + EN)
- [ ] Links work
- [ ] Unsubscribe works

---

## 🚀 الخطوة التالية

الآن لديك:
1. ✅ Firebase Blaze Plan
2. ✅ Google Analytics + Sentry
3. ✅ SendGrid Email (100/day مجانًا)

**التالي:** Cloud Scheduler - Automated Tasks! ⏰

انتقل إلى: `CLOUD_SCHEDULER_SETUP.md`
