# 🚨 FIX GOOGLE SIGN-IN NOW - 5 Minutes

## Quick Fix Guide

---

## ⚡ الحل السريع (5 دقائق):

### **الخطوة 1: Firebase Console (2 دقيقة)**

**افتح:**
```
https://console.firebase.google.com/u/0/project/studio-448742006-a3493/authentication/settings
```

**انزل إلى "Authorized domains"**

**تأكد من وجود:**
```
☑ localhost
☑ studio-448742006-a3493.firebaseapp.com
☑ studio-448742006-a3493.web.app
☑ globul.net
```

**إذا كان localhost مفقود:**
```
1. اضغط "Add domain"
2. اكتب: localhost
3. اضغط "Add"
4. ✅ تم!
```

---

### **الخطوة 2: Google Cloud Console (3 دقائق)**

**افتح:**
```
https://console.cloud.google.com/apis/credentials?project=studio-448742006-a3493
```

**اضغط على Web client (auto created by Google Service)**

**في "Authorized JavaScript origins"، تأكد من:**
```
☑ http://localhost
☑ http://localhost:3000
☑ https://studio-448742006-a3493.firebaseapp.com
☑ https://studio-448742006-a3493.web.app
☑ https://globul.net
```

**إذا كانت فارغة أو ناقصة:**
```
1. اضغط "+ ADD URI"
2. الصق: http://localhost
3. اضغط Enter
4. كرر لكل URI
5. اضغط SAVE في الأسفل
6. ✅ تم!
```

---

### **الخطوة 3: اختبر (1 دقيقة)**

```
1. Ctrl + Shift + R (Hard Refresh)
2. اذهب إلى: http://localhost:3000/login
3. F12 → Console
4. اضغط Google
5. ✅ يجب أن يعمل!
```

---

## 🎯 إذا لم ينجح:

**أرسل لي:**
```
1. Screenshot من Firebase > Authorized domains
2. Screenshot من Google Cloud > OAuth client
3. Console output (F12) بعد الضغط على Google
```

**سأصلحها فوراً!**

---

## ✅ Checklist سريع:

```
☐ Firebase > Authorized domains > localhost موجود
☐ Google Cloud > JavaScript origins > http://localhost موجود
☐ Google Cloud > JavaScript origins > http://localhost:3000 موجود
☐ Google Cloud > SAVE clicked
☐ Hard Refresh (Ctrl + Shift + R)
☐ Try Google Sign-In
```

---

**🚀 5 دقائق وسيعمل!**

