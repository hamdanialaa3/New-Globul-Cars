const fs = require('fs-extra');
const path = require('path');

console.log('\n🎯 Complete Restructure Script - 100%\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const PAGES_DIR = path.join(__dirname, '../../src/pages');

// خريطة نقل كاملة ومحكمة
const MIGRATION_MAP = {
  // 10_legal
  '10_legal': [
    { from: 'PrivacyPolicyPage.tsx', to: '10_legal/privacy-policy/PrivacyPolicyPage/index.tsx' },
    { from: 'TermsOfServicePage.tsx', to: '10_legal/terms-of-service/TermsOfServicePage/index.tsx' },
    { from: 'DataDeletionPage.tsx', to: '10_legal/data-deletion/DataDeletionPage/index.tsx' },
    { from: 'CookiePolicyPage.tsx', to: '10_legal/cookie-policy/CookiePolicyPage/index.tsx' },
    { from: 'SitemapPage.tsx', to: '10_legal/sitemap/SitemapPage/index.tsx' },
  ],
  
  // 02_authentication
  '02_authentication': [
    { from: 'LoginPage', to: '02_authentication/login/LoginPage' },
    { from: 'EnhancedLoginPage', to: '02_authentication/login/EnhancedLoginPage' },
    { from: 'RegisterPage', to: '02_authentication/register/RegisterPage' },
    { from: 'EnhancedRegisterPage', to: '02_authentication/register/EnhancedRegisterPage' },
    { from: 'EmailVerificationPage.tsx', to: '02_authentication/verification/EmailVerificationPage/index.tsx' },
    { from: 'OAuthCallback', to: '02_authentication/oauth/OAuthCallbackPage' },
    { from: 'AdminLoginPage.tsx', to: '02_authentication/admin-login/AdminLoginPage/index.tsx' },
    { from: 'SuperAdminLogin.tsx', to: '02_authentication/admin-login/SuperAdminLoginPage/index.tsx' },
  ],
  
  // 01_main-pages
  '01_main-pages': [
    { from: 'HomePage', to: '01_main-pages/home/HomePage' },
    { from: 'AboutPage.tsx', to: '01_main-pages/about/AboutPage/index.tsx' },
    { from: 'ContactPage.tsx', to: '01_main-pages/contact/ContactPage/index.tsx' },
    { from: 'HelpPage.tsx', to: '01_main-pages/help/HelpPage/index.tsx' },
  ],
  
  // 03_user-pages
  '03_user-pages': [
    { from: 'ProfilePage', to: '03_user-pages/profile/ProfilePage' },
    { from: 'UsersDirectoryPage', to: '03_user-pages/users-directory/UsersDirectoryPage' },
    { from: 'MyListingsPage', to: '03_user-pages/my-listings/MyListingsPage' },
    { from: 'SocialFeedPage', to: '03_user-pages/social/SocialFeedPage' },
    { from: 'CreatePostPage.tsx', to: '03_user-pages/social/CreatePostPage/index.tsx' },
    { from: 'AllPostsPage.tsx', to: '03_user-pages/social/AllPostsPage/index.tsx' },
    { from: 'DashboardPage', to: '03_user-pages/dashboard/DashboardPage' },
    { from: 'MessagesPage', to: '03_user-pages/messages/MessagesPage' },
    { from: 'MessagingPage.tsx', to: '03_user-pages/messages/MessagingPage/index.tsx' },
    { from: 'FavoritesPage.tsx', to: '03_user-pages/favorites/FavoritesPage/index.tsx' },
    { from: 'NotificationsPage.tsx', to: '03_user-pages/notifications/NotificationsPage/index.tsx' },
    { from: 'SavedSearchesPage.tsx', to: '03_user-pages/saved-searches/SavedSearchesPage/index.tsx' },
    { from: 'MyDraftsPage.tsx', to: '03_user-pages/my-drafts/MyDraftsPage/index.tsx' },
  ],
  
  // 05_search-browse
  '05_search-browse': [
    { from: 'AdvancedSearchPage', to: '05_search-browse/advanced-search/AdvancedSearchPage' },
    { from: 'AllUsersPage.tsx', to: '05_search-browse/all-users/AllUsersPage/index.tsx' },
    { from: 'AllCarsPage.tsx', to: '05_search-browse/all-cars/AllCarsPage/index.tsx' },
    { from: 'BrandGalleryPage.tsx', to: '05_search-browse/brand-gallery/BrandGalleryPage/index.tsx' },
    { from: 'TopBrandsPage', to: '05_search-browse/top-brands/TopBrandsPage' },
    { from: 'DealersPage.tsx', to: '05_search-browse/dealers/DealersPage/index.tsx' },
    { from: 'FinancePage.tsx', to: '05_search-browse/finance/FinancePage/index.tsx' },
  ],
  
  // 06_admin
  '06_admin': [
    { from: 'AdminPage', to: '06_admin/regular-admin/AdminPage' },
    { from: 'AdminDashboard.tsx', to: '06_admin/regular-admin/AdminDashboard/index.tsx' },
    { from: 'AdminCarManagementPage.tsx', to: '06_admin/regular-admin/AdminCarManagementPage/index.tsx' },
    { from: 'AdminDataFix.tsx', to: '06_admin/regular-admin/AdminDataFix/index.tsx' },
    { from: 'SuperAdminDashboardNew.tsx', to: '06_admin/super-admin/SuperAdminDashboard/index.tsx' },
  ],
};

// App.tsx import updates
const APP_IMPORTS = {
  // Legal
  "./pages/PrivacyPolicyPage": "./pages/10_legal/privacy-policy/PrivacyPolicyPage",
  "./pages/TermsOfServicePage": "./pages/10_legal/terms-of-service/TermsOfServicePage",
  "./pages/DataDeletionPage": "./pages/10_legal/data-deletion/DataDeletionPage",
  "./pages/CookiePolicyPage": "./pages/10_legal/cookie-policy/CookiePolicyPage",
  "./pages/SitemapPage": "./pages/10_legal/sitemap/SitemapPage",
  
  // Auth
  "./pages/LoginPage/LoginPageGlassFixed": "./pages/02_authentication/login/LoginPage/LoginPage/LoginPageGlassFixed",
  "./pages/RegisterPage/RegisterPageGlassFixed": "./pages/02_authentication/register/RegisterPage/RegisterPage/RegisterPageGlassFixed",
  "./pages/EmailVerificationPage": "./pages/02_authentication/verification/EmailVerificationPage",
  "./pages/OAuthCallback": "./pages/02_authentication/oauth/OAuthCallbackPage/OAuthCallback",
  "./pages/AdminLoginPage": "./pages/02_authentication/admin-login/AdminLoginPage",
  "./pages/SuperAdminLogin": "./pages/02_authentication/admin-login/SuperAdminLoginPage",
  
  // Main
  "./pages/HomePage": "./pages/01_main-pages/home/HomePage/HomePage",
  "./pages/AboutPage": "./pages/01_main-pages/about/AboutPage",
  "./pages/ContactPage": "./pages/01_main-pages/contact/ContactPage",
  "./pages/HelpPage": "./pages/01_main-pages/help/HelpPage",
  
  // User
  "./pages/ProfilePage": "./pages/03_user-pages/profile/ProfilePage",
  "./pages/UsersDirectoryPage": "./pages/03_user-pages/users-directory/UsersDirectoryPage",
  "./pages/MyListingsPage": "./pages/03_user-pages/my-listings/MyListingsPage",
  "./pages/SocialFeedPage": "./pages/03_user-pages/social/SocialFeedPage",
  "./pages/CreatePostPage": "./pages/03_user-pages/social/CreatePostPage",
  "./pages/AllPostsPage": "./pages/03_user-pages/social/AllPostsPage",
  "./pages/DashboardPage": "./pages/03_user-pages/dashboard/DashboardPage",
  "./pages/MessagesPage": "./pages/03_user-pages/messages/MessagesPage",
  
  // Search
  "./pages/AdvancedSearchPage": "./pages/05_search-browse/advanced-search/AdvancedSearchPage",
  "./pages/TopBrandsPage": "./pages/05_search-browse/top-brands/TopBrandsPage",
  
  // Admin
  "./pages/AdminPage": "./pages/06_admin/regular-admin/AdminPage",
  "./pages/AdminDashboard": "./pages/06_admin/regular-admin/AdminDashboard",
  "./pages/SuperAdminDashboardNew": "./pages/06_admin/super-admin/SuperAdminDashboard",
};

async function migrateFiles() {
  console.log('📦 Phase 1: Creating directories...\n');
  
  // إنشاء جميع المجلدات المستهدفة
  for (const [section, files] of Object.entries(MIGRATION_MAP)) {
    for (const { to } of files) {
      const targetDir = path.join(PAGES_DIR, path.dirname(to));
      await fs.ensureDir(targetDir);
    }
  }
  
  console.log('✅ Directories created!\n');
  console.log('📦 Phase 2: Moving files...\n');
  
  let moved = 0;
  let skipped = 0;
  
  // نقل الملفات
  for (const [section, files] of Object.entries(MIGRATION_MAP)) {
    console.log(`\n📂 Section: ${section}`);
    
    for (const { from, to } of files) {
      const source = path.join(PAGES_DIR, from);
      const target = path.join(PAGES_DIR, to);
      
      try {
        if (await fs.pathExists(source)) {
          await fs.move(source, target, { overwrite: false });
          console.log(`   ✅ ${from} → ${to}`);
          moved++;
        } else {
          console.log(`   ⏭️  ${from} (not found)`);
          skipped++;
        }
      } catch (error) {
        console.log(`   ❌ ${from}: ${error.message}`);
      }
    }
  }
  
  console.log(`\n📊 Migration: ${moved} moved, ${skipped} skipped\n`);
}

async function updateAppTsx() {
  console.log('📦 Phase 3: Updating App.tsx...\n');
  
  const appFile = path.join(__dirname, '../../src/App.tsx');
  let content = await fs.readFile(appFile, 'utf8');
  let updates = 0;
  
  for (const [old, newPath] of Object.entries(APP_IMPORTS)) {
    const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, newPath);
      updates++;
    }
  }
  
  await fs.writeFile(appFile, content, 'utf8');
  console.log(`✅ App.tsx: ${updates} imports updated\n`);
}

