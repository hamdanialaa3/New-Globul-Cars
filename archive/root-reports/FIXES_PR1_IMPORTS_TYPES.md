# PR #1: Fix Import Paths & Missing Types

## 📋 Summary
Fixes import path issues and undefined type references across 3 service files.

## 🎯 Files Changed (3)
1. `src/services/messaging/realtime/image-upload.service.ts` - Fix @/ import path
2. `src/services/bulgarian-profile-service.ts` - Replace BulgarianUserProfile with BulgarianUser
3. `src/services/profile/ProfileService.ts` - Fix @/ import path

## 🔧 Changes

### Fix 1: messaging/realtime/image-upload.service.ts
**Error**: Cannot find module '@/services/logger-service'

```diff
- import { logger } from '@/services/logger-service';
+ import { logger } from '../../logger-service';
```

### Fix 2: bulgarian-profile-service.ts (8 occurrences)
**Error**: Cannot find name 'BulgarianUserProfile'

The type `BulgarianUserProfile` doesn't exist. Use `BulgarianUser` from bulgarian-user.types.ts.

```diff
- profileData: Partial<BulgarianUserProfile>,
+ profileData: Partial<BulgarianUser>,

- ): Promise<BulgarianUserProfile> {
+ ): Promise<BulgarianUser> {

- const completeProfile: BulgarianUserProfile = {
+ const completeProfile: BulgarianUser = {

- static async updateUserProfile(userId: string, updates: Partial<BulgarianUserProfile>): Promise<void> {
+ static async updateUserProfile(userId: string, updates: Partial<BulgarianUser>): Promise<void> {

- static getUserProfileRealtime(userId: string | null | undefined, callback: (profile: BulgarianUserProfile | null) => void): () => void {
+ static getUserProfileRealtime(userId: string | null | undefined, callback: (profile: BulgarianUser | null) => void): () => void {

- callback(doc.data() as BulgarianUserProfile);
+ callback(doc.data() as BulgarianUser);

- static async getUserProfile(userId: string): Promise<BulgarianUserProfile | null> {
+ static async getUserProfile(userId: string): Promise<BulgarianUser | null> {

- return userDoc.data() as BulgarianUserProfile;
+ return userDoc.data() as BulgarianUser;
```

### Fix 3: profile/ProfileService.ts
**Error**: Cannot find module '@/firebase/firebase-config'

```diff
- import { db } from '@/firebase/firebase-config';
+ import { db } from '../../firebase/firebase-config';
```

## ✅ Verification
```bash
npx tsc --noEmit src/services/messaging/realtime/image-upload.service.ts src/services/bulgarian-profile-service.ts src/services/profile/ProfileService.ts --skipLibCheck
```

## 📝 Commit Message
```
fix(types): correct import paths and type references

- Fix @/ alias imports to relative paths (messaging, ProfileService)
- Replace BulgarianUserProfile with BulgarianUser (8 occurrences)
- All types now reference canonical bulgarian-user.types.ts

Fixes 11 TypeScript errors in 3 files.
```
