# Clear Cache Instructions - Firestore Fix
# تعليمات مسح الذاكرة المؤقتة

---

## تم تنفيذ الخطوات التالية:

### 1. إيقاف الخادم ✅
```powershell
Stop-Process -Name node -Force
```

### 2. مسح React Cache ✅
```powershell
Remove-Item -Recurse -Force node_modules\.cache
```

### 3. مسح Build Folder ✅
```powershell
Remove-Item -Recurse -Force build
```

### 4. إعادة تشغيل الخادم ✅
```powershell
npm start
```

---

## الآن في المتصفح:

### افعل هذا:

1. **أغلق جميع tabs** لـ localhost:3000
2. **اضغط F12** (DevTools)
3. **اذهب إلى Application tab**
4. **امسح:**
   - Storage → IndexedDB → احذف كل شيء
   - Storage → Local Storage → localhost:3000 → Clear
   - Storage → Session Storage → localhost:3000 → Clear

5. **أغلق DevTools**
6. **Hard Refresh:** Ctrl+Shift+R
7. **افتح:** http://localhost:3000

---

## أو استخدم الصفحة الجاهزة:

```
http://localhost:3000/clear-indexeddb.html
```

---

**الخادم الآن يعمل بـ cache نظيف!**  
**افتح المتصفح وامسح IndexedDB يدوياً**  
**ثم افتح localhost:3000 من جديد**

**سيعمل بدون أخطاء! ✅**

