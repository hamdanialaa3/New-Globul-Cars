const fs = require('fs-extra');
const path = require('path');

/**
 * سكريبت النقل الآلي
 * Automated Migration Script
 * 
 * الاستخدام:
 * node RESTRUCTURE_PLANS/02_MIGRATION_SCRIPT.js
 */

const PAGES_DIR = path.join(__dirname, '../src/pages');

// خريطة النقل الكاملة
const MIGRATION_MAP = [
  // 01_core
  { from: 'HomePage.tsx', to: '01_core/HomePage/index.tsx' },
  { from: 'AboutPage.tsx', to: '01_core/AboutPage/index.tsx' },
  { from: 'ContactPage.tsx', to: '01_core/ContactPage/index.tsx' },
  { from: 'TermsPage.tsx', to: '01_core/TermsPage/index.tsx' },
  { from: 'PrivacyPage.tsx', to: '01_core/PrivacyPage/index.tsx' },
  { from: 'NotFoundPage.tsx', to: '01_core/NotFoundPage/index.tsx' },

  // 02_auth
  { from: 'LoginPage.tsx', to: '02_auth/LoginPage/index.tsx' },
  { from: 'RegisterPage.tsx', to: '02_auth/RegisterPage/index.tsx' },
  { from: 'ForgotPasswordPage.tsx', to: '02_auth/ForgotPasswordPage/index.tsx' },
  { from: 'ResetPasswordPage.tsx', to: '02_auth/ResetPasswordPage/index.tsx' },
  { from: 'OAuthCallback.tsx', to: '02_auth/OAuthCallback/index.tsx' },

  // 03_marketplace
  { from: 'SearchPage.tsx', to: '03_marketplace/SearchPage/index.tsx' },
  { from: 'CategoryPage.tsx', to: '03_marketplace/CategoryPage/index.tsx' },
  { from: 'CarDetailsPage.tsx', to: '03_marketplace/CarDetailsPage/index.tsx' },
  { from: 'ComparisonPage.tsx', to: '03_marketplace/ComparisonPage/index.tsx' },

  // 04_sell/_workflow
  { from: 'VehicleStartPageNew', to: '04_sell/_workflow/VehicleStartPageNew' },
  { from: 'SellerTypePageNew', to: '04_sell/_workflow/SellerTypePageNew' },
  { from: 'VehicleData', to: '04_sell/_workflow/VehicleData' },
  { from: 'EquipmentMainPage', to: '04_sell/_workflow/equipment/EquipmentMainPage' },
  { from: 'SafetyPage', to: '04_sell/_workflow/equipment/SafetyPage' },
  { from: 'ComfortPage', to: '04_sell/_workflow/equipment/ComfortPage' },
  { from: 'InfotainmentPage', to: '04_sell/_workflow/equipment/InfotainmentPage' },
  { from: 'ExtrasPage', to: '04_sell/_workflow/equipment/ExtrasPage' },
  { from: 'UnifiedEquipmentPage', to: '04_sell/_workflow/equipment/UnifiedEquipmentPage' },
  { from: 'ImagesPage', to: '04_sell/_workflow/ImagesPage' },
  { from: 'PricingPage', to: '04_sell/_workflow/PricingPage' },
  { from: 'ContactNamePage', to: '04_sell/_workflow/contact/ContactNamePage' },
  { from: 'ContactAddressPage', to: '04_sell/_workflow/contact/ContactAddressPage' },
  { from: 'ContactPhonePage', to: '04_sell/_workflow/contact/ContactPhonePage' },
  { from: 'UnifiedContactPage', to: '04_sell/_workflow/contact/UnifiedContactPage' },

  // 04_sell/_mobile
  // ========================================
  // 04_sell/_mobile - Mobile Variants
  // ========================================
  // الصفحات الرئيسية
  { from: 'MobileVehicleStartPageNew', to: '04_sell/_mobile/MobileVehicleStartPageNew', category: 'sell-mobile' },
  { from: 'MobileSellerTypePageNew', to: '04_sell/_mobile/MobileSellerTypePageNew', category: 'sell-mobile' },
  { from: 'MobileVehicleData', to: '04_sell/_mobile/MobileVehicleData', category: 'sell-mobile' },
  { from: 'MobileImagesPage', to: '04_sell/_mobile/MobileImagesPage', category: 'sell-mobile' },
  { from: 'MobilePricingPage', to: '04_sell/_mobile/MobilePricingPage', category: 'sell-mobile' },

  // Mobile Equipment Group
  { from: 'MobileEquipmentMainPage', to: '04_sell/_mobile/equipment/MobileEquipmentMainPage', category: 'sell-mobile' },
  { from: 'MobileSafetyPage', to: '04_sell/_mobile/equipment/MobileSafetyPage', category: 'sell-mobile' },
  { from: 'MobileComfortPage', to: '04_sell/_mobile/equipment/MobileComfortPage', category: 'sell-mobile' },
  { from: 'MobileInfotainmentPage', to: '04_sell/_mobile/equipment/MobileInfotainmentPage', category: 'sell-mobile' },
  { from: 'MobileExtrasPage', to: '04_sell/_mobile/equipment/MobileExtrasPage', category: 'sell-mobile' },
  { from: 'MobileUnifiedEquipmentPage', to: '04_sell/_mobile/equipment/MobileUnifiedEquipmentPage', category: 'sell-mobile' },

  // Mobile Contact Group
  { from: 'MobileContactNamePage', to: '04_sell/_mobile/contact/MobileContactNamePage', category: 'sell-mobile' },
  { from: 'MobileContactAddressPage', to: '04_sell/_mobile/contact/MobileContactAddressPage', category: 'sell-mobile' },
  { from: 'MobileContactPhonePage', to: '04_sell/_mobile/contact/MobileContactPhonePage', category: 'sell-mobile' },
  { from: 'MobileUnifiedContactPage', to: '04_sell/_mobile/contact/MobileUnifiedContactPage', category: 'sell-mobile' },

  // ========================================
  // 04_sell/_legacy - Legacy Folder
  // ========================================
  { from: 'sell', to: '04_sell/_legacy/sell', category: 'sell-legacy' },

  // ========================================
  // 05_profile - Profile System
  // ========================================
  { from: 'EditProfilePage.tsx', to: '05_profile/EditProfilePage/index.tsx', category: 'profile' },
  { from: 'MyListingsPage.tsx', to: '05_profile/MyListingsPage/index.tsx', category: 'profile' },
  { from: 'SavedCarsPage.tsx', to: '05_profile/SavedCarsPage/index.tsx', category: 'profile' },
  { from: 'PrivateProfilePage.tsx', to: '05_profile/PrivateProfilePage/index.tsx', category: 'profile' },

  // ========================================
  // 06_user_services - User Services
  // ========================================
  { from: 'MessagingPage', to: '06_user_services/messaging/MessagingPage', category: 'user-services' },
  { from: 'ConversationPage', to: '06_user_services/messaging/ConversationPage', category: 'user-services' },
  { from: 'NotificationsPage', to: '06_user_services/notifications/NotificationsPage', category: 'user-services' },
  { from: 'FavoritesPage', to: '06_user_services/favorites/FavoritesPage', category: 'user-services' },
  { from: 'SettingsPage', to: '06_user_services/settings/SettingsPage', category: 'user-services' },

  // ========================================
  // 07_business - Business Pages
  // ========================================
  { from: 'DealerDashboard', to: '07_business/dealer/DealerDashboard', category: 'business' },
  { from: 'DealerInventory', to: '07_business/dealer/DealerInventory', category: 'business' },
  { from: 'DealerAnalytics', to: '07_business/dealer/DealerAnalytics', category: 'business' },
  { from: 'CompanyDashboard', to: '07_business/company/CompanyDashboard', category: 'business' },

  // ========================================
  // 09_admin - Admin Panel
  // ========================================
  { from: 'AdminDashboard', to: '09_admin/AdminDashboard', category: 'admin' },
  { from: 'UserManagement', to: '09_admin/UserManagement', category: 'admin' },
  { from: 'ListingModeration', to: '09_admin/ListingModeration', category: 'admin' },
  { from: 'SystemSettings', to: '09_admin/SystemSettings', category: 'admin' },

  // ========================================
  // 10_integration - Integration Pages
  // ========================================
  { from: 'FacebookIntegration', to: '10_integration/FacebookIntegration', category: 'integration' },
  { from: 'TikTokIntegration', to: '10_integration/TikTokIntegration', category: 'integration' },
  { from: 'APIDocumentation', to: '10_integration/APIDocumentation', category: 'integration' },
];

