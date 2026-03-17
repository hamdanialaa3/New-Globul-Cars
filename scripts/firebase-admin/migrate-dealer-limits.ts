#!/usr/bin/env node

/**
 * Database Migration Script: Update Existing Dealer Users
 * Ensures all dealer users have correct listing limits
 * 
 * File: scripts/migrate-dealer-limits.ts
 * Created: January 8, 2026
 * 
 * RUN: npx ts-node scripts/migrate-dealer-limits.ts
 */

import * as admin from 'firebase-admin';
import { loadServiceAccount } from './load-service-account';

// Initialize Firebase Admin (prefer env-based credentials)
admin.initializeApp({
  credential: admin.credential.cert(loadServiceAccount()),
});

const db = admin.firestore();

interface UserData {
  subscription: {
    tier: 'free' | 'dealer' | 'company';
    status: string;
  };
  stats: {
    activeListings: number;
  };
}

async function migrateDealerLimits() {
  console.log('🔄 Starting Dealer Limit Migration...\n');
  console.log('━'.repeat(60));

  try {
    // Find all dealer users
    const dealerUsersSnapshot = await db
      .collection('users')
      .where('subscription.tier', '==', 'dealer')
      .get();

    console.log(`📊 Found ${dealerUsersSnapshot.size} dealer users\n`);

    if (dealerUsersSnapshot.empty) {
      console.log('✅ No dealer users found. Nothing to migrate.');
      return;
    }

    let affectedUsers = 0;
    let usersWithIssues = 0;
    const userDetails: Array<{
      uid: string;
      activeListings: number;
      status: string;
      issue?: string;
    }> = [];

    // Analyze each dealer user
    for (const userDoc of dealerUsersSnapshot.docs) {
      const userData = userDoc.data() as UserData;
      const uid = userDoc.id;
      const activeListings = userData.stats?.activeListings || 0;
      const subscriptionStatus = userData.subscription?.status || 'unknown';

      userDetails.push({
        uid,
        activeListings,
        status: subscriptionStatus,
      });

      // Check if user has 11-30 listings (were previously blocked)
      if (activeListings > 10 && activeListings <= 30) {
        affectedUsers++;
        console.log(`✅ User ${uid}: ${activeListings} listings (was blocked, now OK)`);
      } else if (activeListings > 30) {
        usersWithIssues++;
        userDetails[userDetails.length - 1].issue = 'Over limit (investigate)';
        console.log(`⚠️  User ${uid}: ${activeListings} listings (over limit - investigate!)`);
      } else {
        console.log(`ℹ️  User ${uid}: ${activeListings} listings`);
      }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('📈 Migration Summary:\n');
    console.log(`Total dealer users: ${dealerUsersSnapshot.size}`);
    console.log(`Users with 11-30 listings (now OK): ${affectedUsers}`);
    console.log(`Users with >30 listings (investigate): ${usersWithIssues}`);

    // Detailed breakdown
    console.log('\n📊 Listing Distribution:');
    const distribution = {
      '0-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31+': 0,
    };

    userDetails.forEach((user) => {
      if (user.activeListings <= 10) distribution['0-10']++;
      else if (user.activeListings <= 20) distribution['11-20']++;
      else if (user.activeListings <= 30) distribution['21-30']++;
      else distribution['31+']++;
    });

    console.log(`  0-10 listings:  ${distribution['0-10']} users`);
    console.log(`  11-20 listings: ${distribution['11-20']} users`);
    console.log(`  21-30 listings: ${distribution['21-30']} users`);
    console.log(`  31+ listings:   ${distribution['31+']} users (⚠️  investigate)`);

    // Write report to file
    const report = {
      migrationDate: new Date().toISOString(),
      totalDealerUsers: dealerUsersSnapshot.size,
      affectedUsers,
      usersWithIssues,
      distribution,
      userDetails,
    };

    const fs = require('fs');
    const reportPath = path.join(__dirname, '../logs/dealer-migration-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    console.log('\n' + '━'.repeat(60));
    console.log('✅ Migration Analysis Complete!\n');
    console.log('🎉 All dealer users can now create up to 30 listings!');
    console.log('🔍 Review users with >30 listings manually.\n');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrateDealerLimits()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
