# 📁 Profile Services Module

## Overview

مجموعة خدمات البروفايل المتقدم للمشروع البلغاري.  
Advanced profile services for the Bulgarian car marketplace.

**الموقع:** بلغاريا 🇧🇬  
**اللغات:** بلغاري + إنجليزي  
**العملة:** يورو (EUR)

---

## 📂 File Structure

```
profile/
├── index.ts                      (~100 lines) - Main export file
├── image-processing-service.ts   (~250 lines) - Image handling
├── trust-score-service.ts        (~250 lines) - Trust & badges
└── profile-stats-service.ts      (~150 lines) - Statistics

Total: 4 files, all < 300 lines ✅
```

---

## 🚀 Usage

### Import everything:
```typescript
import { ProfileService } from './services/profile';

// Access all sub-services
ProfileService.image.processProfileImage(file);
ProfileService.trust.calculateTrustScore(userId);
ProfileService.stats.incrementCarsSold(userId);
```

### Or import specific services:
```typescript
import { 
  imageProcessingService,
  trustScoreService,
  profileStatsService 
} from './services/profile';
```

---

## 📖 Services Documentation

### 1. Image Processing Service
- `processProfileImage()` - Process & optimize profile photo
- `processCoverImage()` - Process cover image (1200x400)
- `uploadImage()` - Upload to Firebase Storage
- `deleteImage()` - Delete from storage

### 2. Trust Score Service
- `calculateTrustScore()` - Calculate 0-100 score
- `awardBadge()` - Give badge to user
- `getTrustLevelName()` - Get level name (BG/EN)

### 3. Profile Stats Service
- `incrementCarsListed()` - +1 car listed
- `incrementCarsSold()` - +1 car sold
- `updateResponseTime()` - Update avg response time
- `updateLastActive()` - Update last activity timestamp

---

## 🎯 Design Principles

1. ✅ **Single Responsibility** - كل ملف مهمة واحدة فقط
2. ✅ **< 300 Lines** - كل ملف أقل من 300 سطر
3. ✅ **Bulgarian First** - البلغارية أولاً، الإنجليزية ثانياً
4. ✅ **EUR Only** - اليورو فقط، لا عملات أخرى
5. ✅ **Singleton Pattern** - Instance واحد لكل Service
6. ✅ **Error Handling** - معالجة الأخطاء في كل مكان
7. ✅ **Type Safety** - TypeScript كامل

---

## 🔗 Integration with Firebase

```typescript
Services Used:
├── Firebase Storage     (images)
├── Firestore           (user data)
└── Serverless          (no backend needed)

Location: europe-west1 (Belgium - closest to Bulgaria)
```

---

Made with ❤️ for Bulgaria 🇧🇬
