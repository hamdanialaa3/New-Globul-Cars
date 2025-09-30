# ⚡ Stream Chat - دليل سريع

## 🎯 المطلوب منك (3 خطوات)

### الخطوة 1: سجل في Stream (5 دقائق)

**افتح الرابط**:
```
https://getstream.io/chat/
```

1. اضغط **"Start Free Trial"**
2. سجل بإيميل: `globul.net.m@gmail.com`
3. اختر: **Free Plan** (25 مستخدم مجاناً)

---

### الخطوة 2: أنشئ App (2 دقيقة)

بعد تسجيل الدخول:

1. اضغط **"Create App"**
2. App Name: `Globul Cars Chat`
3. Region: **Europe (Ireland)**
4. Environment: **Development**
5. اضغط **"Create"**

---

### الخطوة 3: احصل على Credentials (1 دقيقة)

في Dashboard، ستجد:

```
App ID: xxxxxxxxxxxx
API Key: xxxxxxxxxxxxxxxxxxxxx
API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**انسخ**:
- ✅ API Key
- ✅ API Secret

---

## 📝 ملء نموذج Firebase

افتح Firebase Console:
```
https://console.firebase.google.com/project/studio-448742006-a3493/extensions
```

ابحث عن: `stream/auth-chat`

املأ:

| الحقل | القيمة |
|-------|--------|
| Cloud Functions location | `europe-west3 (Frankfurt)` |
| API key | (الصق من Stream) |
| API secret | (الصق من Stream) |

اضغط **Install extension**

---

## ✅ انتهى!

بعد 2-3 دقائق:
- ✅ تم التثبيت
- ✅ جاهز للاستخدام

---

## 🧪 اختبار سريع

في Firebase Console > Authentication:
- أنشئ مستخدم جديد

في Stream Dashboard:
- افحص Users
- يجب أن يظهر المستخدم تلقائياً

---

## 📦 تثبيت SDK

```bash
cd bulgarian-car-marketplace
npm install stream-chat stream-chat-react
```

---

## 💰 التكلفة

**Free Plan**:
- ✅ 25 مستخدم نشط/شهر
- ✅ رسائل غير محدودة
- ✅ Channels غير محدودة

---

**⏱️ الوقت الإجمالي: 10 دقائق**

للمزيد: راجع `STREAM_CHAT_EXTENSION_SETUP.md`


