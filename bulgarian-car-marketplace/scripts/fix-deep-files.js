const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix Deep Files - 5 levels → 4 levels\n');

// الملفات التي تستخدم 5 نقاط خطأ
const files = [
  'src/pages/04_car-selling/sell/VehicleData/index.tsx',
  'src/pages/04_car-selling/sell/Pricing/index.tsx',
  'src/pages/04_car-selling/sell/Images/index.tsx',
  'src/pages/04_car-selling/sell/Equipment/UnifiedEquipmentPage.tsx',
  'src/pages/04_car-selling/sell/Equipment/SafetyPage.tsx',
  'src/pages/04_car-selling/sell/Equipment/InfotainmentPage.tsx',
  'src/pages/04_car-selling/sell/Equipment/ExtrasPage.tsx',
  'src/pages/04_car-selling/sell/Equipment/ComfortPage.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts',
  'src/pages/03_user-pages/social/SocialFeedPage/components/RightSidebar.tsx',
  'src/pages/03_user-pages/social/SocialFeedPage/components/LeftSidebar.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/tabs/ProfileOverview.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/tabs/MyAdsTab.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/tabs/CampaignsTab.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/tabs/AnalyticsTab.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/layout/TabNavigation.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/layout/ProfileLayout.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/layout/CompactHeader.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/components/PrivateProfile.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/components/DealerProfile.tsx',
  'src/pages/03_user-pages/profile/ProfilePage/components/CompanyProfile.tsx',
  'src/pages/03_user-pages/dashboard/DashboardPage/hooks/useDashboard.ts',
];

async function fixFile(relPath) {
  try {
    const filePath = path.join(__dirname, '..', relPath);
    if (!await fs.pathExists(filePath)) {
      console.log(`⏭️  ${relPath} (not found)`);
      return false;
    }
    
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // Fix: ../../../../../ → ../../../../
    // هذه الملفات على عمق 4 من src، ليس 5!
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\//g, "from '../../../../");
    
    if (content !== original) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ ${relPath}`);
      return true;
    }
    
    console.log(`⏭️  ${relPath} (no change)`);
    return false;
  } catch (error) {
    console.error(`❌ ${relPath}: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    let fixed = 0;
    
    for (const file of files) {
      const wasFixed = await fixFile(file);
      if (wasFixed) fixed++;
    }
    
    console.log(`\n📊 Total fixed: ${fixed} files\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

