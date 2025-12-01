# كيفية مسح Cache المتصفح - Clear Browser Cache

## 🚨 مهم جداً: بعد النشر الجديد

بعد نشر التحديثات على Firebase، يجب مسح cache المتصفح لرؤية التحديثات الجديدة.

---

## طريقة 1: مسح Cache يدوياً (موصى به)

### Chrome / Edge:
1. اضغط `Ctrl + Shift + Delete`
2. اختر "Cached images and files" (الصور والملفات المخزنة مؤقتاً)
3. اختر "All time" (كل الوقت)
4. اضغط "Clear data" (مسح البيانات)

### Firefox:
1. اضغط `Ctrl + Shift + Delete`
2. اختر "Cache" (التخزين المؤقت)
3. اختر "Everything" (كل شيء)
4. اضغط "Clear Now" (مسح الآن)

### Safari:
1. اضغط `Cmd + Option + E` (Mac)
2. أو Settings > Privacy > Clear History

---

## طريقة 2: Hard Refresh (تحديث قوي)

### Windows:
- **Chrome/Edge:** `Ctrl + Shift + R` أو `Ctrl + F5`
- **Firefox:** `Ctrl + Shift + R` أو `Ctrl + F5`

### Mac:
- **Chrome/Edge:** `Cmd + Shift + R`
- **Firefox:** `Cmd + Shift + R`
- **Safari:** `Cmd + Option + R`

---

## طريقة 3: Incognito/Private Mode (وضع التصفح الخاص)

افتح الموقع في وضع التصفح الخاص:
- **Chrome/Edge:** `Ctrl + Shift + N`
- **Firefox:** `Ctrl + Shift + P`
- **Safari:** `Cmd + Shift + N`

---

## طريقة 4: مسح Cache لموقع محدد

### Chrome/Edge:
1. اضغط `F12` لفتح Developer Tools
2. اضغط بزر الماوس الأيمن على زر Refresh
3. اختر "Empty Cache and Hard Reload"

### Firefox:
1. اضغط `F12` لفتح Developer Tools
2. اضغط بزر الماوس الأيمن على زر Refresh
3. اختر "Empty Cache and Hard Reload"

---

## طريقة 5: Disable Cache في Developer Tools

### Chrome/Edge:
1. اضغط `F12` لفتح Developer Tools
2. اضغط `F1` لفتح Settings
3. ابحث عن "Disable cache"
4. فعّل الخيار
5. أبقِ Developer Tools مفتوحة أثناء التصفح

---

## ✅ بعد مسح Cache

1. افتح الموقع: https://mobilebg.eu/
2. اضغط `Ctrl + Shift + R` (Hard Refresh)
3. يجب أن ترى التحديثات الجديدة

---

## 🔧 إذا لم تظهر التحديثات

1. **تحقق من النشر:**
   ```powershell
   firebase hosting:channel:list
   ```

2. **تحقق من آخر نشر:**
   ```powershell
   firebase hosting:clone
   ```

3. **أعد النشر:**
   ```powershell
   .\DEPLOY_WITH_CACHE_BUST.ps1
   ```

---

**ملاحظة:** قد يستغرق الأمر بضع دقائق حتى تظهر التحديثات على جميع الخوادم.

