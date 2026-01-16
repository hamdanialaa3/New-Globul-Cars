# نظام الدفع الجديد - تعليمات سريعة 🏦
**التاريخ:** January 16, 2026  
**الحالة:** ✅ نشط في الإنتاج

---

## 🎯 ملخص التغيير

| العنصر | القديم | الجديد |
|------|--------|--------|
| **طريقة الدفع** | Stripe (أوتوماتيكي) | تحويل بنكي يدوي |
| **البنوك** | بطاقة ائتمان فقط | iCard + Revolut |
| **المعالجة** | فوري | 1-2 ساعة |
| **التكلفة** | عالية | منخفضة |

---

## 💰 الأسعار الجديدة

### ديلر (Dealer)
- **قبل:** €27.78/شهر → €278/سنة
- **الآن:** €20.11/شهر → €193/سنة ✅
- **الفائدة:** توفير 30%

### شركة (Company)
- **قبل:** €137.88/شهر → €1288/سنة  
- **الآن:** €100.11/شهر → €961/سنة ✅
- **الفائدة:** توفير 27%

---

## 🏦 طرق الدفع المتاحة

### 1. **iCard (المحلية - بلغاريا)**
```
IBAN: BG98INTF40012039023344
BIC: INTFBGSF
الحساب: ALAA HAMID MOHAMMED SHAKER AL-HAMADANI
الوقت: 1-2 ساعة
خاصية: ⚡ تحويلات BLINK الفورية
```

### 2. **Revolut (الدولية)**
```
IBAN: LT44 3250 0419 1285 4116
BIC: REVOLT21
RevTag: @hamdanialaa
الوقت: فوري (تقريباً)
الخاصية: تحويلات دولية سريعة
```

---

## 📋 خطوات الدفع للمستخدم

1. **اختيار الخطة** → ديلر أو شركة
2. **اختيار طريقة الدفع** → iCard أو Revolut
3. **نسخ البيانات** → IBAN واسم المستقبل
4. **التحويل البنكي** → من حسابهم البنكي
5. **انتظار التفعيل** → خلال 1-2 ساعة
6. **اختياري:** إرسال إثبات عبر WhatsApp للتفعيل الفوري

---

## 🔐 الملفات المتأثرة

### ✅ تم تحديثها:
```
src/config/stripe-extension.config.ts   → تمييز كـ DEPRECATED
src/pages/legal/PrivacyPolicyPage.tsx   → معلومات الدفع الجديدة
src/pages/01_main-pages/help/HelpPage   → أسئلة شائعة محدثة
src/utils/seo/SchemaGenerator.ts        → Schema محدث
src/pages/ArchitectureDiagramPage.tsx   → الرسم البياني محدث
```

### 📂 المرجع:
```
src/config/bank-details.ts              → جميع بيانات البنوك
src/types/payment.types.ts              → أنواع الدفع
src/pages/09_admin/manual-payments/     → لوحة إدارة الدفع
```

---

## 🤔 الأسئلة الشائعة

### س: هل Stripe لا يزال مدعوماً؟
**ج:** لا، تم تعطيله تماماً. النظام الجديد هو التحويل البنكي فقط.

### س: هل الأسعار القديمة سارية المفعول؟
**ج:** لا، الأسعار الجديدة هي الفعلية الآن (€20.11 و €100.11).

### س: كم سيستغرق الدفع؟
**ج:** 1-2 ساعة عادة (أو فوري عبر BLINK إذا أرسل إثبات).

### س: ماذا عن الاشتراكات القديمة؟
**ج:** تابعة التفعيل الحالي. سيتم الترقية يدوياً عند طلب المستخدم.

---

## ⚡ للمطورين

### ❌ لا تستخدم:
```typescript
import { STRIPE_PRICE_IDS } from '@/config/stripe-extension.config.ts';
subscriptionService.createCheckoutSession(...);
```

### ✅ استخدم بدلاً منه:
```typescript
import { BANK_DETAILS, PAYMENT_METHODS } from '@/config/bank-details.ts';
// إعادة توجيه المستخدم لصفحة التحويل البنكي
window.location.href = '/billing/manual-payment';
```

---

## 📞 التواصل

| القناة | المعلومات |
|--------|----------|
| 📧 البريد | support@mobilebg.eu |
| 💬 واتس | +359 87 983 9671 |
| 🏢 المكتب | Bulgaria, Sofia, Tsar Simeon 77 |

---

## 📚 اطلع على المزيد

- [تفاصيل الهجرة الكاملة](./PAYMENT_SYSTEM_MIGRATION_JAN16_2026.md)
- [تفاصيل البنك](./src/config/bank-details.ts)
- [لوحة الإدارة](./src/pages/09_admin/manual-payments/AdminManualPaymentsDashboard.tsx)

---

**آخر تحديث:** January 16, 2026 ✅  
**الحالة:** جاهز للإنتاج ✅
