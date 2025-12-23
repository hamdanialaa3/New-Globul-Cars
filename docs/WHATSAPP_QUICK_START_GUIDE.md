# 🚀 دليل التنفيذ السريع - واتساب للأعمال
# WhatsApp Business Quick Start Guide

> **رقم واتساب:** +359 879 839 671  
> **الوقت المتوقع:** 2-3 ساعات  
> **التكلفة:** مجاني (أول 1000 محادثة)

---

## ⚡ الخطوات السريعة (Quick Steps)

### 📋 Step 1: Create Meta Business Account (10 دقائق)

1. **اذهب إلى:**
   ```
   https://business.facebook.com/
   ```

2. **انقر على:** "Create Account"

3. **املأ المعلومات:**
   - Business Name: `Bulgarian Car Marketplace`
   - Your Name: `[اسمك]`
   - Business Email: `[بريدك]`

4. **✅ تم!** لديك الآن Meta Business Account

---

### 📱 Step 2: Setup WhatsApp Business App (15 دقيقة)

1. **اذهب إلى:**
   ```
   https://developers.facebook.com/apps
   ```

2. **انقر على:** "Create App"

3. **اختر:** "Business" type

4. **املأ المعلومات:**
   - App Name: `Bulgarski Mobili WhatsApp`
   - App Contact Email: `[بريدك]`
   - Business Account: `[اختر الحساب الذي أنشأته]`

5. **في Dashboard، أضف:** "WhatsApp" product

6. **✅ تم!** لديك الآن WhatsApp Business App

---

### 🔑 Step 3: Get Phone Number & Tokens (20 دقيقة)

#### 3.1: Add Phone Number

1. في WhatsApp Dashboard، انقر "Start using the API"

2. **أدخل الرقم:**
   ```
   +359 879 839 671
   ```

3. **سيرسل Meta كود تحقق عبر:**
   - SMS (مفضل)
   - Voice call

4. **أدخل الكود** → ✅ Verified!

#### 3.2: Get Access Token

1. في WhatsApp Dashboard، انقر "Get Access Token"

2. **انسخ الـ Token** (سيبدو هكذا):
   ```
   EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **هام:** احفظه في مكان آمن!

#### 3.3: Get Phone Number ID

1. في WhatsApp Dashboard، ستجد:
   ```
   Phone Number ID: 123456789012345
   ```

2. **انسخه** - ستحتاجه في `.env`

#### 3.4: Get Business Account ID

1. في Settings → Business Info:
   ```
   Business Account ID: 123456789012345
   ```

2. **انسخه** أيضاً

---

### ⚙️ Step 4: Configure Environment Variables (5 دقائق)

1. **افتح:** `c:\Users\hamda\Desktop\New Globul Cars\.env`

2. **استبدل القيم:**

```env
# WhatsApp Phone Number ID (from Step 3.3)
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345

# WhatsApp Business Account ID (from Step 3.4)
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345

