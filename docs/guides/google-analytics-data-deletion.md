# Google Analytics Data Deletion Integration
# تكامل حذف بيانات Google Analytics

## Overview / نظرة عامة

This document describes the integration with Google Analytics Data Deletion API for GDPR compliance.

هذا المستند يصف التكامل مع Google Analytics Data Deletion API للامتثال لـ GDPR.

## Property Information / معلومات الخاصية

- **Account ID**: `368904922`
- **Property ID**: `507597643`
- **Measurement ID**: `G-TDRZ4Z3D7Z`
- **Data Deletion URL**: https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin/piidatadeletion/table

## Implementation / التنفيذ

### Service Location / موقع الخدمة

The service is located at:
`src/services/analytics/google-analytics-data-deletion.service.ts`

### Key Features / الميزات الرئيسية

1. **Automatic Data Deletion Request** / طلب حذف البيانات التلقائي
   - When a user deletes their account, a deletion request is automatically sent to Google Analytics
   - عند حذف المستخدم لحسابه، يتم إرسال طلب حذف تلقائي إلى Google Analytics

2. **Immediate Tracking Clearance** / مسح التتبع الفوري
   - User tracking is cleared immediately from Google Analytics
   - يتم مسح تتبع المستخدم فوراً من Google Analytics

3. **Deletion Request Logging** / تسجيل طلبات الحذف
   - All deletion requests are logged in Firestore collection `ga_data_deletion_requests`
   - جميع طلبات الحذف يتم تسجيلها في مجموعة Firestore `ga_data_deletion_requests`

4. **Status Tracking** / تتبع الحالة
   - You can check the status of deletion requests
   - يمكنك التحقق من حالة طلبات الحذف

## Usage / الاستخدام

### Automatic Integration / التكامل التلقائي

The service is automatically called when a user deletes their account through:
- Settings Tab → Data & Privacy → Delete Account

يتم استدعاء الخدمة تلقائياً عند حذف المستخدم لحسابه من خلال:
- تبويب الإعدادات → البيانات والخصوصية → حذف الحساب

### Manual Usage / الاستخدام اليدوي

```typescript
import gaDataDeletionService from './services/analytics/google-analytics-data-deletion.service';

// Request data deletion
const result = await gaDataDeletionService.requestDataDeletion(
  userId,
  userEmail,
  'User request (GDPR)'
);

// Clear user tracking immediately
gaDataDeletionService.clearUserTracking();

// Get property information
const info = gaDataDeletionService.getPropertyInfo();
console.log(info.deletionUrl); // Link to GA deletion page
```

## GDPR Compliance / الامتثال لـ GDPR

This integration ensures compliance with:
- **GDPR Article 17**: Right to Erasure ("Right to be Forgotten")
- **GDPR Article 20**: Right to Data Portability

هذا التكامل يضمن الامتثال لـ:
- **المادة 17 من GDPR**: الحق في المحو ("الحق في النسيان")
- **المادة 20 من GDPR**: الحق في نقل البيانات

## Data Deletion Process / عملية حذف البيانات

1. **User Request** / طلب المستخدم
   - User clicks "Delete Account" in settings
   - المستخدم ينقر على "حذف الحساب" في الإعدادات

2. **Automatic Processing** / المعالجة التلقائية
   - Firestore data is deleted
   - يتم حذف بيانات Firestore
   - Google Analytics deletion request is submitted
   - يتم إرسال طلب حذف Google Analytics
   - User tracking is cleared immediately
   - يتم مسح تتبع المستخدم فوراً

3. **Google Analytics Processing** / معالجة Google Analytics
   - Google Analytics processes the deletion request within 24-48 hours
   - Google Analytics تعالج طلب الحذف خلال 24-48 ساعة
   - All PII data associated with the user is removed
   - يتم إزالة جميع بيانات PII المرتبطة بالمستخدم

## Monitoring / المراقبة

### Firestore Collection / مجموعة Firestore

All deletion requests are stored in:
`ga_data_deletion_requests`

Each document contains:
- `userId`: User ID
- `userEmail`: User email (if available)
- `deletionReason`: Reason for deletion
- `requestedAt`: Timestamp of request
- `accountId`: Google Analytics Account ID
- `propertyId`: Google Analytics Property ID
- `measurementId`: Measurement ID
- `status`: Request status (pending, processing, completed, failed)
- `createdAt`: Creation timestamp

### Check Deletion Status / التحقق من حالة الحذف

```typescript
const status = await gaDataDeletionService.getDeletionStatus(requestId);
console.log(status.status); // 'pending' | 'processing' | 'completed' | 'failed'
```

## Manual Deletion via Google Analytics Dashboard / الحذف اليدوي عبر لوحة تحكم Google Analytics

Administrators can also manually process deletion requests via:
https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin/piidatadeletion/table

يمكن للمسؤولين أيضاً معالجة طلبات الحذف يدوياً عبر:
https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin/piidatadeletion/table

## Notes / ملاحظات

1. **Processing Time**: Google Analytics typically processes deletion requests within 24-48 hours
   - وقت المعالجة: Google Analytics تعالج عادة طلبات الحذف خلال 24-48 ساعة

2. **Immediate Effect**: User tracking is cleared immediately, but historical data deletion takes time
   - التأثير الفوري: يتم مسح تتبع المستخدم فوراً، لكن حذف البيانات التاريخية يستغرق وقتاً

3. **Backend Implementation**: For full API integration, a backend service with OAuth is required
   - التنفيذ الخلفي: للتكامل الكامل مع API، يلزم خدمة خلفية مع OAuth

## Related Files / الملفات ذات الصلة

- `src/services/analytics/google-analytics-data-deletion.service.ts` - Main service
- `src/services/compliance/gdpr.service.ts` - GDPR service (calls GA deletion)
- `src/utils/google-analytics.ts` - Google Analytics initialization
- `src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx` - Settings page with deletion UI

