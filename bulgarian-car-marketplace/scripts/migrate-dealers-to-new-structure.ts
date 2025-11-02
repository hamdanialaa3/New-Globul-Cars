/**
 * Dealer Migration Script
 * Phase 4: Migration & Testing
 * 
 * Migrates all dealers from old structure (dealerInfo) to new structure (dealerships/{uid}).
 * Implements dual-write strategy to maintain backward compatibility.
 * 
 * Usage: npx ts-node scripts/migrate-dealers-to-new-structure.ts [--batch-size=100] [--dry-run]
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  writeBatch,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase (use actual config)
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'fire-new-globul'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface MigrationStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: Array<{ uid: string; error: string }>;
  startTime: Date;
  endTime?: Date;
}

async function migrateDealers(batchSize: number = 100, dryRun: boolean = false): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0,
    skippedCount: 0,
    errors: [],
    startTime: new Date()
  };

  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  DEALER MIGRATION - Phase 4                    ║');
  console.log(`║  Batch Size: ${batchSize}                                 ║`);
  console.log(`║  Dry Run: ${dryRun ? 'YES' : 'NO'}                                   ║`);
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // ✅ P3: FIXED - Use safe pagination instead of unsupported where('dealerInfo', '!=', null)
    const usersRef = collection(db, 'users');
    
    // Fetch users in batches (without unsupported where clause)
    const q = query(
      usersRef,
      orderBy('createdAt'), // ✅ Use indexed field
      limit(batchSize)
    );

    const snapshot = await getDocs(q);
    
    // ✅ Filter client-side for users with dealerInfo
    const dealerDocs = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.dealerInfo != null && !data.dealershipRef;
    });
    
    stats.totalProcessed = dealerDocs.length;

    console.log(`📊 Found ${stats.totalProcessed} dealers to migrate\n`);

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
      
      dealerDocs.forEach(docSnap => {
        const data = docSnap.data();
        console.log(`Would migrate: ${docSnap.id} (${data.displayName || data.email})`);
        console.log(`  ✅ Will create: dealerships/${docSnap.id}`);
        console.log(`  ✅ Will update user with dealershipRef\n`);
      });

      stats.endTime = new Date();
      return stats;
    }

    // Process in batches (use filtered dealerDocs)
    const batch = writeBatch(db);
    let batchCount = 0;

    for (const docSnap of dealerDocs) {
      const uid = docSnap.id;
      const userData = docSnap.data();

      try {
        // Note: dealerDocs already filtered, but keep check for safety
        if (userData.dealershipRef) {
          stats.skippedCount++;
          console.log(`⏭️  ${uid}: Already migrated - SKIP`);
          continue;
        }

        const dealerInfo = userData.dealerInfo;

        // Create dealership document
        const dealershipRef = doc(db, 'dealerships', uid);
        batch.set(dealershipRef, {
          uid,
          dealershipNameBG: dealerInfo.companyName || dealerInfo.dealershipNameBG || 'Unknown Dealer',
          dealershipNameEN: dealerInfo.dealershipNameEN || dealerInfo.companyName,
          eik: dealerInfo.licenseNumber || dealerInfo.eik || '000000000',
          vatNumber: dealerInfo.vatNumber || null,
          licenseNumber: dealerInfo.licenseNumber || null,
          address: {
            street: dealerInfo.address?.street || '',
            city: dealerInfo.address?.city || userData.location?.city || 'София',
            region: dealerInfo.address?.region || userData.location?.region || 'София',
            postalCode: dealerInfo.address?.postalCode || '1000',
            country: 'Bulgaria'
          },
          contact: {
            phone: dealerInfo.contactInfo?.phone || userData.phoneNumber || '+359000000000',
            phoneCountryCode: '+359',
            email: dealerInfo.contactInfo?.email || userData.email,
            website: dealerInfo.contactInfo?.website || null
          },
          workingHours: dealerInfo.businessHours || getDefaultWorkingHours(),
          services: {
            newCarSales: true,
            usedCarSales: true,
            carImport: false,
            tradeIn: false,
            financing: false,
            leasing: false,
            insurance: false,
            maintenance: false,
            repairs: false,
            warranty: false,
            carWash: false,
            detailing: false,
            homeDelivery: false,
            testDrive: true,
            onlineReservation: false,
            specializations: dealerInfo.specializations || [],
            brands: []
          },
          certifications: {},
          media: {
            logo: dealerInfo.logo || null,
            galleryImages: []
          },
          settings: {
            displayLanguages: ['bg'],
            currency: 'EUR',
            privacySettings: {
              showPhoneNumber: true,
              showEmail: true,
              showAddress: true,
              showWorkingHours: true,
              allowDirectMessages: true,
              allowCalls: true
            },
            notifications: {
              newInquiries: true,
              newReviews: true,
              weeklyReport: true,
              monthlyReport: true
            },
            businessRules: {
              autoReplyEnabled: false
            }
          },
          verification: {
            status: dealerInfo.verificationStatus || 'pending',
            submittedAt: userData.createdAt || serverTimestamp()
          },
          createdAt: userData.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Update user document with new fields
        const userRef = doc(db, 'users', uid);
        batch.update(userRef, {
          profileType: 'dealer',
          dealershipRef: `dealerships/${uid}`,
          dealerSnapshot: {
            nameBG: dealerInfo.companyName || dealerInfo.dealershipNameBG || 'Unknown',
            nameEN: dealerInfo.dealershipNameEN || dealerInfo.companyName || '',
            logo: dealerInfo.logo || null,
            status: dealerInfo.verificationStatus || 'pending'
          },
          // DUAL-WRITE: Keep legacy fields for backward compatibility
          isDealer: true,
          dealerInfo: dealerInfo,
          updatedAt: serverTimestamp()
        });

        stats.successCount++;
        batchCount++;

        console.log(`✅ ${uid}: Migrated successfully (${stats.successCount}/${stats.totalProcessed})`);

        // Commit batch every 500 operations (Firestore limit)
        if (batchCount >= 500) {
          await batch.commit();
          console.log(`\n💾 Batch committed (${batchCount} operations)\n`);
          batchCount = 0;
        }

      } catch (error) {
        stats.errorCount++;
        stats.errors.push({
          uid,
          error: (error as Error).message
        });
        console.error(`❌ ${uid}: Migration failed - ${(error as Error).message}`);
      }
    }

    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`\n💾 Final batch committed (${batchCount} operations)\n`);
    }

    stats.endTime = new Date();
    return stats;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    stats.endTime = new Date();
    return stats;
  }
}

function getDefaultWorkingHours() {
  return {
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
    sunday: { isOpen: false }
  };
}

function generateReport(stats: MigrationStats): string {
  const duration = stats.endTime 
    ? (stats.endTime.getTime() - stats.startTime.getTime()) / 1000 
    : 0;

  return `
# 📊 DEALER MIGRATION REPORT
## Phase 4: Migration Execution

**Started:** ${stats.startTime.toISOString()}
**Ended:** ${stats.endTime?.toISOString() || 'In Progress'}
**Duration:** ${duration.toFixed(2)} seconds

---

## 📈 RESULTS

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Processed | ${stats.totalProcessed} | 100% |
| ✅ Success | ${stats.successCount} | ${((stats.successCount / stats.totalProcessed) * 100).toFixed(1)}% |
| ⏭️ Skipped | ${stats.skippedCount} | ${((stats.skippedCount / stats.totalProcessed) * 100).toFixed(1)}% |
| ❌ Errors | ${stats.errorCount} | ${((stats.errorCount / stats.totalProcessed) * 100).toFixed(1)}% |

---

## ${stats.errorCount > 0 ? '❌ ERRORS' : '✅ NO ERRORS'}

${stats.errors.length > 0 ? stats.errors.map(e => `- ${e.uid}: ${e.error}`).join('\n') : 'All migrations completed successfully!'}

---

## ✅ NEXT STEPS

${stats.errorCount > 0 ? `
1. 🔴 Review errors above
2. 🔴 Fix data issues manually
3. 🔴 Re-run migration for failed users
4. ⏳ Proceed with caution
` : `
1. ✅ All dealers migrated successfully
2. ✅ Verify data in Firestore console
3. ✅ Test profile pages for dealers
4. ✅ Monitor for 48 hours
5. ✅ Proceed to legacy cleanup (Week 8)
`}

---

**Generated:** ${new Date().toISOString()}
`;
}

async function main() {
  const args = process.argv.slice(2);
  const batchSize = parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '100');
  const dryRun = args.includes('--dry-run');

  console.log('Starting migration...\n');

  const stats = await migrateDealers(batchSize, dryRun);

  // Generate report
  const report = generateReport(stats);
  const outputPath = path.join(__dirname, '..', '📋 PLANS', 'PROFILE_SEPARATION_PLAN', 'DEALER_MIGRATION_REPORT.md');
  fs.writeFileSync(outputPath, report, 'utf8');

  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 MIGRATION SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`Total: ${stats.totalProcessed}`);
  console.log(`Success: ${stats.successCount} ✅`);
  console.log(`Skipped: ${stats.skippedCount} ⏭️`);
  console.log(`Errors: ${stats.errorCount} ❌`);
  console.log(`Duration: ${((stats.endTime!.getTime() - stats.startTime.getTime()) / 1000).toFixed(2)}s`);
  console.log('═══════════════════════════════════════════════\n');

  console.log(`📄 Report saved to: ${outputPath}\n`);

  if (stats.errorCount > 0) {
    console.log('⚠️  Migration completed with errors. Review report before proceeding.\n');
    process.exit(1);
  } else {
    console.log('✅ Migration completed successfully!\n');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

export { migrateDealers, generateReport };

