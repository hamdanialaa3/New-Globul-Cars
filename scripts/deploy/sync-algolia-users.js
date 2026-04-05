/**
 * Algolia Users Backfill Script
 * One-time script to index all existing users into Algolia
 *
 * Usage:
 *   1. Ensure .env.local has ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY, and FIREBASE_SERVICE_ACCOUNT_KEY
 *   2. Run: node scripts/deploy/sync-algolia-users.js
 *
 * @since April 2026 — Cloud Apps 4.6
 */

const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');
require('dotenv').config({ path: '.env.local' });

// ============================================
const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
  console.error('❌ CRITICAL: ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY must be set in .env.local');
  process.exit(1);
}

const USERS_INDEX_NAME = 'users';

// ============================================
// INITIALIZE SERVICES
// ============================================
console.log('🔧 Initializing Firebase Admin...');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')
    ),
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

console.log('🔧 Initializing Algolia Client...');
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const usersIndex = algoliaClient.initIndex(USERS_INDEX_NAME);

// ============================================
// HELPERS
// ============================================
function transformUser(doc) {
  const data = doc.data();
  return {
    objectID: String(data.numericId || doc.id),
    uid: doc.id,
    numericId: data.numericId || 0,
    displayName: data.displayName || '',
    businessName:
      (data.dealerSnapshot && data.dealerSnapshot.businessName) ||
      (data.companySnapshot && data.companySnapshot.name) ||
      '',
    accountType: data.accountType || data.profileType || 'private',
    avatarUrl: data.photoURL || data.profileImage || '',
    city: (data.location && data.location.city) || data.city || '',
    region: (data.location && data.location.region) || data.region || '',
    description: data.bio || (data.dealerSnapshot && data.dealerSnapshot.description) || '',
    rating: data.rating || 0,
    reviewsCount: data.reviewsCount || (data.stats && data.stats.reviewsReceived) || 0,
    listingsCount: (data.stats && data.stats.totalListings) || data.listingsCount || 0,
    isVerified: !!(
      data.verification &&
      data.verification.email &&
      data.verification.email.verified &&
      data.verification.phone &&
      data.verification.phone.verified
    ),
    isOnline: false,
    lastActiveAt:
      (data.lastActiveAt && data.lastActiveAt._seconds) ||
      (data.updatedAt && data.updatedAt._seconds) ||
      0,
    createdAt: (data.createdAt && data.createdAt._seconds) || 0,
  };
}

function shouldIndex(data) {
  if (data.isBanned === true) return false;
  if (data.isActive === false) return false;
  if (data.isDeleted === true) return false;
  return true;
}

// ============================================
// MAIN SYNC
// ============================================
async function syncAllUsers() {
  console.log('🚀 Starting Algolia Users Sync...');
  console.log('================================\n');

  const startTime = Date.now();
  const snapshot = await db.collection('users').get();
  const records = [];
  let skipped = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!shouldIndex(data)) {
      skipped++;
      return;
    }
    records.push(transformUser(doc));
  });

  console.log(`📝 Found ${snapshot.size} total users`);
  console.log(`   ✅ Indexable: ${records.length}`);
  console.log(`   ⏭️  Skipped (banned/inactive): ${skipped}`);

  if (records.length === 0) {
    console.log('⚠️  No users to index. Exiting.');
    return;
  }

  // Upload in batches of 1000
  const BATCH_SIZE = 1000;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    console.log(`⬆️  Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)} (${batch.length} records)...`);
    await usersIndex.saveObjects(batch);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n================================');
  console.log('📊 USERS SYNC SUMMARY');
  console.log('================================');
  console.log(`✅ Indexed: ${records.length} users`);
  console.log(`⏭️  Skipped: ${skipped} users`);
  console.log(`⏱️  Time: ${elapsed}s`);
  console.log('================================\n');

  // Configure index settings
  console.log('⚙️  Configuring users index settings...');
  try {
    await usersIndex.setSettings({
      searchableAttributes: [
        'displayName',
        'businessName',
        'unordered(description)',
        'unordered(city)',
        'unordered(region)',
      ],
      attributesForFaceting: [
        'filterOnly(accountType)',
        'filterOnly(city)',
        'filterOnly(region)',
        'filterOnly(isVerified)',
        'searchable(displayName)',
        'searchable(businessName)',
      ],
      customRanking: ['desc(rating)', 'desc(listingsCount)', 'desc(lastActiveAt)'],
      typoTolerance: true,
      hitsPerPage: 20,
      distinct: true,
      attributeForDistinct: 'numericId',
    });
    console.log('✅ Index settings configured successfully\n');
  } catch (error) {
    console.error('❌ Error configuring index:', error.message);
  }

  console.log('🎉 Users sync completed successfully!');
}

// ============================================
// RUN
// ============================================
syncAllUsers()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
