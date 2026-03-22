/**
 * Data Analysis Script for Profile Separation Plan
 * Phase 0 - Day 1: Analyze existing user data before migration
 * 
 * Purpose:
 * - Count users by profile type
 * - Identify data quality issues
 * - Detect legacy field usage
 * - Generate migration complexity report
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase config (use your actual config)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || 'fire-new-globul',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface AnalysisResult {
  totalUsers: number;
  byProfileType: {
    private: number;
    dealer: number;
    company: number;
    undefined: number;
  };
  legacyFieldUsage: {
    hasIsDealer: number;
    hasDealerInfo: number;
    hasBothLegacyFields: number;
  };
  dataQualityIssues: {
    missingEmail: number;
    missingDisplayName: number;
    missingProfileType: number;
    inconsistentProfileType: number;
  };
  dealerData: {
    totalDealers: number;
    withDealerInfo: number;
    withDealershipRef: number;
    needsMigration: number;
  };
  timestamp: string;
}

async function analyzeUserData(): Promise<AnalysisResult> {
  console.log('🔍 Starting data analysis...\n');
  
  const result: AnalysisResult = {
    totalUsers: 0,
    byProfileType: {
      private: 0,
      dealer: 0,
      company: 0,
      undefined: 0
    },
    legacyFieldUsage: {
      hasIsDealer: 0,
      hasDealerInfo: 0,
      hasBothLegacyFields: 0
    },
    dataQualityIssues: {
      missingEmail: 0,
      missingDisplayName: 0,
      missingProfileType: 0,
      inconsistentProfileType: 0
    },
    dealerData: {
      totalDealers: 0,
      withDealerInfo: 0,
      withDealershipRef: 0,
      needsMigration: 0
    },
    timestamp: new Date().toISOString()
  };

  try {
    // Fetch all users
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    result.totalUsers = snapshot.size;
    console.log(`📊 Total users found: ${result.totalUsers}\n`);

    // Analyze each user
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Profile Type Analysis
      const profileType = data.profileType as string | undefined;
      if (profileType === 'private') {
        result.byProfileType.private++;
      } else if (profileType === 'dealer') {
        result.byProfileType.dealer++;
        result.dealerData.totalDealers++;
      } else if (profileType === 'company') {
        result.byProfileType.company++;
      } else {
        result.byProfileType.undefined++;
      }

      // Legacy Field Usage
      if (data.isDealer !== undefined) {
        result.legacyFieldUsage.hasIsDealer++;
      }
      if (data.dealerInfo !== undefined) {
        result.legacyFieldUsage.hasDealerInfo++;
      }
      if (data.isDealer !== undefined && data.dealerInfo !== undefined) {
        result.legacyFieldUsage.hasBothLegacyFields++;
      }

      // Data Quality Issues
      if (!data.email) {
        result.dataQualityIssues.missingEmail++;
      }
      if (!data.displayName) {
        result.dataQualityIssues.missingDisplayName++;
      }
      if (!data.profileType) {
        result.dataQualityIssues.missingProfileType++;
      }

      // Inconsistency Check: isDealer vs profileType
      if (data.isDealer === true && data.profileType !== 'dealer') {
        result.dataQualityIssues.inconsistentProfileType++;
      }
      if (data.isDealer === false && data.profileType === 'dealer') {
        result.dataQualityIssues.inconsistentProfileType++;
      }

      // Dealer-specific Analysis
      if (profileType === 'dealer' || data.isDealer === true) {
        if (data.dealerInfo) {
          result.dealerData.withDealerInfo++;
        }
        if (data.dealershipRef) {
          result.dealerData.withDealershipRef++;
        }
        // Needs migration if has dealerInfo but no dealershipRef
        if (data.dealerInfo && !data.dealershipRef) {
          result.dealerData.needsMigration++;
        }
      }
    });

    console.log('✅ Analysis complete!\n');
    return result;
    
  } catch (error) {
    console.error('❌ Error analyzing data:', error);
    throw error;
  }
}

function generateReport(result: AnalysisResult): string {
  const report = `
# 📊 DATA ANALYSIS REPORT
## Profile Separation Plan - Phase 0 Day 1

**Generated:** ${new Date(result.timestamp).toLocaleString()}

---

## 📈 OVERALL STATISTICS

- **Total Users:** ${result.totalUsers.toLocaleString()}

---

## 🎭 PROFILE TYPE DISTRIBUTION

| Profile Type | Count | Percentage |
|--------------|-------|------------|
| Private      | ${result.byProfileType.private.toLocaleString()} | ${((result.byProfileType.private / result.totalUsers) * 100).toFixed(1)}% |
| Dealer       | ${result.byProfileType.dealer.toLocaleString()} | ${((result.byProfileType.dealer / result.totalUsers) * 100).toFixed(1)}% |
| Company      | ${result.byProfileType.company.toLocaleString()} | ${((result.byProfileType.company / result.totalUsers) * 100).toFixed(1)}% |
| Undefined    | ${result.byProfileType.undefined.toLocaleString()} | ${((result.byProfileType.undefined / result.totalUsers) * 100).toFixed(1)}% |

${result.byProfileType.undefined > 0 ? '⚠️ **WARNING:** Some users have undefined profileType!' : '✅ All users have defined profileType'}

---

## 🔧 LEGACY FIELD USAGE

| Field | Count | Percentage |
|-------|-------|------------|
| Has \`isDealer\` | ${result.legacyFieldUsage.hasIsDealer.toLocaleString()} | ${((result.legacyFieldUsage.hasIsDealer / result.totalUsers) * 100).toFixed(1)}% |
| Has \`dealerInfo\` | ${result.legacyFieldUsage.hasDealerInfo.toLocaleString()} | ${((result.legacyFieldUsage.hasDealerInfo / result.totalUsers) * 100).toFixed(1)}% |
| Has Both | ${result.legacyFieldUsage.hasBothLegacyFields.toLocaleString()} | ${((result.legacyFieldUsage.hasBothLegacyFields / result.totalUsers) * 100).toFixed(1)}% |

**Migration Impact:** ${result.legacyFieldUsage.hasIsDealer} users need legacy field cleanup

---

## ⚠️ DATA QUALITY ISSUES

| Issue | Count | Severity |
|-------|-------|----------|
| Missing Email | ${result.dataQualityIssues.missingEmail} | ${result.dataQualityIssues.missingEmail > 0 ? '🔴 HIGH' : '✅ OK'} |
| Missing Display Name | ${result.dataQualityIssues.missingDisplayName} | ${result.dataQualityIssues.missingDisplayName > 0 ? '🟡 MEDIUM' : '✅ OK'} |
| Missing Profile Type | ${result.dataQualityIssues.missingProfileType} | ${result.dataQualityIssues.missingProfileType > 0 ? '🔴 HIGH' : '✅ OK'} |
| Inconsistent Profile Type | ${result.dataQualityIssues.inconsistentProfileType} | ${result.dataQualityIssues.inconsistentProfileType > 0 ? '🔴 CRITICAL' : '✅ OK'} |

${result.dataQualityIssues.inconsistentProfileType > 0 ? `
### 🚨 CRITICAL ISSUE DETECTED
${result.dataQualityIssues.inconsistentProfileType} users have mismatched \`isDealer\` and \`profileType\` values!
This must be fixed before migration.
` : ''}

---

## 🏢 DEALER DATA ANALYSIS

| Metric | Count |
|--------|-------|
| Total Dealers (by profileType) | ${result.dealerData.totalDealers} |
| With \`dealerInfo\` (legacy) | ${result.dealerData.withDealerInfo} |
| With \`dealershipRef\` (new) | ${result.dealerData.withDealershipRef} |
| **Need Migration** | **${result.dealerData.needsMigration}** |

**Migration Complexity:** ${result.dealerData.needsMigration > 0 ? `🟡 MODERATE - ${result.dealerData.needsMigration} dealers need data migration` : '✅ LOW - All dealers already migrated'}

---

## 📋 MIGRATION RECOMMENDATIONS

${generateRecommendations(result)}

---

## 🎯 NEXT STEPS

1. ${result.dataQualityIssues.inconsistentProfileType > 0 ? '🔴 **CRITICAL:** Fix inconsistent profileType data' : '✅ Data quality acceptable'}
2. ${result.byProfileType.undefined > 0 ? `🟡 Set profileType for ${result.byProfileType.undefined} users (default: 'private')` : '✅ All users have profileType'}
3. ${result.dealerData.needsMigration > 0 ? `🟡 Migrate ${result.dealerData.needsMigration} dealers from dealerInfo to dealerships collection` : '✅ No dealer migration needed'}
4. ✅ Proceed with Phase 0 Day 2-3: Split ProfilePage
5. ✅ Implement dual-write strategy in Phase 1

---

**Report Generated:** ${new Date().toLocaleString()}  
**Phase:** 0 (Pre-Migration)  
**Status:** ${result.dataQualityIssues.inconsistentProfileType > 0 ? '⚠️ REQUIRES ATTENTION' : '✅ READY TO PROCEED'}
`;

  return report;
}

function generateRecommendations(result: AnalysisResult): string {
  const recommendations: string[] = [];

  // Critical issues
  if (result.dataQualityIssues.inconsistentProfileType > 0) {
    recommendations.push(`
### 🚨 CRITICAL: Fix Profile Type Inconsistencies
\`\`\`typescript
// Run this migration script:
const usersRef = collection(db, 'users');
const inconsistentUsers = await getDocs(
  query(usersRef, where('isDealer', '==', true), where('profileType', '!=', 'dealer'))
);

inconsistentUsers.forEach(async (doc) => {
  await updateDoc(doc.ref, {
    profileType: 'dealer',  // Fix based on isDealer
    updatedAt: serverTimestamp()
  });
});
\`\`\`
`);
  }

  // Missing profileType
  if (result.byProfileType.undefined > 0) {
    recommendations.push(`
### 🟡 Set Default Profile Type
\`\`\`typescript
// Set 'private' as default for undefined profileType
const undefinedUsers = await getDocs(
  query(usersRef, where('profileType', '==', null))
);

undefinedUsers.forEach(async (doc) => {
  await updateDoc(doc.ref, {
    profileType: 'private',  // Default
    updatedAt: serverTimestamp()
  });
});
\`\`\`
`);
  }

  // Dealer migration
  if (result.dealerData.needsMigration > 0) {
    recommendations.push(`
### 🟡 Migrate Dealer Data
${result.dealerData.needsMigration} dealers need migration from \`dealerInfo\` to \`dealerships/{uid}\` collection.

**Priority:** Medium  
**Timeline:** Phase 1 (Week 1-2)  
**Method:** See \`MIGRATION_RUNBOOK_DEALERSHIP.md\`
`);
  }

  // All good
  if (recommendations.length === 0) {
    recommendations.push(`
### ✅ Data Quality: EXCELLENT
- No critical issues found
- All users have consistent data
- Ready to proceed with migration plan
`);
  }

  return recommendations.join('\n');
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  DATA ANALYSIS - Profile Separation Plan      ║');
  console.log('║  Phase 0 - Day 1                               ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // Analyze data
    const result = await analyzeUserData();

    // Generate report
    const report = generateReport(result);

    // Save to file
    const outputDir = path.join(__dirname, '..', '📋 PLANS', 'PROFILE_SEPARATION_PLAN');
    const outputPath = path.join(outputDir, 'DATA_ANALYSIS_REPORT.md');
    
    fs.writeFileSync(outputPath, report, 'utf8');
    console.log(`\n✅ Report saved to: ${outputPath}\n`);

    // Print summary
    console.log('═══════════════════════════════════════════════');
    console.log('📊 QUICK SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Total Users: ${result.totalUsers}`);
    console.log(`Profile Types: Private(${result.byProfileType.private}) | Dealer(${result.byProfileType.dealer}) | Company(${result.byProfileType.company}) | Undefined(${result.byProfileType.undefined})`);
    console.log(`Legacy Usage: ${result.legacyFieldUsage.hasIsDealer} users with isDealer`);
    console.log(`Data Issues: ${result.dataQualityIssues.inconsistentProfileType} inconsistent`);
    console.log(`Needs Migration: ${result.dealerData.needsMigration} dealers`);
    console.log('═══════════════════════════════════════════════\n');

    // Exit code based on critical issues
    if (result.dataQualityIssues.inconsistentProfileType > 0) {
      console.log('⚠️  WARNING: Critical data issues found!');
      console.log('    Review DATA_ANALYSIS_REPORT.md before proceeding.\n');
      process.exit(1);
    } else {
      console.log('✅ Data quality acceptable. Ready to proceed!\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { analyzeUserData, generateReport };

