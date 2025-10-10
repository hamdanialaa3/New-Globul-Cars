# 🔧 حل خطأ "لم يتم تضمين نطاق عنوان URL" - Facebook Domains Fix

**الخطأ:**
```
لا يمكن تحميل عنوان URL
لم يتم تضمين نطاق عنوان URL هذا في نطاقات التطبيق
```

**السبب:** App Domains غير مُعدّة في Facebook App

**الحل:** إضافة النطاقات في إعدادات Facebook App

---

## ⚡ الحل السريع (3 دقائق):

### افتح Facebook App Settings:
```
https://developers.facebook.com/apps/1780064479295175/settings/basic/
```

---

### أضف في "App Domains":

```
localhost
studio-448742006-a3493.firebaseapp.com
studio-448742006-a3493.web.app
globul.net
```

*(كل واحد في سطر منفصل)*

---

### أضف في "Website" → "Site URL":

```
https://globul.net
```

---

### أضف في "Privacy Policy URL":

```
https://globul.net/privacy-policy
```

---

### أضف في "Terms of Service URL":

```
https://globul.net/terms-of-service
```

---

### أضف في "User Data Deletion":

```
https://globul.net/data-deletion
```

---

### اضغط:

```
[Save Changes]
```

---

## ✅ بعد Save:

**1. ارجع للموقع:**
```
http://localhost:3000/login
```

**2. Hard Refresh:**
```
Ctrl + Shift + R
```

**3. اضغط Facebook Login**

**4. يجب أن يعمل! ✅**

---

## 📋 Checklist:

```
☐ فتحت: https://developers.facebook.com/apps/1780064479295175/settings/basic/
☐ أضفت 4 domains في App Domains
☐ أضفت Site URL
☐ أضفت Privacy Policy URL
☐ أضفت Terms of Service URL
☐ أضفت User Data Deletion URL
☐ ضغطت Save Changes
☐ رجعت للموقع وجربت Facebook Login
```

---

**🔵 افتح الرابط وأضف الـ domains الآن!**

