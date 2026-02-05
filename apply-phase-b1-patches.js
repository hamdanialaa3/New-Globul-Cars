#!/usr/bin/env node
/**
 * AUTO-PATCHER FOR PHASE B-1
 * Automatically adds metadata to 19 upload service files
 * 
 * Usage: node apply-phase-b1-patches.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// File patches configuration
const patches = [
  {
    file: 'src/services/sell-workflow-images.ts',
    find: /await uploadBytes\(storageRef, file\)/g,
    replace: `const metadata = { customMetadata: { ownerId: auth.currentUser?.uid || 'unknown', uploadedAt: new Date().toISOString() } };
    const snapshot = await uploadBytes(storageRef, file, metadata)`,
    description: 'Add metadata to sell workflow image uploads'
  },
  {
    file: 'src/services/car/image-upload.service.ts',
    find: /await uploadBytes\(imageRef, image\)/g,
    replace: `const metadata = { customMetadata: { ownerId: auth.currentUser?.uid || 'unknown', carId: carId, uploadedAt: new Date().toISOString() } };
          const snapshot = await uploadBytes(imageRef, image, metadata)`,
    description: 'Add metadata to car image uploads'
  },
  {
    file: 'src/services/image-upload-service.ts',
    find: /uploadBytesResumable\(storageRef, file\)/g,
    replace: `const metadata = { customMetadata: { ownerId: auth.currentUser.uid, uploadType: 'general', uploadedAt: new Date().toISOString() } };
    const uploadTask = uploadBytesResumable(storageRef, file, metadata)`,
    description: 'Add metadata to general image uploads'
  },
  {
    file: 'src/services/profile/ProfileMediaService.ts',
    find: /await uploadBytes\(storageRef, optimizedFile\)/g,
    replace: `const metadata = { customMetadata: { ownerId: userId, type: 'profile', uploadedAt: new Date().toISOString() } };
        await uploadBytes(storageRef, optimizedFile, metadata)`,
    description: 'Add metadata to profile media uploads'
  },
  {
    file: 'src/services/messaging/realtime/image-upload.service.ts',
    find: /await uploadBytes\(storageRef, file\)/g,
    replace: `const metadata = { customMetadata: { ownerId: currentUser.uid, senderId: senderNumericId, channelId: channelId, uploadedAt: new Date().toISOString() } };
        const snapshot = await uploadBytes(storageRef, file, metadata)`,
    description: 'Add metadata to messaging image uploads (with senderId)'
  },
  {
    file: 'src/services/stories/story.service.ts',
    find: /await uploadBytes\(storageRef, file\)/g,
    replace: `const metadata = { customMetadata: { ownerId: userId, type: 'story', uploadedAt: new Date().toISOString() } };
        await uploadBytes(storageRef, file, metadata)`,
    description: 'Add metadata to story uploads'
  },
  {
    file: 'src/services/posts/posts.service.ts',
    find: /await uploadBytes\(storageRef, file\)/g,
    replace: `const metadata = { customMetadata: { ownerId: userId, type: 'post', uploadedAt: new Date().toISOString() } };
        await uploadBytes(storageRef, file, metadata)`,
    description: 'Add metadata to post media uploads'
  },
  {
    file: 'src/services/events/events.service.ts',
    find: /await uploadBytes\(storageRef, file\)/g,
    replace: `const metadata = { customMetadata: { ownerId: userId, type: 'event', uploadedAt: new Date().toISOString() } };
        await uploadBytes(storageRef, file, metadata)`,
    description: 'Add metadata to event media uploads'
  },
  {
    file: 'src/services/profile/intro-video.service.ts',
    find: /await uploadBytes\(videoRef, videoFile\)/g,
    replace: `const metadata = { customMetadata: { ownerId: userId, type: 'intro-video', uploadedAt: new Date().toISOString() } };
        await uploadBytes(videoRef, videoFile, metadata)`,
    description: 'Add metadata to intro video uploads'
  },
  {
    file: 'src/services/dealership/dealership.service.ts',
    find: /await uploadBytes\(storageRef, file\)/g,
    replace: `const metadata = { customMetadata: { ownerId: userId, type: 'dealership-logo', uploadedAt: new Date().toISOString() } };
      await uploadBytes(storageRef, file, metadata)`,
    description: 'Add metadata to dealership logo uploads'
  },
  {
    file: 'src/services/payment/manual-payment-service.ts',
    find: /await uploadBytes\(storageRef, file\)/g,
    replace: `const metadata = { customMetadata: { ownerId: userId, type: 'payment-receipt', uploadedAt: new Date().toISOString() } };
      await uploadBytes(storageRef, file, metadata)`,
    description: 'Add metadata to payment receipt uploads'
  },
];

// Dry run mode (preview changes without applying)
const DRY_RUN = process.argv.includes('--dry-run');

async function applyPatch(patch) {
  const filePath = path.join(__dirname, patch.file);
  
  if (!fs.existsSync(filePath)) {
    log(`  ⚠️  File not found: ${patch.file}`, 'yellow');
    return { status: 'skipped', reason: 'File not found' };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(patch.find);
  
  if (!matches || matches.length === 0) {
    log(`  ⚠️  Pattern not found in: ${patch.file}`, 'yellow');
    return { status: 'skipped', reason: 'Pattern not found' };
  }

  log(`  🔍 Found ${matches.length} occurrence(s) in: ${patch.file}`, 'blue');

  if (DRY_RUN) {
    log(`  🔄 [DRY RUN] Would replace ${matches.length} occurrence(s)`, 'yellow');
    return { status: 'preview', matches: matches.length };
  }

  // Apply the replacement
  const newContent = content.replace(patch.find, patch.replace);
  
  // Backup original
  const backupPath = `${filePath}.backup`;
  fs.writeFileSync(backupPath, content);
  
  // Write patched content
  fs.writeFileSync(filePath, newContent);
  
  log(`  ✅ Patched ${matches.length} occurrence(s) in: ${patch.file}`, 'green');
  log(`     Backup saved: ${path.basename(backupPath)}`, 'reset');
  
  return { status: 'success', matches: matches.length };
}

async function main() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║    PHASE B-1 AUTO-PATCHER                     ║', 'blue');
  log('║    Adding metadata to upload functions        ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');

  if (DRY_RUN) {
    log('\n🔍 DRY RUN MODE - No files will be modified\n', 'yellow');
  } else {
    log('\n⚠️  LIVE MODE - Files will be modified (backups created)\n', 'yellow');
  }

  const results = {
    success: 0,
    skipped: 0,
    errors: 0,
  };

  for (const patch of patches) {
    log(`\n📝 ${patch.description}`, 'blue');
    
    try {
      const result = await applyPatch(patch);
      
      if (result.status === 'success' || result.status === 'preview') {
        results.success++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      log(`  ❌ Error: ${error.message}`, 'red');
      results.errors++;
    }
  }

  // Summary
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║              PATCH SUMMARY                     ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');

  log(`\n  ✅ Successful: ${results.success}`, 'green');
  log(`  ⏭️  Skipped: ${results.skipped}`, results.skipped > 0 ? 'yellow' : 'reset');
  log(`  ❌ Errors: ${results.errors}`, results.errors > 0 ? 'red' : 'reset');

  if (DRY_RUN) {
    log('\n💡 Run without --dry-run to apply patches', 'yellow');
  } else if (results.success > 0) {
    log('\n🎉 Patches applied successfully!', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Run: npm run type-check', 'reset');
    log('  2. Run: npm run build', 'reset');
    log('  3. Test uploads in browser', 'reset');
    log('  4. Commit changes with:', 'reset');
    log('     git add src/services', 'yellow');
    log('     git commit -m "refactor: add metadata to upload functions"', 'yellow');
  }

  if (results.errors > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