# WhatsApp Access Token (from Step 3.2)
REACT_APP_WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App Secret (من App Dashboard → Settings → Basic)
WHATSAPP_APP_SECRET=abc123def456ghi789
```

3. **احفظ الملف** (Ctrl+S)

---

### 🧪 Step 5: Test Connection (2 دقيقة)

1. **افتح Terminal:**
   ```powershell
   cd "C:\Users\hamda\Desktop\New Globul Cars"
   ```

2. **شغّل السيرفر:**
   ```powershell
   npm start
   ```

3. **في Console، اكتب:**
   ```javascript
   import { whatsappBusinessService } from './services/whatsapp/whatsapp-business.service';
   
   whatsappBusinessService.testConnection()
   ```

4. **يجب أن ترى:**
   ```
   ✅ WhatsApp API connection successful
   Phone Number: +359 879 839 671
   ```

---

### 📨 Step 6: Send First Message! (1 دقيقة)

**اختبر إرسال رسالة:**

```javascript
// في Console
whatsappBusinessService.sendTextMessage({
  to: '359879839671', // رقمك (للاختبار)
  text: '🎉 مرحباً! هذه أول رسالة من Bulgarski Mobili!'
})
```

**يجب أن تصلك رسالة على واتساب! 🎊**

---

## 🎯 الخطوات التالية (Next Steps)

### Phase 1: Basic Integration (أسبوع 1)

#### 1. تفعيل الإشعارات التلقائية

**افتح:** `src/services/car/unified-car-mutations.ts`

**أضف بعد Facebook integration:**

```typescript
// 🟢 AUTO-SEND TO WHATSAPP
try {
  const { whatsappBusinessService } = await import('../whatsapp/whatsapp-business.service');
  
  // Send notification to seller
  await whatsappBusinessService.sendTextMessage({
    to: whatsappBusinessService.formatBulgarianPhone(seller.phone),
    text: `✅ تهانينا! تم نشر سيارتك بنجاح!

🚗 ${carData.make} ${carData.model} ${carData.year}
💰 €${carData.price}

🔗 الرابط:
https://bulgarskimobili.bg/car/${numericCarData.sellerNumericId}/${numericCarData.carNumericId}

شكراً لاستخدامك Bulgarski Mobili! 🎉`
  });
  
  serviceLogger.info('WhatsApp notification sent to seller', {
    carId: numericCarData.id
  });
} catch (whatsappError) {
  serviceLogger.error('WhatsApp notification failed', whatsappError as Error);
}
```

#### 2. إرسال إعلانات السيارات

**مثال: إرسال سيارة جديدة لمشترك:**

```typescript
const car = {
  make: 'BMW',
  model: 'X5',
  year: 2021,
  price: 38500,
  images: ['https://...image1.jpg'],
  city: 'София',
  mileage: 45000,
  fuelType: 'Дизел',
  sellerNumericId: 5,
  carNumericId: 12
};

await whatsappBusinessService.sendCarListing(
  '359879839671', // رقم العميل
  car
);
```

**سيرسل:**
- صورة السيارة
- معلومات كاملة
- أزرار تفاعلية (عرض، اتصال، بحث)

---

### Phase 2: AI Chatbot (أسبوع 2-3)

#### Setup Webhook

1. **Deploy Webhook Endpoint:**
   ```typescript
   // File: functions/src/whatsapp-webhook.ts
   
   import * as functions from 'firebase-functions';
   import * as crypto from 'crypto';
   
   export const whatsappWebhook = functions.https.onRequest((req, res) => {
     if (req.method === 'GET') {
       // Webhook verification
       const mode = req.query['hub.mode'];
       const token = req.query['hub.verify_token'];
       const challenge = req.query['hub.challenge'];
       
       if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
         res.status(200).send(challenge);
       } else {
         res.sendStatus(403);
       }
     } else if (req.method === 'POST') {
       // Validate signature
       const signature = req.headers['x-hub-signature-256'];
       const payload = JSON.stringify(req.body);
       const hash = crypto
         .createHmac('sha256', process.env.WHATSAPP_APP_SECRET || '')
         .update(payload)
         .digest('hex');
       
       if (signature === `sha256=${hash}`) {
         // Process message
         const data = req.body;
         
         if (data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
           const message = data.entry[0].changes[0].value.messages[0];
           const from = message.from;
           const text = message.text?.body;
           
           // TODO: Process with AI
           console.log('Received message:', { from, text });
         }
         
         res.sendStatus(200);
       } else {
         res.sendStatus(403);
       }
     }
   });
   ```

2. **Deploy:**
   ```bash
   firebase deploy --only functions:whatsappWebhook
   ```

3. **Configure in Meta Dashboard:**
   - Webhook URL: `https://us-central1-[project-id].cloudfunctions.net/whatsappWebhook`
   - Verify Token: `bulgarski_mobili_secure_webhook_2025`
   - Subscribe to: `messages`

---

## 📊 Message Templates (مهم جداً!)

### يجب إنشاء Templates مُعتمدة من Meta

#### Template 1: Car Listing Notification

