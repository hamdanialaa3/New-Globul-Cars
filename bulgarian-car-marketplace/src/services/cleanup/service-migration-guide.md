# Service Migration Guide
# دليل ترحيل الخدمات

**Date**: December 15, 2025  
**Status**: In Progress  
**Goal**: Move deprecated services to ARCHIVE and update all imports

---

## خطة الترحيل | Migration Plan

### Phase 1: Identify Deprecated Services ✅
**Status**: Completed

Old services that have been replaced by unified services:
- `carDataService.ts` → `unified-car-service.ts`
- `carListingService.ts` → `unified-car-service.ts`
- `carService.ts` → `unified-car-service.ts`
- `firebase-auth-users-service.ts` → `unified-user-service.ts`
- `firebase-auth-real-users.ts` → `unified-user-service.ts`
- `notificationService.ts` → `unified-notification-service.ts`
- `profileService.ts` → `unified-profile-service.ts`
- `userProfileService.ts` → `unified-profile-service.ts`

### Phase 2: Search for Usage ⏳
**Status**: In Progress

```bash
# Find all imports of deprecated services
grep -r "from.*carDataService" bulgarian-car-marketplace/src/
grep -r "from.*carListingService" bulgarian-car-marketplace/src/
grep -r "from.*carService" bulgarian-car-marketplace/src/
grep -r "from.*firebase-auth-users-service" bulgarian-car-marketplace/src/
grep -r "from.*notificationService" bulgarian-car-marketplace/src/
```

### Phase 3: Update Imports ⏳
**Status**: Pending

Replace old imports with new unified services:

#### Before (Old):
```typescript
import { getCarData } from '@/services/carDataService';
import { listCars } from '@/services/carListingService';
```

#### After (New):
```typescript
import { getCarById, getCarsList } from '@/services/unified-car-service';
```

### Phase 4: Move to ARCHIVE ⏳
**Status**: Pending

Create directory structure:
```
ARCHIVE/
└── deprecated-services/
    └── dec-2025/
        ├── carDataService.ts
        ├── carListingService.ts
        ├── carService.ts
        ├── firebase-auth-users-service.ts
        ├── firebase-auth-real-users.ts
        ├── notificationService.ts
        ├── profileService.ts
        ├── userProfileService.ts
        └── DEPRECATION_NOTES.md
```

---

## Unified Services Map
## خريطة الخدمات الموحدة

### 1. Car Services
**New**: `unified-car-service.ts`
**Replaces**: carDataService, carListingService, carService

#### Methods:
- `getCarById(carId)` - Get car details
- `getCarsList(filters)` - List cars with filters
- `createCar(carData)` - Add new car
- `updateCar(carId, updates)` - Update car
- `deleteCar(carId)` - Delete car
- `searchCars(query)` - Search cars

### 2. User Services
**New**: `unified-user-service.ts`
**Replaces**: firebase-auth-users-service, firebase-auth-real-users

#### Methods:
- `getUserById(userId)` - Get user details
- `getUserProfile(userId)` - Get user profile
- `updateUserProfile(userId, updates)` - Update profile
- `deleteUser(userId)` - Delete user
- `checkUserExists(email)` - Check if user exists

### 3. Notification Services
**New**: `unified-notification-service.ts`
**Replaces**: notificationService

#### Methods:
- `sendNotification(userId, notification)` - Send notification
- `getNotifications(userId)` - Get user notifications
- `markAsRead(notificationId)` - Mark notification as read
- `deleteNotification(notificationId)` - Delete notification

### 4. Profile Services
**New**: `unified-profile-service.ts`
**Replaces**: profileService, userProfileService

#### Methods:
- `getProfile(userId)` - Get profile
- `updateProfile(userId, updates)` - Update profile
- `upgradeToDealer(userId)` - Upgrade to dealer
- `upgradeToCompany(userId)` - Upgrade to company

---

## Migration Checklist
## قائمة مراجعة الترحيل

### Pre-Migration Checks
- [ ] All tests passing
- [ ] Build successful
- [ ] No TypeScript errors
- [ ] Firebase emulators working

### Migration Steps
1. [ ] Search for all imports of deprecated services
2. [ ] Create import replacement map
3. [ ] Update imports file by file
4. [ ] Test each file after update
5. [ ] Run full test suite
6. [ ] Create ARCHIVE/deprecated-services/ directory
7. [ ] Move deprecated files to ARCHIVE
8. [ ] Add deprecation warnings
9. [ ] Update documentation
10. [ ] Deploy to staging
11. [ ] Test in staging
12. [ ] Deploy to production

### Post-Migration Validation
- [ ] All pages load correctly
- [ ] Car listing works
- [ ] User authentication works
- [ ] Notifications work
- [ ] Profile updates work
- [ ] Search functionality works
- [ ] No console errors
- [ ] Performance unchanged or improved

---

## Import Replacement Examples
## أمثلة استبدال الاستيرادات

### Example 1: Car Data
```typescript
// ❌ Old
import { getCarData, updateCarData } from '@/services/carDataService';

const car = await getCarData(carId);
await updateCarData(carId, updates);

// ✅ New
import { getCarById, updateCar } from '@/services/unified-car-service';

const car = await getCarById(carId);
await updateCar(carId, updates);
```

### Example 2: User Auth
```typescript
// ❌ Old
import { getUserByEmail } from '@/services/firebase-auth-users-service';

const user = await getUserByEmail(email);

// ✅ New
import { getUserByEmail } from '@/services/unified-user-service';

const user = await getUserByEmail(email);
```

### Example 3: Notifications
```typescript
// ❌ Old
import { sendNotification } from '@/services/notificationService';

await sendNotification(userId, message);

// ✅ New
import { sendNotification } from '@/services/unified-notification-service';

await sendNotification(userId, {
  title: 'Title',
  message: 'Message',
  type: 'info'
});
```

---

## Testing Strategy
## استراتيجية الاختبار

### Unit Tests
- Test each unified service method
- Ensure backward compatibility
- Test error handling

### Integration Tests
- Test service interactions
- Test with Firebase emulator
- Test with real data

### E2E Tests
- Test complete workflows
- Test Sell Workflow with new services
- Test user registration with new services

---

## Rollback Plan
## خطة الرجوع

If migration causes issues:

1. Restore old service files from ARCHIVE
2. Revert import changes (use git)
3. Run tests to verify
4. Investigate issues
5. Fix and retry migration

---

## Timeline
## الجدول الزمني

- **Day 1**: Search for all usages (grep search)
- **Day 2-3**: Update imports and test
- **Day 4**: Move files to ARCHIVE
- **Day 5**: Staging deployment and testing
- **Day 6**: Production deployment

---

## Notes
## ملاحظات

- ⚠️ **CRITICAL**: Test thoroughly before moving to ARCHIVE
- ⚠️ **CRITICAL**: Keep ARCHIVE files for at least 30 days
- ✅ **SUCCESS CRITERIA**: Zero console errors, all tests passing
- 📊 **METRICS**: Track build size before and after

---

## Contact
For questions or issues during migration:
- Check: COMPLETE_REPAIR_PLAN_FINAL_DEC_15_2025.md
- See: README.md for project structure
- Review: TESTING_COMPLETE_GUIDE.md for testing

