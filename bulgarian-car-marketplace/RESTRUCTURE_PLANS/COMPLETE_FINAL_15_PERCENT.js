/**
 * Complete Final 15% - Move Remaining Files to Organized Folders
 * Date: November 5, 2025
 * Status: Execute to reach 100% completion
 */

const fs = require('fs-extra');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../src/pages');

// Mapping of remaining files to their destination folders
const remainingFileMappings = [
  // 01_main-pages (Core pages)
  { from: 'HomePage.tsx', to: '01_main-pages/HomePage.tsx' },
  { from: 'CarsPage.tsx', to: '01_main-pages/CarsPage.tsx' },
  { from: 'CarDetailsPage.tsx', to: '01_main-pages/CarDetailsPage.tsx' },
  
  // 02_authentication (already exists, check if complete)
  
  // 03_user-pages (User-related)
  { from: 'ProfilePage.tsx', to: '03_user-pages/ProfilePage.tsx' },
  { from: 'MessagesPage.tsx', to: '03_user-pages/MessagesPage.tsx' },
  { from: 'MyListingsPage.tsx', to: '03_user-pages/MyListingsPage.tsx' },
  { from: 'UsersDirectoryPage.tsx', to: '03_user-pages/UsersDirectoryPage.tsx' },
  
  // 04_car-selling (Selling workflow)
  { from: 'SellPage.tsx', to: '04_car-selling/SellPage.tsx' },
  { from: 'SellPageNew.tsx', to: '04_car-selling/SellPageNew.tsx' },
  { from: 'EditCarPage.tsx', to: '04_car-selling/EditCarPage.tsx' },
  // Move entire sell/ folder
  { from: 'sell/', to: '04_car-selling/sell/', isDirectory: true },
  
  // 05_search-browse (already exists, verify)
  
  // 06_admin (Admin pages)
  { from: 'AdminPage.tsx', to: '06_admin/AdminPage.tsx' },
  { from: 'DebugCarsPage.tsx', to: '06_admin/DebugCarsPage.tsx' },
  { from: 'MigrationPage.tsx', to: '06_admin/MigrationPage.tsx' },
  
  // 07_advanced-features (Advanced functionality)
  { from: 'DigitalTwinPage.tsx', to: '07_advanced-features/DigitalTwinPage.tsx' },
  { from: 'B2BAnalyticsPortal.tsx', to: '07_advanced-features/B2BAnalyticsPortal.tsx' },
  { from: 'EventsPage.tsx', to: '07_advanced-features/EventsPage.tsx' },
  { from: 'EventsPage.css', to: '07_advanced-features/EventsPage.css' },
  { from: 'EventsPage/', to: '07_advanced-features/EventsPage/', isDirectory: true },
  
  // 08_payment-billing (Payment/Billing)
  { from: 'CheckoutPage.tsx', to: '08_payment-billing/CheckoutPage.tsx' },
  { from: 'PaymentSuccessPage.tsx', to: '08_payment-billing/PaymentSuccessPage.tsx' },
  { from: 'SubscriptionPage.tsx', to: '08_payment-billing/SubscriptionPage.tsx' },
  { from: 'InvoicesPage.tsx', to: '08_payment-billing/InvoicesPage.tsx' },
  { from: 'CommissionsPage.tsx', to: '08_payment-billing/CommissionsPage.tsx' },
  { from: 'BillingSuccessPage/', to: '08_payment-billing/BillingSuccessPage/', isDirectory: true },
  { from: 'BillingCanceledPage/', to: '08_payment-billing/BillingCanceledPage/', isDirectory: true },
  
  // 09_dealer-company (Dealer/Company specific)
  { from: 'DealerDashboardPage.tsx', to: '09_dealer-company/DealerDashboardPage.tsx' },
  { from: 'DealerRegistrationPage.tsx', to: '09_dealer-company/DealerRegistrationPage.tsx' },
  { from: 'DealerPublicPage/', to: '09_dealer-company/DealerPublicPage/', isDirectory: true },
  
  // 11_testing-dev (Testing/Development)
  { from: 'IconShowcasePage.tsx', to: '11_testing-dev/IconShowcasePage.tsx' },
  { from: 'TestDropdownsPage.tsx', to: '11_testing-dev/TestDropdownsPage.tsx' },
  { from: 'N8nTestPage.tsx', to: '11_testing-dev/N8nTestPage.tsx' },
];

async function moveRemainingFiles(dryRun = false) {
  console.log('🚀 Starting Final 15% Migration...\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'ACTUAL MOVE'}\n`);
  
  let movedCount = 0;
  let skippedCount = 0;
  let errors = [];

  for (const mapping of remainingFileMappings) {
    const sourcePath = path.join(PAGES_DIR, mapping.from);
    const destPath = path.join(PAGES_DIR, mapping.to);
    
    try {
      // Check if source exists
      if (!await fs.pathExists(sourcePath)) {
        console.log(`⏭️  SKIP: ${mapping.from} (already moved or doesn't exist)`);
        skippedCount++;
        continue;
      }
      
      // Check if destination already exists
      if (await fs.pathExists(destPath)) {
        console.log(`⚠️  EXISTS: ${mapping.to} (destination already exists)`);
        skippedCount++;
        continue;
      }
      
      if (dryRun) {
        console.log(`📋 WOULD MOVE: ${mapping.from} → ${mapping.to}`);
        movedCount++;
      } else {
        // Ensure destination directory exists
        await fs.ensureDir(path.dirname(destPath));
        
        // Move file/directory
        await fs.move(sourcePath, destPath);
        console.log(`✅ MOVED: ${mapping.from} → ${mapping.to}`);
        movedCount++;
      }
    } catch (error) {
      const errorMsg = `❌ ERROR moving ${mapping.from}: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Files moved: ${movedCount}`);
  console.log(`⏭️  Files skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS ENCOUNTERED:');
    errors.forEach(err => console.log(err));
  }
  
  if (!dryRun && movedCount > 0) {
    console.log('\n✨ Final 15% migration complete!');
    console.log('📝 Next steps:');
    console.log('   1. Update App.tsx imports');
    console.log('   2. Run build test: npm run build');
    console.log('   3. Commit changes with: git add . && git commit -m "refactor: complete pages restructure to 100%"');
  }
  
  return { movedCount, skippedCount, errors };
}

// Execute
const dryRun = process.argv.includes('--dry-run');
moveRemainingFiles(dryRun)
  .then(result => {
    process.exit(result.errors.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
