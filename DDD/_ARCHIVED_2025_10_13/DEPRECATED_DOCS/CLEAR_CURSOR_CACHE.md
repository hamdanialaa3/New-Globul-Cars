# 🧹 تنظيف Cache البرنامج - Clear Cursor/VS Code Cache

## 🎯 تنظيف Cache بدون لمس المشروع

---

## 1️⃣ **تنظيف Cursor/VS Code Cache:**

### **من داخل البرنامج:**

**أ. باستخدام Command Palette:**
```
1. اضغط Ctrl + Shift + P
2. اكتب: "Developer: Reload Window"
3. أو: "Developer: Clear Editor History"
```

**ب. إعادة تشغيل كاملة:**
```
1. Ctrl + Shift + P
2. اكتب: "Developer: Restart Extension Host"
```

---

## 2️⃣ **تنظيف Cache المتصفح (Chrome):**

### **الطريقة السريعة:**
```
1. افتح الموقع: http://localhost:3000
2. اضغط F12
3. اضغط بالزر الأيمن على زر Reload
4. اختر "Empty Cache and Hard Reload"
```

### **أو:**
```
1. Ctrl + Shift + Delete
2. اختر "All time"
3. علّم على:
   ✅ Browsing history
   ✅ Cookies and site data
   ✅ Cached images and files
4. Clear data
```

---

## 3️⃣ **تنظيف Node.js Cache:**

### **في Terminal:**

**تنظيف npm cache:**
```bash
npm cache clean --force
```

**تنظيف .cache folders:**
```bash
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
rmdir /s /q node_modules\.cache
```

---

## 4️⃣ **تنظيف Cursor Cache يدوياً:**

### **مجلدات الـ Cache:**

**Windows:**
```
C:\Users\hamda\AppData\Roaming\Cursor\Cache
C:\Users\hamda\AppData\Roaming\Cursor\Code Cache
C:\Users\hamda\AppData\Roaming\Cursor\CachedData
C:\Users\hamda\AppData\Local\Cursor\Cache
```

**احذفها يدوياً:**
```bash
# في PowerShell:
Remove-Item -Recurse -Force "$env:APPDATA\Cursor\Cache"
Remove-Item -Recurse -Force "$env:APPDATA\Cursor\Code Cache"
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Cursor\Cache"
```

---

## 5️⃣ **تنظيف TypeScript Cache:**

```bash
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"

# حذف tsconfig cache
rmdir /s /q .tsbuildinfo

# أو في PowerShell:
Remove-Item -Recurse -Force .tsbuildinfo -ErrorAction SilentlyContinue
```

---

## 6️⃣ **تنظيف ESLint Cache:**

```bash
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"

# حذف ESLint cache
del .eslintcache

# أو:
Remove-Item .eslintcache -ErrorAction SilentlyContinue
```

---

## 7️⃣ **تنظيف Service Workers (المتصفح):**

### **Chrome DevTools:**
```
1. F12
2. Application tab
3. Service Workers → Unregister all
4. Clear storage → Clear site data
```

### **أو زيارة:**
```
chrome://serviceworker-internals/
```
ثم Unregister الموقع

---

## 8️⃣ **إعادة تشغيل كاملة:**

### **للتطبيق + المتصفح:**

```bash
# 1. أوقف التطبيق (Ctrl + C في Terminal)

# 2. نظف npm cache
npm cache clean --force

# 3. نظف node_modules cache
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
rmdir /s /q node_modules\.cache

# 4. أعد تشغيل
npm start
```

---

## 9️⃣ **تنظيف شامل (بدون لمس المشروع):**

### **أوامر آمنة 100%:**

```bash
# انتقل للمجلد
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"

# نظف npm cache
npm cache clean --force

# نظف .cache folders (آمن)
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

# نظف eslint cache (آمن)
if exist ".eslintcache" del /f ".eslintcache"

# نظف babel cache (آمن)
if exist "node_modules\.cache\babel-loader" rmdir /s /q "node_modules\.cache\babel-loader"
```

---

## 🔟 **تنظيف Cursor Extensions Cache:**

```
1. Ctrl + Shift + P
2. اكتب: "Extensions: Clear Extensions Cache"
```

---

## ✅ **التنظيف الكامل الموصى به:**

### **نفّذ بالترتيب:**

```bash
# 1. نظف npm
npm cache clean --force

# 2. نظف node_modules cache
cd "C:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
rmdir /s /q node_modules\.cache

# 3. نظف eslint cache
del .eslintcache

# 4. في Cursor: Ctrl + Shift + P → "Reload Window"

# 5. في المتصفح: Ctrl + Shift + Delete → Clear all
```

---

## 🚨 **ملاحظات مهمة:**

✅ **آمن - لا يؤثر على المشروع:**
- npm cache clean
- حذف .cache folders
- حذف .eslintcache
- إعادة تشغيل Cursor
- تنظيف browser cache

❌ **تجنب:**
- حذف node_modules كامل
- حذف build folder
- حذف package-lock.json
- حذف .git folder

---

## 💡 **للتأكد من النجاح:**

بعد التنظيف:
1. أعد تشغيل Cursor
2. أعد تشغيل Terminal (`npm start`)
3. نظف browser cache (Ctrl + Shift + Delete)
4. Hard Refresh (Ctrl + Shift + R)

---

**✨ التنظيف آمن 100% ولن يؤثر على مشروعك!** 🎉