```
Name: car_listing_notification
Category: MARKETING
Language: Bulgarian (bg)

Body:
Здравей {{1}}! 🚗

Имаме нова кола, която може да ви хареса:
{{2}} {{3}} {{4}}
💰 €{{5}}
📍 {{6}}

Вижте пълните детайли:
{{7}}

С уважение,
Bulgarski Mobili
```

**How to Create:**
1. Go to WhatsApp Manager
2. Message Templates → Create Template
3. Fill the form above
4. Submit for approval (usually 1-2 hours)

#### Template 2: Welcome Message

```
Name: welcome_message
Category: UTILITY
Language: Bulgarian (bg)

Body:
Здравей! 👋

Добре дошъл в Bulgarski Mobili!

Как мога да ти помогна днес?
1️⃣ Търся кола
2️⃣ Продавам кола
3️⃣ Информация

Просто отговори с номер или напиши какво искаш!
```

---

## 🔒 Security Best Practices

### 1. Never Expose Tokens

```typescript
// ❌ BAD
const token = 'EAAxxxxxxxxxxxxx';

// ✅ GOOD
const token = process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN;
```

### 2. Validate All Webhooks

```typescript
// Always validate signature
const isValid = validateWebhookSignature(req);
if (!isValid) {
  return res.sendStatus(403);
}
```

### 3. Rate Limiting

```typescript
// Don't spam users
const lastMessageTime = await getLastMessageTime(userId);
if (Date.now() - lastMessageTime < 60000) { // 1 minute
  logger.warn('Rate limit exceeded', { userId });
  return;
}
```

---

## 💰 Cost Estimation

### Free Tier:
```
First 1,000 conversations/month = FREE ✅
```

### Paid Tier (Bulgaria):
```
Marketing conversation: €0.011
Service conversation: €0.004
Authentication: €0.003

Example: 5,000 conversations/month
= 1,000 free + 4,000 paid
= €44/month
```

**Much cheaper than SMS! 📉**

---

## 🐛 Troubleshooting

### Problem 1: "Invalid Access Token"
**Solution:** Token expired. Generate new permanent token:
1. Go to Meta App Dashboard
2. System Users → Create System User
3. Generate Permanent Token

### Problem 2: "Phone Number Not Verified"
**Solution:**
1. Check phone number format: `+359879839671`
2. Verify in WhatsApp Manager

### Problem 3: "Webhook Not Receiving Messages"
**Solution:**
1. Check webhook URL is HTTPS
2. Validate signature verification
3. Check Firebase Functions logs

### Problem 4: "Template Rejected"
**Solution:**
- Avoid promotional language
- Follow Meta's guidelines
- Use "UTILITY" category for transactional messages

---

## 📞 Support Resources

### Official Documentation:
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Business Platform](https://business.whatsapp.com/)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)

### Meta Business Support:
- [Help Center](https://www.facebook.com/business/help)
- [Developer Community](https://developers.facebook.com/community/)

### Project Docs:
- `docs/WHATSAPP_AI_INTEGRATION_MASTER_PLAN.md` - Full plan
- `src/services/whatsapp/whatsapp-business.service.ts` - Service code

---

## ✅ Checklist

### Setup (قبل البدء):
- [ ] Meta Business Account created
- [ ] WhatsApp Business App created
- [ ] Phone number verified (+359879839671)
- [ ] Access tokens obtained
- [ ] Environment variables configured

### Testing (اختبار):
- [ ] Test connection successful
- [ ] Send test message works
- [ ] Receive webhook works
- [ ] Templates approved

### Production (الإنتاج):
- [ ] All tokens secured
- [ ] Webhook deployed
- [ ] Monitoring setup
- [ ] Analytics tracking

---

**Status:** ✅ Ready to Deploy  
**Next Step:** Follow Step 1 above!  
**Support:** Check `docs/WHATSAPP_AI_INTEGRATION_MASTER_PLAN.md`

🚀 **Let's revolutionize car marketplace with WhatsApp!**

