# 🔧 حل مشكلة Cursor Connection Error

## ❌ المشكلة:
```
Connection failed. If the problem persists, please check your internet connection or VPN
internal error [internal]
Request ID: 7fb6d771-ee9c-4e0f-ab20-89bc1218af76
```

---

## ✅ الحلول (نفذها بالترتيب):

### **1️⃣ تسجيل الخروج والدخول (الأهم):**

```
1. اذهب إلى: Cursor → Settings (Ctrl + ,)
2. ابحث عن: "Account" أو "Sign Out"
3. اضغط "Sign Out"
4. أغلق Cursor تماماً
5. أعد فتح Cursor
6. اضغط "Sign In" وسجل دخول مجدداً
```

---

### **2️⃣ تحقق من الاشتراك:**

**اذهب إلى:**
```
https://cursor.sh/settings
```

**تحقق من:**
- ✅ الاشتراك نشط (20$ مدفوعة)
- ✅ لم تنتهِ الفترة التجريبية
- ✅ الـ API quota متاح

---

### **3️⃣ حذف Settings Cache:**

**Windows:**
```powershell
# أغلق Cursor أولاً!

# احذف هذه المجلدات:
Remove-Item -Recurse -Force "$env:APPDATA\Cursor\User\globalStorage"
Remove-Item -Recurse -Force "$env:APPDATA\Cursor\Cache"
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Cursor\Cache"

# أو يدوياً:
%APPDATA%\Cursor\User\globalStorage
%APPDATA%\Cursor\Cache
%LOCALAPPDATA%\Cursor\Cache
```

**ثم أعد فتح Cursor**

---

### **4️⃣ تحقق من الإنترنت والـ VPN:**

**أ. إذا كنت تستخدم VPN:**
```
1. أوقف VPN مؤقتاً
2. جرب Cursor
3. إذا نجح، VPN هو المشكلة
```

**ب. تحقق من Firewall:**
```
1. Windows Defender → Firewall
2. Allow an app → Cursor
3. علّم على Private & Public networks
```

**ج. تحقق من Antivirus:**
```
- أضف Cursor للـ exclusions/whitelist
```

---

### **5️⃣ تغيير Model في Settings:**

```
1. Ctrl + Shift + P
2. اكتب: "Cursor Settings"
3. اذهب إلى: "Features" → "AI"
4. جرب تغيير Model:
   - من GPT-4 إلى Claude
   - أو العكس
```

---

### **6️⃣ إعادة تثبيت Cursor:**

**إذا لم تنجح الحلول أعلاه:**

```
1. أغلق Cursor
2. احذف المجلدات:
   - %APPDATA%\Cursor
   - %LOCALAPPDATA%\Cursor
3. Uninstall Cursor من Control Panel
4. حمّل آخر نسخة:
   https://cursor.sh/
5. ثبّت من جديد
6. سجل دخول
```

---

### **7️⃣ استخدام API Key الخاص:**

**إذا استمرت المشكلة، استخدم OpenAI API Key:**

```
1. اذهب إلى: https://platform.openai.com/api-keys
2. أنشئ API Key جديد
3. في Cursor:
   - Settings → Features → AI
   - "Use OpenAI API Key"
   - الصق المفتاح
4. جرب الآن
```

---

### **8️⃣ تحقق من Cursor Status:**

**زر الموقع:**
```
https://status.cursor.sh/
```

**إذا كان هناك مشكلة في السيرفرات:**
- انتظر حتى تُحل
- راقب الحالة

---

### **9️⃣ تواصل مع Cursor Support:**

**إذا لم تنجح كل الحلول:**

```
البريد: support@cursor.sh

أو Forum:
https://forum.cursor.sh/

أو Discord:
https://discord.gg/cursor
```

**اذكر لهم:**
- Request ID: 7fb6d771-ee9c-4e0f-ab20-89bc1218af76
- دفعت 20$
- الخطأ: internal error [internal]

---

## 🎯 الحل السريع (3 خطوات):

```
1. Sign Out من Cursor
2. احذف: %APPDATA%\Cursor\Cache
3. Sign In مجدداً
```

---

## 💡 نصائح إضافية:

### **للمحادثة (Chat):**
```
- تأكد أنك في Pro Plan
- تأكد أن quota لم ينتهِ
- جرب Model مختلف (Claude vs GPT-4)
```

### **إذا Auto فقط يعمل:**
```
- قد يكون quota انتهى للـ chat
- تحقق من: Settings → Usage
- قد تحتاج upgrade للـ plan
```

---

## 📊 التحقق من Quota:

```
1. Cursor → Settings
2. Features → AI
3. شاهد: "Usage" أو "Quota"
4. تأكد أنه لم ينتهِ
```

---

## ⚠️ ملاحظات مهمة:

- **Free Plan:** محدود جداً
- **Pro Plan ($20):** 500 requests/شهر
- **Business Plan:** unlimited

**تحقق من خطتك:**
```
https://cursor.sh/pricing
```

---

## 🔍 Troubleshooting Checklist:

- [ ] تسجيل خروج/دخول
- [ ] حذف Cache
- [ ] تحقق من Firewall/Antivirus
- [ ] إيقاف VPN مؤقتاً
- [ ] تغيير Model
- [ ] تحقق من Quota
- [ ] تحقق من Cursor Status
- [ ] إعادة تثبيت

---

**✨ بعد تطبيق هذه الحلول، المشكلة ستُحل إن شاء الله!** 🎉










