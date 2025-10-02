# 💬 دليل تفعيل Stream Chat Extension في Firestore
## Firebase Extension: stream/auth-chat@0.2.4

---

## 📋 المعلومات المطلوبة للتفعيل

### 1️⃣ Cloud Functions Location (موقع الوظائف) - **مطلوب**
```
europe-west3 (Frankfurt)
```
✅ **تم تحديده مسبقاً** - لا تغيره (أقرب منطقة لبلغاريا)

---

### 2️⃣ Stream API Key - **مطلوب**
### 3️⃣ Stream API Secret - **مطلوب**

**⚠️ هام جداً**: يجب إنشاء حساب Stream والحصول على Credentials

---

## 🚀 خطوات الحصول على Stream API Credentials

### الخطوة 1: إنشاء حساب Stream

1. **افتح الرابط**:
   ```
   https://getstream.io/chat/
   ```

2. **اضغط على "Start Free Trial" أو "Sign Up"**

3. **سجل حساب جديد**:
   - Email: globul.net.m@gmail.com (أو أي بريد)
   - اختر خطة: **Free Plan** (مجانية حتى 25 مستخدم)

4. **أكمل التسجيل**

---

### الخطوة 2: إنشاء App في Stream

1. **بعد تسجيل الدخول**، ستصل إلى Dashboard

2. **أنشئ App جديد**:
   - اضغط: **"Create App"** أو **"New App"**
   - App Name: `Globul Cars Chat`
   - Region: **Europe (Ireland)** (الأقرب)
   - Environment: **Development** (للتطوير)

3. **اضغط "Create App"**

---

### الخطوة 3: الحصول على API Credentials

1. **في Dashboard**، اختر الـ App الذي أنشأته

2. **اذهب إلى**: **"Chat"** → **"Overview"** أو **"API Keys"**

3. **ستجد**:
   ```
   App ID: xxxxxxxxxxxx
   API Key: xxxxxxxxxxxxxxxxxxxxx
   API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **انسخ**:
   - ✅ **API Key** (Key)
   - ✅ **API Secret** (Secret)

---

## 📝 ملء نموذج Firebase Extension

### المعلومات المطلوبة:

| الحقل | القيمة |
|-------|--------|
| **Cloud Functions location** | `europe-west3 (Frankfurt)` |
| **API key for Stream API** | (المفتاح من Stream Dashboard) |
| **API secret for Stream API** | (السر من Stream Dashboard) |

---

## 🎯 معلومات المشروع Firebase

```yaml
Project ID: studio-448742006-a3493
Project Name: New Globul Cars FG
Firebase Console: https://console.firebase.google.com/project/studio-448742006-a3493
```

---

## 📊 ما تفعله هذه Extension

### الوظائف (4 Cloud Functions):

1. **createStreamUserOnCreate**: 
   - ينشئ مستخدم في Stream تلقائياً عند تسجيل مستخدم جديد في Firebase

2. **createStreamUserOnUpdate**:
   - يحدث بيانات المستخدم في Stream عند التحديث في Firebase

3. **createStreamToken**:
   - ينشئ token للمصادقة مع Stream Chat

4. **revokeStreamUser**:
   - يحذف المستخدم من Stream عند الحذف من Firebase

### الفائدة:
✅ **مزامنة تلقائية** بين Firebase Authentication و Stream Chat
✅ **إدارة Tokens** تلقائياً
✅ **لا حاجة لكود إضافي** للمصادقة

---

## 🔧 كيفية الاستخدام بعد التثبيت

### في كود React/TypeScript:

```typescript
import { StreamChat } from 'stream-chat';
import { auth } from './firebase-config';

// Initialize Stream Chat
const chatClient = StreamChat.getInstance('YOUR_STREAM_API_KEY');

// عند تسجيل دخول المستخدم
const user = auth.currentUser;
if (user) {
  // احصل على Stream token من Firebase Function
  const getStreamToken = httpsCallable(functions, 'ext-auth-chat-createStreamToken');
  const result = await getStreamToken();
  const streamToken = result.data.token;
  
  // اتصل بـ Stream
  await chatClient.connectUser(
    {
      id: user.uid,
      name: user.displayName || 'User',
      image: user.photoURL || undefined,
    },
    streamToken
  );
  
  console.log('✅ Connected to Stream Chat');
}
```

### إنشاء Channel (غرفة دردشة):

```typescript
// إنشاء قناة دردشة لسيارة معينة
const channel = chatClient.channel('messaging', 'car-bmw-x5-2023', {
  name: 'BMW X5 2023 Discussion',
  image: 'https://example.com/car-image.jpg',
  members: [currentUserId, sellerId],
});

