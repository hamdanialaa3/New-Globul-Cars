# 🧹 أوامر تنظيف الكاش في Cursor Browser

## الطريقة السريعة (Quick Clear)

افتح Developer Console (F12) ثم انسخ والصق:

```javascript
// تنظيف سريع شامل
localStorage.clear();
sessionStorage.clear();
if ('caches' in window) {
    caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
}
navigator.serviceWorker.getRegistrations().then(registrations => 
    Promise.all(registrations.map(reg => reg.unregister()))
);
console.log('✅ تم تنظيف الكاش!');
location.reload(true);
```

## الطريقة الشاملة (Complete Clear)

```javascript
(async () => {
    console.log('🧹 بدء تنظيف الكاش...');
    
    // 1. تنظيف localStorage
    localStorage.clear();
    console.log('✅ تم تنظيف localStorage');
    
    // 2. تنظيف sessionStorage
    sessionStorage.clear();
    console.log('✅ تم تنظيف sessionStorage');
    
    // 3. تنظيف جميع الـ Caches
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => {
                console.log(`🗑️ حذف cache: ${cacheName}`);
                return caches.delete(cacheName);
            })
        );
        console.log('✅ تم تنظيف جميع الـ Caches');
    }
    
    // 4. إلغاء تسجيل Service Workers
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
            registrations.map(registration => {
                console.log(`🗑️ إلغاء تسجيل Service Worker: ${registration.scope}`);
                return registration.unregister();
            })
        );
        console.log('✅ تم إلغاء تسجيل جميع Service Workers');
    }
    
    // 5. تنظيف IndexedDB
    if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        await Promise.all(
            databases.map(db => {
                console.log(`🗑️ حذف IndexedDB: ${db.name}`);
                return new Promise((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase(db.name);
                    deleteReq.onsuccess = () => resolve();
                    deleteReq.onerror = () => reject(deleteReq.error);
                    deleteReq.onblocked = () => resolve();
                });
            })
        );
        console.log('✅ تم تنظيف IndexedDB');
    }
    
    console.log('🎉 اكتمل تنظيف الكاش! قم بإعادة تحميل الصفحة (Ctrl+Shift+R)');
    alert('✅ تم تنظيف الكاش بنجاح! قم بإعادة تحميل الصفحة (Ctrl+Shift+R)');
})();
```

## طرق أخرى:

### 1. Hard Reload
- **Windows/Linux:** `Ctrl + Shift + R` أو `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

### 2. عبر Developer Tools
1. اضغط `F12`
2. اذهب إلى تبويب "Application" أو "Storage"
3. انقر بزر الماوس الأيمن على "Clear storage"
4. اختر "Clear site data"

### 3. فتح صفحة التنظيف
افتح في المتصفح:
```
http://localhost:3001/clear-cache-cursor.html
```

أو للتنظيف التلقائي:
```
http://localhost:3001/clear-cache-cursor.html?clear=true
```