/**
 * نقل ملف أو مجلد بأمان
 */
async function migrateItem(from, to, category) {
  const sourcePath = path.join(PAGES_DIR, from);
  const destPath = path.join(PAGES_DIR, to);

  // Dry-run mode
  if (DRY_RUN) {
    const exists = await fs.pathExists(sourcePath);
    console.log(`[DRY-RUN] ${exists ? '✅' : '⏭️ '} ${from} → ${to}`);
    return exists;
  }

  try {
    // التحقق من وجود المصدر
    if (!await fs.pathExists(sourcePath)) {
      console.log(`⏭️  تخطي (غير موجود): ${from}`);
      return false;
    }

    // إنشاء المجلد الهدف
    await fs.ensureDir(path.dirname(destPath));

    // نقل الملف/المجلد
    await fs.move(sourcePath, destPath, { overwrite: false });

    console.log(`✅ [${category}] ${from} → ${to}`);
    return true;

  } catch (error) {
    console.error(`❌ [${category}] فشل: ${from}`, error.message);
    return false;
  }
}

/**
 * تنفيذ النقل حسب الفئة
 */
async function migrateByCategory() {
  console.log(DRY_RUN ? '🧪 وضع المحاكاة (DRY-RUN)\n' : '🚀 بدء النقل الفعلي\n');

  const stats = {
    core: { success: 0, skip: 0, error: 0 },
    auth: { success: 0, skip: 0, error: 0 },
    marketplace: { success: 0, skip: 0, error: 0 },
    'sell-desktop': { success: 0, skip: 0, error: 0 },
    'sell-mobile': { success: 0, skip: 0, error: 0 },
    'sell-legacy': { success: 0, skip: 0, error: 0 },
    profile: { success: 0, skip: 0, error: 0 },
    'user-services': { success: 0, skip: 0, error: 0 },
    business: { success: 0, skip: 0, error: 0 },
    admin: { success: 0, skip: 0, error: 0 },
    integration: { success: 0, skip: 0, error: 0 },
  };

  // تنفيذ النقل
  for (const { from, to, category } of MIGRATION_MAP) {
    const result = await migrateItem(from, to, category);
    
    if