async function fixRelativeImports() {
  console.log('📦 Phase 4: Fixing relative imports...\n');
  
  const sections = [
    '01_main-pages',
    '02_authentication',
    '03_user-pages',
    '05_search-browse',
    '06_admin',
    '10_legal'
  ];
  
  let fixed = 0;
  
  for (const section of sections) {
    const sectionPath = path.join(PAGES_DIR, section);
    if (!await fs.pathExists(sectionPath)) continue;
    
    const files = await fs.readdir(sectionPath, { recursive: true });
    
    for (const file of files) {
      if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
      
      const filePath = path.join(sectionPath, file);
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) continue;
      
      try {
        let content = await fs.readFile(filePath, 'utf8');
        let changed = false;
        
        // إصلاح شامل لجميع relative imports
        const patterns = [
          [/from ['"]\.\.\/hooks\//g, "from '../../../../../hooks/"],
          [/from ['"]\.\.\/\.\.\/hooks\//g, "from '../../../../../hooks/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/hooks\//g, "from '../../../../../hooks/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks\//g, "from '../../../../../hooks/"],
          [/from ['"]\.\.\/contexts\//g, "from '../../../../../contexts/"],
          [/from ['"]\.\.\/\.\.\/contexts\//g, "from '../../../../../contexts/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/contexts\//g, "from '../../../../../contexts/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/contexts\//g, "from '../../../../../contexts/"],
          [/from ['"]\.\.\/firebase\//g, "from '../../../../../firebase/"],
          [/from ['"]\.\.\/\.\.\/firebase\//g, "from '../../../../../firebase/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/firebase\//g, "from '../../../../../firebase/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/firebase\//g, "from '../../../../../firebase/"],
          [/from ['"]\.\.\/services\//g, "from '../../../../../services/"],
          [/from ['"]\.\.\/\.\.\/services\//g, "from '../../../../../services/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/services\//g, "from '../../../../../services/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\//g, "from '../../../../../services/"],
          [/from ['"]\.\.\/utils\//g, "from '../../../../../utils/"],
          [/from ['"]\.\.\/\.\.\/utils\//g, "from '../../../../../utils/"],
        ];
        
        for (const [pattern, replacement] of patterns) {
          if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            changed = true;
          }
        }
        
        if (changed) {
          await fs.writeFile(filePath, content, 'utf8');
          fixed++;
        }
      } catch (error) {
        // Skip
      }
    }
  }
  
  console.log(`✅ Fixed relative imports in ${fixed} files\n`);
}

async function main() {
  try {
    console.log('Starting complete restructure...\n');
    
    // إنشاء المجلدات الرئيسية
    const sections = [
      '01_main-pages', '02_authentication', '03_user-pages',
      '04_car-selling', '05_search-browse', '06_admin',
      '07_advanced-features', '08_payment-billing',
      '09_dealer-company', '10_legal', '11_testing-dev'
    ];
    
    for (const section of sections) {
      await fs.ensureDir(path.join(PAGES_DIR, section));
    }
    
    await migrateFiles();
    await updateAppTsx();
    await fixRelativeImports();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Restructure completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Next steps:');
    console.log('1. Test build: npm run build');
    console.log('2. Test manually: browse key pages');
    console.log('3. Commit: git add . && git commit -m "refactor: complete restructure 100%"');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

