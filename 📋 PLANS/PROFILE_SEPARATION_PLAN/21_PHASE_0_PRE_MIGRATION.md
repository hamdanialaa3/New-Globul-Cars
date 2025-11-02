# ⚡ Phase 0: Pre-Migration Safeguards
## إصلاح المشاكل الحرجة قبل البدء

**الرقم:** 21 (المراحل التنفيذية)  
**المدة:** 5 أيام عمل (محدّث من 3-4)  
**الأولوية:** 🔥 CRITICAL  
**الحالة:** ✅ Ready - Enhanced with Data Snapshot

---

## 🆕 التحديثات في v2.0

```diff
+ Phase 0.0: Data Snapshot & Validation (يوم جديد)
  - Firestore backup كامل
  - تحليل البيانات الموجودة (script)
  - تقرير تعقيد الترحيل
  - تحديد المشاكل الحرجة

الباقي: Phase 0.1-0.3 كما في الخطة الأصلية
```

---

## ⚠️ Phase 0.0: Data Snapshot & Validation (NEW!)

### الهدف
**فهم البيانات الموجودة قبل الترحيل**

### المدة
1 يوم عمل

### 0.0.1 Firestore & Storage Backup

```bash
# 1. Firestore full backup
firebase firestore:export gs://fire-new-globul-backup/phase0-$(date +%Y%m%d-%H%M%S)

# 2. Storage backup (logos, images, documents)
gsutil -m rsync -r gs://fire-new-globul.appspot.com gs://fire-new-globul-backup/storage-$(date +%Y%m%d)

# 3. Verify backup
firebase firestore:export --help
gsutil ls gs://fire-new-globul-backup/
```

**Documentation:** Create `BACKUP_MANIFEST.md`
```markdown
# Backup Manifest - Phase 0

Date: 2025-11-XX
Time: XX:XX UTC

## Firestore Export
Location: gs://fire-new-globul-backup/phase0-20251101-120000
Size: XXX MB
Collections: users, posts, cars, conversations, notifications
Documents: ~XXXX total

## Storage Backup
Location: gs://fire-new-globul-backup/storage-20251101
Size: XXX GB
Files: ~XXXX files

## Restore Instructions
```bash
# Restore Firestore
firebase firestore:import gs://fire-new-globul-backup/phase0-20251101-120000

# Restore Storage
gsutil -m rsync -r gs://fire-new-globul-backup/storage-20251101 gs://fire-new-globul.appspot.com
```
```

### 0.0.2 Analyze Existing Data

**Create:** `scripts/analyze-existing-data.ts`

```typescript
/**
 * Data Analysis Script
 * Analyzes existing users to understand migration complexity
 * 
 * Usage: npx ts-node scripts/analyze-existing-data.ts
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase/firebase-config';
import * as fs from 'fs';

interface DataAnalysisReport {
  timestamp: string;
  totalUsers: number;
  profileTypeBreakdown: {
    private: number;
    dealer: number;
    company: number;
    undefined: number;
  };
  legacyFields: {
    hasDealerInfo: number;
    hasIsDealer: number;
    bothFields: number;
  };
  dataQuality: {
    complete: number;
    incomplete: number;
    corrupt: number;
  };
  criticalIssues: {
    isDealerWithoutInfo: number;
    undefinedProfileType: number;
    missingEmail: number;
  };
  migrationComplexity: 'low' | 'medium' | 'high';
  estimatedMigrationTime: string;
}

async function analyzeData(): Promise<DataAnalysisReport> {
  console.log('🔍 Starting data analysis...\n');
  
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const report: DataAnalysisReport = {
    timestamp: new Date().toISOString(),
    totalUsers: users.length,
    profileTypeBreakdown: { private: 0, dealer: 0, company: 0, undefined: 0 },
    legacyFields: { hasDealerInfo: 0, hasIsDealer: 0, bothFields: 0 },
    dataQuality: { complete: 0, incomplete: 0, corrupt: 0 },
    criticalIssues: { isDealerWithoutInfo: 0, undefinedProfileType: 0, missingEmail: 0 },
    migrationComplexity: 'low',
    estimatedMigrationTime: '< 1 hour'
  };
  
  // Analyze each user
  for (const user of users as any[]) {
    // Profile type
    if (user.profileType === 'private') report.profileTypeBreakdown.private++;
    else if (user.profileType === 'dealer') report.profileTypeBreakdown.dealer++;
    else if (user.profileType === 'company') report.profileTypeBreakdown.company++;
    else report.profileTypeBreakdown.undefined++;
    
    // Legacy fields
    if (user.dealerInfo) report.legacyFields.hasDealerInfo++;
    if (user.isDealer) report.legacyFields.hasIsDealer++;
    if (user.dealerInfo && user.isDealer) report.legacyFields.bothFields++;
    
    // Critical issues
    if (user.isDealer && !user.dealerInfo) report.criticalIssues.isDealerWithoutInfo++;
    if (!user.profileType) report.criticalIssues.undefinedProfileType++;
    if (!user.email) report.criticalIssues.missingEmail++;
    
    // Data quality
    const score = calculateQualityScore(user);
    if (score >= 0.8) report.dataQuality.complete++;
    else if (score >= 0.5) report.dataQuality.incomplete++;
    else report.dataQuality.corrupt++;
  }
  
  // Determine complexity
  const legacyPercent = (report.legacyFields.hasDealerInfo + report.legacyFields.hasIsDealer) / (report.totalUsers * 2);
  if (legacyPercent > 0.5 || report.criticalIssues.isDealerWithoutInfo > 10) {
    report.migrationComplexity = 'high';
    report.estimatedMigrationTime = '4-6 hours';
  } else if (legacyPercent > 0.2) {
    report.migrationComplexity = 'medium';
    report.estimatedMigrationTime = '2-3 hours';
  }
  
  return report;
}

function calculateQualityScore(user: any): number {
  let score = 0;
  const required = ['email', 'displayName', 'profileType', 'createdAt'];
  required.forEach(f => { if (user[f]) score++; });
  
  if (user.profileType === 'dealer' && (user.dealerInfo || user.dealershipRef)) score++;
  
  return score / (required.length + 1);
}

// Run and save report
analyzeData().then(report => {
  console.log('📊 DATA ANALYSIS REPORT\n');
  console.log(JSON.stringify(report, null, 2));
  
  // Save JSON
  fs.writeFileSync('DATA_ANALYSIS_REPORT.json', JSON.stringify(report, null, 2));
  
  // Generate readable report
  const readable = `
