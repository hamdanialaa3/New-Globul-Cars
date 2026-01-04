# 🛠️ Developer Quick Guides
*Unified reference for common development tasks*

---

## Table of Contents
1. [Clear Cache Commands](#clear-cache-commands)
2. [Cursor IDE Reset Guide](#cursor-reset-guide)
3. [Favorites System Quick Start](#favorites-quick-start)

---

# 🧹 Clear Cache Commands {#clear-cache-commands}

## Quick Clear (Browser)

Open Developer Console (F12) and paste:

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

## Complete Clear (Browser)

```javascript
(async () => {
    console.log('🧹 بدء تنظيف الكاش...');
    
    // 1. Clear localStorage
    localStorage.clear();
    console.log('✅ تم تنظيف localStorage');
    
    // 2. Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ تم تنظيف sessionStorage');
    
    // 3. Clear all Caches
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
    
    // 4. Unregister Service Workers
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
    
    // 5. Clear IndexedDB
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

## Hard Reload
- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

## Via Developer Tools
1. Press `F12`
2. Go to "Application" or "Storage" tab
3. Right-click on "Clear storage"
4. Select "Clear site data"

## Project Cache Clear (npm)

```bash
# Clear port 3000
npm run clean:3000

# Clear webpack cache
npm run clean:cache

# Complete cleanup
npm run clean:all
```

**PowerShell Script:** Available at [scripts/maintenance/CLEAN_CURSOR_CACHE.ps1](scripts/maintenance/CLEAN_CURSOR_CACHE.ps1)

---

# 🔄 Cursor IDE Reset Guide {#cursor-reset-guide}

## ✅ What This Does

Resets Cursor IDE settings to optimized defaults for better performance.

## 📁 File Locations

### Current Settings:
- `%APPDATA%\Cursor\User\settings.json`
- `%APPDATA%\Cursor\User\keybindings.json`

### Backup Location:
- `%APPDATA%\Cursor\User\backup_YYYYMMDD_HHMMSS\`

## 🔄 How to Reset

### Automatic (via script):
```powershell
# Run the reset script (creates backup first)
.\scripts\reset-cursor-settings.ps1
```

### Manual:
1. Close Cursor IDE completely
2. Open: `%APPDATA%\Cursor\User\`
3. Backup current files:
   - Copy `settings.json` → `settings.json.backup`
   - Copy `keybindings.json` → `keybindings.json.backup`
4. Delete or clear both files
5. Restart Cursor IDE

## 🔙 How to Restore

If you need to restore old settings:

1. Open backup folder: `%APPDATA%\Cursor\User\backup_*`
2. Copy files from backup:
   - `settings.json.backup` → `settings.json`
   - `keybindings.json.backup` → `keybindings.json`
3. Restart Cursor IDE

## ⚡ Performance Improvements

Optimized settings include:
- Reduced telemetry
- Faster indexing
- Optimized TypeScript checking
- Cleaner UI
- Better Git integration

---

# ❤️ Favorites System Quick Start {#favorites-quick-start}

## ✅ System Status: FULLY OPERATIONAL

### 🎯 What Works Now

Complete favorites system with:
- ❤️ Heart buttons on ALL car cards across entire site
- 🔐 Smart authentication flow (login → add → redirect)
- 💾 Pending favorites saved during login process
- 🔄 Auto-redirect to user's favorites page after adding
- 📱 Works on all pages: Homepage, Search, Browse, Car Details

---

## 🚀 User Experience Flow

### When NOT Logged In
```
User clicks heart ❤️
   ↓
Toast: "Please login to add favorites"
   ↓
Redirect to: /login?redirect=/current-page
   ↓
User logs in
   ↓
Auto-magic: Car added to favorites! 🎉
   ↓
Redirect to: /profile/{numericId}/favorites
```

### When Logged In
```
User clicks heart ❤️
   ↓
Instant add (Optimistic UI)
   ↓
Toast: "❤️ Added to favorites!"
   ↓
Heart fills with red color
   ↓
User stays on current page
```

---

## 📍 Where Heart Buttons Are

### ✅ Homepage
- Latest Cars Section (LatestCarsSection.tsx)
- New Cars Section (via ModernCarCard)
- Vehicle Classifications (via ModernCarCard)
- Recent Browsing (via ModernCarCard)
- Most Demanded Categories (via ModernCarCard)

### ✅ Browse & Search
- All Cars Page (via CarCardCompact)
- Advanced Search Results (via CarCardCompact)
- Visual Search Results (via CarCard)
- Category Pages (via CarCardCompact)

### ✅ Car Details
- Individual car page at /car/{sellerId}/{carId}
- Shows heart button in hero section

### ✅ User Profile
- My Listings (can favorite your own cars)
- Other user profiles (favorite their cars)

---

## 🔧 Technical Stack

### Core Components
```
PendingFavoriteHandler.tsx   → Handles post-login favorites
useFavorites hook            → Main logic for favorites
FavoriteButton               → Styled heart button
favoritesService             → Firestore CRUD operations
```

### Integration Points
```
App.tsx                      → PendingFavoriteHandler mounted globally
ModernCarCard.tsx            → Heart button built-in
CarCardCompact.tsx           → Heart button built-in
LatestCarsSection.tsx        → Custom heart button
UserFavoritesPage.tsx        → Full favorites page
```

---

## 🧪 Testing Instructions

### Manual Test 1: Not Logged In
1. Open any page with car listings
2. Click heart button on any car
3. Should see: "Please login to add favorites"
4. Should redirect to: `/login?redirect=...`
5. Login with any account
6. Should see: "❤️ Car added to your favorites!"
7. Should redirect to: `/profile/{numericId}/favorites`
8. Car should be in favorites list

### Manual Test 2: Logged In
1. Make sure you're logged in
2. Open any page with car listings
3. Click heart button on any car
4. Should see: "❤️ Added to favorites!"
5. Heart should fill with red color
6. Should stay on current page
7. Go to /favorites
8. Car should be in favorites list

### Manual Test 3: Toggle Favorite
1. While logged in, click heart on favorited car
2. Should see: "Removed from favorites"
3. Heart should become outline only
4. Click again
5. Should see: "❤️ Added to favorites!"
6. Heart should fill red again

---

## 🐛 Troubleshooting

### Problem: Heart button not appearing
**Solution**: Check if component imports `useFavorites` hook
```typescript
import { useFavorites } from '@/hooks/useFavorites';
const { isFavorite, toggleFavorite } = useFavorites();
```

### Problem: Redirect not working after login
**Solution**: Check PendingFavoriteHandler is mounted in App.tsx
```typescript
<AppProviders>
  <PendingFavoriteHandler />  ← Must be here
  <AppRoutes />
</AppProviders>
```

### Problem: Favorites not persisting
**Solution**: Check Firestore security rules allow writes to `users/{uid}/favorites/{carId}`

---

## 📊 Analytics & Monitoring

### Key Metrics to Track
- ✅ Favorite additions per day
- ✅ Most favorited car makes/models
- ✅ Average favorites per user
- ✅ Conversion rate (favorite → contact)

### Logs to Monitor
```typescript
logger.info('Processing pending favorite', { carId, userId });
logger.error('Failed to process pending favorite', error);
```

---

## 🔗 Related Documentation

- [PROJECT_CONSTITUTION.md](PROJECT_CONSTITUTION.md) - Core architectural rules
- [README_START_SERVER.md](README_START_SERVER.md) - Server startup guide
- [QUICK_TESTING_GUIDE.md](QUICK_TESTING_GUIDE.md) - Full testing procedures
