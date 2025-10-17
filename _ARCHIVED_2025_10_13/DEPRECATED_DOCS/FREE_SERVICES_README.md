# دليل الخدمات المجانية المُضافة
# Guide to Added Free Services

## نظرة عامة
تم إضافة بدائل مجانية مفتوحة المصدر لخدمات Google في مشروع سوق السيارات البلغاري.

## الخدمات المُضافة

### 1. 🗄️ Supabase - بديل Firebase مجاني
**الملفات:**
- `src/services/supabase-config.ts`
- متغيرات البيئة في `.env`

**الميزات:**
- قاعدة بيانات PostgreSQL
- مصادقة المستخدمين
- تخزين الملفات
- وظائف Edge
- اشتراكات فورية

**الإعداد:**
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد مجاني
3. احصل على URL و API Key
4. أضفهم في ملف `.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 🔐 NextAuth.js - مصادقة مجانية
**الملفات:**
- `src/pages/api/auth/[...nextauth].ts`
- متغيرات البيئة في `.env`

**الميزات:**
- مصادقة متعددة الموفرين
- جلسات آمنة
- حماية الطرق
- دعم JWT

**الإعداد:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

### 3. 💬 Socket.io - رسائل فورية مجانية
**الملفات:**
- `src/services/socket-service.ts`
- متغيرات البيئة في `.env`

**الميزات:**
- رسائل فورية
- غرف الدردشة
- إشعارات فورية
- اتصال ثنائي الاتجاه

**الإعداد:**
```env
REACT_APP_SOCKET_URL=http://localhost:3001
```

### 4. 🌐 خدمة الترجمة المحلية - ترجمة مجانية
**الملفات:**
- `src/services/translation-service-free.ts`

**الميزات:**
- ترجمة فورية
- دعم متعدد اللغات
- ترجمة مصطلحات السيارات
- كشف اللغة التلقائي

**الاستخدام:**
```typescript
import { bulgarianTranslationService } from './services/translation-service-free';

// ترجمة إلى البلغارية
const bgText = await bulgarianTranslationService.translateToBulgarian('Hello world');

// ترجمة من البلغارية
const enText = await bulgarianTranslationService.translateFromBulgarian('Здравей свят');
```

### 5. 🔒 hCaptcha - بديل Recaptcha مجاني
**الملفات:**
- `src/services/hcaptcha-service-clean.ts`
- `src/components/HCaptchaComponent.tsx`
- متغيرات البيئة في `.env`

**الميزات:**
- حماية من الروبوتات
- خصوصية أفضل من Google
- سهولة التكامل

**الإعداد:**
1. اذهب إلى [hcaptcha.com](https://hcaptcha.com)
2. أنشئ حساب مجاني
3. احصل على Site Key و Secret Key
4. أضفهم في ملف `.env`:
```env
REACT_APP_HCAPTCHA_SITE_KEY=your-site-key
REACT_APP_HCAPTCHA_SECRET_KEY=your-secret-key
```

## كيفية الاستخدام

### في مكونات React:
```typescript
// استيراد الخدمات
import { supabase } from '../services/supabase-config';
import { bulgarianTranslationService } from '../services/translation-service-free';
import { bulgarianSocketService } from '../services/socket-service';
import HCaptchaComponent from '../components/HCaptchaComponent';

// استخدام Supabase
const { data, error } = await supabase
  .from('cars')
  .select('*')
  .limit(10);

// استخدام الترجمة
const translatedText = await bulgarianTranslationService.translateToBulgarian('Hello');

// استخدام Socket.io
bulgarianSocketService.sendMessage(carId, 'رسالة جديدة');

// استخدام hCaptcha
<HCaptchaComponent
  onVerify={(token) => console.log('Verified:', token)}
  theme="light"
/>
```

## متغيرات البيئة المطلوبة

أضف هذه المتغيرات في ملف `.env`:

```env
# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# OAuth (اختياري)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Socket.io
REACT_APP_SOCKET_URL=http://localhost:3001

# hCaptcha
REACT_APP_HCAPTCHA_SITE_KEY=your-site-key
REACT_APP_HCAPTCHA_SECRET_KEY=your-secret-key
```

## المميزات

✅ **مجانية تماماً** - لا توجد تكاليف مخفية
✅ **مفتوحة المصدر** - يمكن التعديل والتخصيص
✅ **محلية** - تعمل بدون اتصال بالإنترنت لمعظم الخدمات
✅ **آمنة** - تشفير البيانات ومصادقة قوية
✅ **قابلة للتوسع** - تدعم النمو والتطوير

## الدعم والمساعدة

- **Supabase**: [docs.supabase.com](https://docs.supabase.com)
- **NextAuth.js**: [next-auth.js.org](https://next-auth.js.org)
- **Socket.io**: [socket.io/docs](https://socket.io/docs)
- **hCaptcha**: [docs.hcaptcha.com](https://docs.hcaptcha.com)

---

🎉 **تهانينا! لقد نجحت في استبدال خدمات Google ببدائل مجانية مفتوحة المصدر!**