# Data Analysis Report
Date: ${report.timestamp}

## Summary
- Total Users: ${report.totalUsers}
- Complexity: ${report.migrationComplexity.toUpperCase()}
- Estimated Time: ${report.estimatedMigrationTime}

## Profile Types
- Private: ${report.profileTypeBreakdown.private}
- Dealer: ${report.profileTypeBreakdown.dealer}
- Company: ${report.profileTypeBreakdown.company}
- Undefined: ${report.profileTypeBreakdown.undefined}

## Legacy Fields
- Has dealerInfo: ${report.legacyFields.hasDealerInfo}
- Has isDealer: ${report.legacyFields.hasIsDealer}
- Both: ${report.legacyFields.bothFields}

## Critical Issues
- isDealer without dealerInfo: ${report.criticalIssues.isDealerWithoutInfo}
- Undefined profileType: ${report.criticalIssues.undefinedProfileType}
- Missing email: ${report.criticalIssues.missingEmail}

## Data Quality
- Complete: ${report.dataQuality.complete} (${(report.dataQuality.complete/report.totalUsers*100).toFixed(1)}%)
- Incomplete: ${report.dataQuality.incomplete} (${(report.dataQuality.incomplete/report.totalUsers*100).toFixed(1)}%)
- Corrupt: ${report.dataQuality.corrupt} (${(report.dataQuality.corrupt/report.totalUsers*100).toFixed(1)}%)
  `;
  
  fs.writeFileSync('DATA_ANALYSIS_REPORT.md', readable);
  
  console.log('\n✅ Reports saved');
  console.log('  - DATA_ANALYSIS_REPORT.json');
  console.log('  - DATA_ANALYSIS_REPORT.md');
});
```

**Exit Criteria 0.0:**
- ✅ Backups completed
- ✅ Analysis script run
- ✅ Reports generated
- ✅ Critical issues identified

---

## ✅ Phase 0.1: Split ProfilePage

### المشكلة
```
ProfilePage/index.tsx = 2227 lines 🔥
```

### الحل
```
ProfilePage/
├── index.tsx (150) - Router only
├── layout/
│   ├── ProfileLayout.tsx (280)
│   └── TabNavigation.tsx (150)
├── tabs/
│   ├── ProfileOverview.tsx (250)
│   ├── MyAdsTab.tsx (280)
│   ├── AnalyticsTab.tsx (280)
│   ├── SettingsTab.tsx (300)
│   ├── CampaignsTab.tsx (280)
│   └── ConsultationsTab.tsx (220)
└── hooks/
    ├── useProfileData.ts (180)
    └── useProfileActions.ts (120)

Total: 9 files, all < 300 lines ✅
```

**المدة:** 2 أيام

---

## ✅ Phase 0.2: Consolidate Services

### تنفيذ خطة Day 3

```typescript
// تحديث 23 file
// إضافة deprecation warnings
// تحديث tests
```

**المدة:** 1 يوم

---

## ✅ Phase 0.3: Add Validators

### switchProfileType() Validation

```typescript
const switchProfileType = async (newType: ProfileType) => {
  const userData = await getDoc(doc(db, 'users', currentUser.uid));
  const data = userData.data();
  
  // Dealer validations
  if (newType === 'dealer') {
    if (!data?.dealershipRef && !data?.dealerInfo) {
      throw new Error(t('profile.switch.errors.missingDealershipRef'));
    }
  }
  
  // Downgrade validation
  if (data?.profileType === 'dealer' && newType === 'private') {
    if ((data?.stats?.activeListings || 0) > 10) {
      throw new Error(t('profile.switch.errors.activeListingsExceeded'));
    }
  }
  
  await updateDoc(doc(db, 'users', currentUser.uid), {
    profileType: newType,
    updatedAt: serverTimestamp()
  });
  
  setProfileType(newType);
};
```

**المدة:** 1 يوم

---

## 📊 Phase 0 Summary

```
Duration: 5 days

Day 1: Data Snapshot ✓
Day 2-3: Split ProfilePage ✓
Day 4: Consolidate Services ✓
Day 5: Add Validators ✓
```

---

## 🚀 Next Phase

```
Phase 0 ✅ → Phase 1: Core Types
             (راجع ملف 22_PHASE_1 أو 71_PRIORITIZED_PLAN.md)
```

---

**آخر تحديث:** نوفمبر 2025  
**الإصدار:** v2.0  
**الحالة:** ✅ Ready for Execution

