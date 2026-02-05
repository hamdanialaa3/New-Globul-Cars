/**
 * PHASE A - VALIDATION TESTS
 * Run after: firebase deploy --only firestore:indexes,storage:rules,database
 * 
 * Usage: node test-phase-a-validation.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, limit, getDocs } = require('firebase/firestore');
const { getStorage, ref, uploadBytes } = require('firebase/storage');
const { getDatabase, ref: dbRef, set, get } = require('firebase/database');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Import your Firebase config
const firebaseConfig = {
  // TODO: Replace with your actual config from firebase-config.ts
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================
// TEST 1: Firestore Composite Indexes
// ============================================
async function testFirestoreIndexes() {
  log('\n📊 TEST 1: Firestore Composite Indexes', 'blue');
  log('Testing if composite index queries execute without errors...', 'yellow');

  const tests = [
    {
      name: 'Posts (status + visibility + createdAt)',
      query: query(
        collection(db, 'posts'),
        where('status', '==', 'active'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(5)
      ),
    },
    {
      name: 'Stories (status + expiresAt)',
      query: query(
        collection(db, 'stories'),
        where('status', '==', 'active'),
        orderBy('expiresAt', 'asc'),
        limit(5)
      ),
    },
    {
      name: 'Cars (status + createdAt)',
      query: query(
        collection(db, 'passenger_cars'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(5)
      ),
    },
    {
      name: 'Notifications (userId + createdAt)',
      query: query(
        collection(db, 'notifications'),
        where('userId', '==', 'test_user_123'), // Replace with actual user ID
        orderBy('createdAt', 'desc'),
        limit(5)
      ),
    },
  ];

  let passCount = 0;
  let failCount = 0;

  for (const test of tests) {
    try {
      const startTime = Date.now();
      const snapshot = await getDocs(test.query);
      const duration = Date.now() - startTime;

      log(`  ✅ ${test.name}: ${snapshot.size} docs in ${duration}ms`, 'green');
      passCount++;
    } catch (error) {
      if (error.message.includes('index')) {
        log(`  ❌ ${test.name}: Missing index!`, 'red');
        log(`     Error: ${error.message}`, 'red');
      } else {
        log(`  ⚠️  ${test.name}: ${error.message}`, 'yellow');
      }
      failCount++;
    }
  }

  log(`\n  Summary: ${passCount} passed, ${failCount} failed`, passCount === tests.length ? 'green' : 'red');
  return failCount === 0;
}

// ============================================
// TEST 2: Storage Rules - Reject without metadata
// ============================================
async function testStorageReject() {
  log('\n🚫 TEST 2: Storage Rules - Reject without metadata', 'blue');
  log('Uploading file WITHOUT customMetadata.ownerId (should FAIL)...', 'yellow');

  try {
    // Must be authenticated first
    if (!auth.currentUser) {
      log('  ⚠️  Please sign in first to run this test', 'yellow');
      return false;
    }

    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const storageRef = ref(storage, `car-images/test-car-123/test-${Date.now()}.txt`);

    // Upload WITHOUT metadata (should fail)
    await uploadBytes(storageRef, testFile);

    log('  ❌ UNEXPECTED: Upload succeeded (rules NOT enforced!)', 'red');
    return false;
  } catch (error) {
    if (error.code === 'storage/unauthorized' || error.message.includes('metadata')) {
      log('  ✅ CORRECT: Upload rejected (rules enforced)', 'green');
      log(`     Error: ${error.message}`, 'green');
      return true;
    } else {
      log(`  ⚠️  Unexpected error: ${error.message}`, 'yellow');
      return false;
    }
  }
}

// ============================================
// TEST 3: Storage Rules - Accept with metadata
// ============================================
async function testStorageAccept() {
  log('\n✅ TEST 3: Storage Rules - Accept with metadata', 'blue');
  log('Uploading file WITH customMetadata.ownerId (should SUCCEED)...', 'yellow');

  try {
    if (!auth.currentUser) {
      log('  ⚠️  Please sign in first to run this test', 'yellow');
      return false;
    }

    const testFile = new Blob(['test content with metadata'], { type: 'text/plain' });
    const storageRef = ref(storage, `car-images/test-car-456/test-${Date.now()}.txt`);

    // Upload WITH metadata (should succeed)
    const metadata = {
      customMetadata: {
        ownerId: auth.currentUser.uid,
        uploadedAt: new Date().toISOString(),
      },
    };

    await uploadBytes(storageRef, testFile, metadata);

    log('  ✅ SUCCESS: Upload accepted with metadata', 'green');
    return true;
  } catch (error) {
    log(`  ❌ UNEXPECTED: Upload failed: ${error.message}`, 'red');
    return false;
  }
}

// ============================================
// TEST 4: Realtime Database Rules
// ============================================
async function testRTDBRules() {
  log('\n💬 TEST 4: Realtime Database Rules', 'blue');
  log('Testing RTDB participant-based access control...', 'yellow');

  try {
    if (!auth.currentUser) {
      log('  ⚠️  Please sign in first to run this test', 'yellow');
      return false;
    }

    const testChannelId = `test-channel-${Date.now()}`;
    const userNumericId = 12345; // Replace with actual numeric ID from your system

    // Test 1: Write to user_channels (should succeed for own user)
    const userChannelRef = dbRef(rtdb, `user_channels/${userNumericId}/${testChannelId}`);
    await set(userChannelRef, { lastRead: Date.now() });
    log('  ✅ Write to user_channels: SUCCESS', 'green');

    // Test 2: Read from user_channels (should succeed)
    const snapshot = await get(userChannelRef);
    if (snapshot.exists()) {
      log('  ✅ Read from user_channels: SUCCESS', 'green');
    } else {
      log('  ⚠️  Read returned empty (but no permission error)', 'yellow');
    }

    // Test 3: Try to write to another user's channel (should fail)
    const otherUserChannelRef = dbRef(rtdb, `user_channels/99999/${testChannelId}`);
    try {
      await set(otherUserChannelRef, { hacked: true });
      log('  ❌ SECURITY ISSUE: Can write to other users channels!', 'red');
      return false;
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        log('  ✅ Cannot write to other users: CORRECT', 'green');
      } else {
        log(`  ⚠️  Unexpected error: ${error.message}`, 'yellow');
      }
    }

    return true;
  } catch (error) {
    log(`  ❌ RTDB Test failed: ${error.message}`, 'red');
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  log('╔════════════════════════════════════════════════╗', 'blue');
  log('║   PHASE A - DEPLOYMENT VALIDATION TESTS       ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');

  // Check if user is signed in
  log('\n🔐 Checking authentication...', 'yellow');
  if (!auth.currentUser) {
    log('⚠️  Not signed in. Sign in first:', 'yellow');
    log('   Use: await signInWithEmailAndPassword(auth, email, password)', 'yellow');
    log('   Or run this in browser console while logged in.', 'yellow');
    log('\nSkipping Storage and RTDB tests (require auth).\n', 'yellow');
  }

  const results = {
    indexes: await testFirestoreIndexes(),
    storageReject: auth.currentUser ? await testStorageReject() : null,
    storageAccept: auth.currentUser ? await testStorageAccept() : null,
    rtdb: auth.currentUser ? await testRTDBRules() : null,
  };

  // Summary
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║              TEST SUMMARY                      ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');

  const passed = Object.values(results).filter((r) => r === true).length;
  const failed = Object.values(results).filter((r) => r === false).length;
  const skipped = Object.values(results).filter((r) => r === null).length;

  log(`\n  ✅ Passed: ${passed}`, 'green');
  log(`  ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  log(`  ⏭️  Skipped: ${skipped}`, skipped > 0 ? 'yellow' : 'reset');

  if (failed === 0 && skipped === 0) {
    log('\n🎉 ALL TESTS PASSED - PHASE A DEPLOYMENT SUCCESSFUL!', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Read PR_READY_PATCHES_PHASE_B.md', 'reset');
    log('  2. Apply 19 upload service patches', 'reset');
    log('  3. Migrate 8 listener files', 'reset');
  } else if (failed > 0) {
    log('\n⚠️  SOME TESTS FAILED - CHECK DEPLOYMENT', 'red');
    log('\nTroubleshooting:', 'yellow');
    log('  • Indexes failing? Wait 5-10 minutes and retry.', 'reset');
    log('  • Storage failing? Check storage.rules deployed correctly.', 'reset');
    log('  • RTDB failing? Check database.rules.json deployed.', 'reset');
  } else {
    log('\n⚠️  TESTS SKIPPED (need authentication)', 'yellow');
    log('\nRun this in browser console while logged in for full validation.', 'reset');
  }
}

// Run tests
runAllTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