await channel.watch();
```

### إرسال رسالة:

```typescript
await channel.sendMessage({
  text: 'مرحباً! هل السيارة ما زالت متاحة؟',
});
```

---

## 📦 تثبيت Stream Chat SDK

يجب تثبيت SDK في المشروع:

```bash
cd bulgarian-car-marketplace
npm install stream-chat stream-chat-react
```

---

## 💰 التكلفة والحدود

### Stream Chat - Free Plan:

| الميزة | الحد المجاني |
|--------|--------------|
| **Monthly Active Users** | 25 مستخدم |
| **Messages** | غير محدود |
| **Channels** | غير محدود |
| **File Storage** | 100 MB |
| **Team Members** | 5 أعضاء |

### بعد الحد المجاني:
- **Startup Plan**: $99/شهر (حتى 100 مستخدم)
- **Growth Plan**: $499/شهر (حتى 1,000 مستخدم)

### Firebase Cloud Functions:
- **الطبقة المجانية**:
  - 2M invocations/month
  - 400,000 GB-seconds

**💡 للمشاريع الصغيرة**: ✅ مجاني بالكامل

---

## 🛡️ الأمان والصلاحيات

الإضافة تحتاج إلى:

✅ **Secret Manager Secret Accessor** - لحماية API Secret

### ⚠️ مهم للأمان:

1. **لا تشارك API Secret** مع أي أحد
2. **استخدم Environment Variables** لتخزين Credentials
3. **فعّل Stream Token** authentication فقط

---

## 🎨 مثال كامل - Chat Component

```typescript
import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { 
  Chat, 
  Channel, 
  ChannelHeader, 
  MessageList, 
  MessageInput,
  Thread,
  Window 
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import { auth, functions } from './firebase-config';
import { httpsCallable } from 'firebase/functions';

const CarChatComponent = ({ carId, sellerId }) => {
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const initChat = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Initialize Stream
      const client = StreamChat.getInstance('YOUR_STREAM_API_KEY');

      // Get Stream token
      const getStreamToken = httpsCallable(functions, 'ext-auth-chat-createStreamToken');
      const result = await getStreamToken();
      const streamToken = result.data.token;

      // Connect user
      await client.connectUser(
        {
          id: user.uid,
          name: user.displayName,
          image: user.photoURL,
        },
        streamToken
      );

      // Create/Join channel
      const chatChannel = client.channel('messaging', `car-${carId}`, {
        name: `Chat about Car ${carId}`,
        members: [user.uid, sellerId],
      });

      await chatChannel.watch();

      setChatClient(client);
      setChannel(chatChannel);
    };

    initChat();

    return () => {
      if (chatClient) chatClient.disconnectUser();
    };
  }, [carId, sellerId]);

  if (!chatClient || !channel) {
    return <div>Loading chat...</div>;
  }

  return (
    <Chat client={chatClient} theme="messaging light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default CarChatComponent;
```

---

## 🔍 الميزات المتاحة

### بعد تفعيل Extension:

1. ✅ **دردشة فورية** (Real-time chat)
2. ✅ **مجموعات دردشة** (Group chats)
3. ✅ **إشعارات** (Push notifications)
4. ✅ **تحميل ملفات** (File uploads)
5. ✅ **Typing indicators** (مؤشر الكتابة)
6. ✅ **Read receipts** (إيصالات القراءة)
7. ✅ **Reactions** (تفاعلات)
8. ✅ **Threads** (مواضيع)

---

## 🚀 خطوات التفعيل النهائية

### 1. سجل في Stream

```
https://getstream.io/chat/
```

### 2. أنشئ App

```
App Name: Globul Cars Chat
Region: Europe (Ireland)
```

### 3. احصل على Credentials

```
API Key: xxxxxxxxxxxxx
API Secret: xxxxxxxxxxxxxxx
```

### 4. افتح Firebase Console

```
https://console.firebase.google.com/project/studio-448742006-a3493/extensions
```

### 5. ثبت Extension

```
Extension: stream/auth-chat
```

### 6. املأ النموذج

```yaml
Cloud Functions location: europe-west3 (Frankfurt)
API key: (من Stream Dashboard)
API secret: (من Stream Dashboard)
```

### 7. اضغط Install

```
⏳ Installing... (2-3 دقائق)
✅ Extension installed successfully!
```

---

## 🧪 اختبار Extension

### الاختبار 1: إنشاء مستخدم

```javascript
// في Firebase Console > Authentication
// أنشئ مستخدم جديد

// تحقق من Stream Dashboard
// يجب أن يظهر المستخدم تلقائياً في Stream Users
```

### الاختبار 2: الحصول على Token

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-config';

const getToken = async () => {
  const createToken = httpsCallable(functions, 'ext-auth-chat-createStreamToken');
  const result = await createToken();
  console.log('Stream Token:', result.data.token);
};
```

---

## ❓ الأسئلة الشائعة

### س: هل Extension مجانية؟
ج: Extension نفسها مجانية، لكن Stream لديه حدود مجانية (25 مستخدم).

### س: ماذا يحدث عند حذف مستخدم من Firebase?
ج: يتم حذفه تلقائياً من Stream أيضاً.

### س: هل يمكن استخدام Stream بدون Extension?
ج: نعم، لكن Extension توفر المزامنة التلقائية.

### س: أين تُخزن الرسائل؟
ج: في Stream Cloud - ليس في Firebase.

---

## 📞 الدعم

### وثائق Stream:
```
https://getstream.io/chat/docs/
```

### Firebase Extension Docs:
```
https://firebase.google.com/products/extensions/stream-auth-chat
```

### Stream Dashboard:
```
https://dashboard.getstream.io/
```

---

## ✅ قائمة التحقق النهائية

- [ ] تم إنشاء حساب Stream
- [ ] تم إنشاء App في Stream
- [ ] تم الحصول على API Key & Secret
- [ ] تم تثبيت Extension في Firebase
- [ ] تم ملء النموذج بالقيم الصحيحة
- [ ] تم تثبيت stream-chat SDK
- [ ] تم اختبار النظام

---

**🎉 جاهز لتفعيل نظام دردشة احترافي في مشروعك!**

---

*آخر تحديث: 30 سبتمبر 2025*


















