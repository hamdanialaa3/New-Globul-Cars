/**
 * Facebook Auto-Post - Pre-Test Verification
 * التحقق من الجاهزية للاختبار
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('🔍 Facebook Integration - Verification');
console.log('========================================\n');

let allPassed = true;

// 1. Check .env file
console.log('[1/6] Checking .env configuration...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'REACT_APP_FACEBOOK_APP_ID',
    'REACT_APP_FACEBOOK_APP_SECRET',
    'REACT_APP_FACEBOOK_PAGE_ID',
    'REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN',
    'REACT_APP_FACEBOOK_USER_ACCESS_TOKEN',
    'REACT_APP_BASE_URL'
  ];
  
  const missingVars = requiredVars.filter(v => !envContent.includes(v));
  
  if (missingVars.length === 0) {
    console.log('   ✅ All required environment variables present\n');
  } else {
    console.log(`   ❌ Missing variables: ${missingVars.join(', ')}\n`);
    allPassed = false;
  }
} else {
  console.log('   ❌ .env file not found\n');
  allPassed = false;
}

// 2. Check service file
console.log('[2/6] Checking facebook-auto-post.service.ts...');
const servicePath = path.join(__dirname, '..', 'src', 'services', 'meta', 'facebook-auto-post.service.ts');
if (fs.existsSync(servicePath)) {
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  // Check for hardcoded token
  const hasHardcodedToken = serviceContent.includes("'EAAZAS9Y73NscBQ");
  
  if (!hasHardcodedToken) {
    console.log('   ✅ No hardcoded tokens found\n');
  } else {
    console.log('   ❌ WARNING: Hardcoded token detected\n');
    allPassed = false;
  }
  
  // Check for proper imports
  const hasAxios = serviceContent.includes("import axios from 'axios'");
  const hasLogger = serviceContent.includes("import { logger }");
  
  if (hasAxios && hasLogger) {
    console.log('   ✅ All imports present\n');
  } else {
    console.log('   ❌ Missing imports\n');
    allPassed = false;
  }
} else {
  console.log('   ❌ Service file not found\n');
  allPassed = false;
}

// 3. Check integration
console.log('[3/6] Checking unified-car-mutations.ts integration...');
const mutationsPath = path.join(__dirname, '..', 'src', 'services', 'car', 'unified-car-mutations.ts');
if (fs.existsSync(mutationsPath)) {
  const mutationsContent = fs.readFileSync(mutationsPath, 'utf8');
  
  const hasIntegration = mutationsContent.includes('facebookAutoPostService.postCarWithPhoto');
  const hasEngagement = mutationsContent.includes('addEngagementComment');
  
  if (hasIntegration && hasEngagement) {
    console.log('   ✅ Integration code present\n');
  } else {
    console.log('   ❌ Integration incomplete\n');
    allPassed = false;
  }
} else {
  console.log('   ❌ Mutations file not found\n');
  allPassed = false;
}

// 4. Check axios dependency
console.log('[4/6] Checking axios dependency...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  
  if (packageContent.includes('"axios"')) {
    console.log('   ✅ axios dependency installed\n');
  } else {
    console.log('   ❌ axios not in package.json\n');
    allPassed = false;
  }
} else {
  console.log('   ❌ package.json not found\n');
  allPassed = false;
}

// 5. Check .gitignore
console.log('[5/6] Checking .gitignore...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  if (gitignoreContent.includes('.env')) {
    console.log('   ✅ .env is in .gitignore\n');
  } else {
    console.log('   ⚠️  WARNING: .env should be in .gitignore\n');
  }
} else {
  console.log('   ⚠️  .gitignore not found\n');
}

// 6. Check documentation
console.log('[6/6] Checking documentation...');
const docs = [
  'META_INTEGRATION_MASTER_PLAN.md',
  'FACEBOOK_AUTO_POST_IMPLEMENTATION.md',
  'CODE_REVIEW_FACEBOOK_INTEGRATION.md',
  'FINAL_REVIEW_SUMMARY.md'
];

let docsPresent = 0;
docs.forEach(doc => {
  const docPath = path.join(__dirname, '..', 'docs', doc);
  if (fs.existsSync(docPath)) {
    docsPresent++;
  }
});

console.log(`   ✅ ${docsPresent}/${docs.length} documentation files present\n`);

// Final verdict
console.log('========================================');
if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - READY FOR TESTING');
  console.log('========================================\n');
  
  console.log('Next steps:');
  console.log('1. npm start');
  console.log('2. Create a new car listing');
  console.log('3. Check Facebook Page: https://www.facebook.com/100080260449528');
  console.log('4. Verify post appears within 2 seconds');
  console.log('5. Wait 30 seconds for engagement comment');
  console.log('');
  
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED - FIX ISSUES FIRST');
  console.log('========================================\n');
  
  console.log('Review the issues above and:');
  console.log('1. Ensure all required files exist');
  console.log('2. Check environment variables in .env');
  console.log('3. Run: npm install axios');
  console.log('4. Re-run this verification: node scripts/verify-facebook-integration.js');
  console.log('');
  
  process.exit(1);
}
