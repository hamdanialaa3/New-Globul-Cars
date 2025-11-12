const fs = require('fs');
const path = require('path');

const APP_FILE = path.join(__dirname, '../src/App.tsx');

const IMPORT_UPDATES = {
  // Core
  `import('./pages/HomePage')`: `import('./pages/01_core/HomePage')`,
  `import('./pages/AboutPage')`: `import('./pages/01_core/AboutPage')`,
  `import('./pages/ContactPage')`: `import('./pages/01_core/ContactPage')`,
  `import('./pages/TermsPage')`: `import('./pages/01_core/TermsPage')`,
  `import('./pages/PrivacyPage')`: `import('./pages/01_core/PrivacyPage')`,
  `import('./pages/NotFoundPage')`: `import('./pages/01_core/NotFoundPage')`,
  
  // Auth
  `import('./pages/LoginPage')`: `import('./pages/02_auth/LoginPage')`,
  `import('./pages/RegisterPage')`: `import('./pages/02_auth/RegisterPage')`,
  `import('./pages/ForgotPasswordPage')`: `import('./pages/02_auth/ForgotPasswordPage')`,
  `import('./pages/ResetPasswordPage')`: `import('./pages/02_auth/ResetPasswordPage')`,
  `import('./pages/OAuthCallback')`: `import('./pages/02_auth/OAuthCallback')`,
  
  // Marketplace
  `import('./pages/SearchPage')`: `import('./pages/03_marketplace/SearchPage')`,
  `import('./pages/CategoryPage')`: `import('./pages/03_marketplace/CategoryPage')`,
  `import('./pages/CarDetailsPage')`: `import('./pages/03_marketplace/CarDetailsPage')`,
  
  // Sell - Desktop Workflow
  `import('./pages/VehicleStartPageNew')`: `import('./pages/04_sell/_workflow/VehicleStartPageNew')`,
  `import('./pages/SellerTypePageNew')`: `import('./pages/04_sell/_workflow/SellerTypePageNew')`,
  `import('./pages/VehicleData')`: `import('./pages/04_sell/_workflow/VehicleData')`,
  `import('./pages/EquipmentMainPage')`: `import('./pages/04_sell/_workflow/equipment/EquipmentMainPage')`,
  `import('./pages/SafetyPage')`: `import('./pages/04_sell/_workflow/equipment/SafetyPage')`,
  `import('./pages/ComfortPage')`: `import('./pages/04_sell/_workflow/equipment/ComfortPage')`,
  `import('./pages/InfotainmentPage')`: `import('./pages/04_sell/_workflow/equipment/InfotainmentPage')`,
  `import('./pages/ExtrasPage')`: `import('./pages/04_sell/_workflow/equipment/ExtrasPage')`,
  `import('./pages/UnifiedEquipmentPage')`: `import('./pages/04_sell/_workflow/equipment/UnifiedEquipmentPage')`,
  `import('./pages/ImagesPage')`: `import('./pages/04_sell/_workflow/ImagesPage')`,
  `import('./pages/PricingPage')`: `import('./pages/04_sell/_workflow/PricingPage')`,
  `import('./pages/ContactNamePage')`: `import('./pages/04_sell/_workflow/contact/ContactNamePage')`,
  `import('./pages/ContactAddressPage')`: `import('./pages/04_sell/_workflow/contact/ContactAddressPage')`,
  `import('./pages/ContactPhonePage')`: `import('./pages/04_sell/_workflow/contact/ContactPhonePage')`,
  `import('./pages/UnifiedContactPage')`: `import('./pages/04_sell/_workflow/contact/UnifiedContactPage')`,
  
  // Sell - Mobile Variants
  `import('./pages/MobileVehicleStartPageNew')`: `import('./pages/04_sell/_mobile/MobileVehicleStartPageNew')`,
  `import('./pages/MobileSellerTypePageNew')`: `import('./pages/04_sell/_mobile/MobileSellerTypePageNew')`,
  `import('./pages/MobileVehicleData')`: `import('./pages/04_sell/_mobile/MobileVehicleData')`,
  `import('./pages/MobileEquipmentMainPage')`: `import('./pages/04_sell/_mobile/equipment/MobileEquipmentMainPage')`,
  `import('./pages/MobileSafetyPage')`: `import('./pages/04_sell/_mobile/equipment/MobileSafetyPage')`,
  `import('./pages/MobileComfortPage')`: `import('./pages/04_sell/_mobile/equipment/MobileComfortPage')`,
  `import('./pages/MobileInfotainmentPage')`: `import('./pages/04_sell/_mobile/equipment/MobileInfotainmentPage')`,
  `import('./pages/MobileExtrasPage')`: `import('./pages/04_sell/_mobile/equipment/MobileExtrasPage')`,
  `import('./pages/MobileUnifiedEquipmentPage')`: `import('./pages/04_sell/_mobile/equipment/MobileUnifiedEquipmentPage')`,
  `import('./pages/MobileImagesPage')`: `import('./pages/04_sell/_mobile/MobileImagesPage')`,
  `import('./pages/MobilePricingPage')`: `import('./pages/04_sell/_mobile/MobilePricingPage')`,
  `import('./pages/MobileContactNamePage')`: `import('./pages/04_sell/_mobile/contact/MobileContactNamePage')`,
  `import('./pages/MobileContactAddressPage')`: `import('./pages/04_sell/_mobile/contact/MobileContactAddressPage')`,
  `import('./pages/MobileContactPhonePage')`: `import('./pages/04_sell/_mobile/contact/MobileContactPhonePage')`,
  `import('./pages/MobileUnifiedContactPage')`: `import('./pages/04_sell/_mobile/contact/MobileUnifiedContactPage')`,
  
  // Profile
  `import('./pages/ProfilePage')`: `import('./pages/05_profile/ProfilePage')`,
  `import('./pages/EditProfilePage')`: `import('./pages/05_profile/EditProfilePage')`,
  `import('./pages/MyListingsPage')`: `import('./pages/05_profile/MyListingsPage')`,
  `import('./pages/SavedCarsPage')`: `import('./pages/05_profile/SavedCarsPage')`,
  
  // User Services
  `import('./pages/MessagingPage')`: `import('./pages/06_user_services/messaging/MessagingPage')`,
  `import('./pages/NotificationsPage')`: `import('./pages/06_user_services/notifications/NotificationsPage')`,
  `import('./pages/FavoritesPage')`: `import('./pages/06_user_services/favorites/FavoritesPage')`,
  `import('./pages/SettingsPage')`: `import('./pages/06_user_services/settings/SettingsPage')`,
  
  // Business
  `import('./pages/DealerDashboard')`: `import('./pages/07_business/dealer/DealerDashboard')`,
  `import('./pages/CompanyDashboard')`: `import('./pages/07_business/company/CompanyDashboard')`,
  
  // Admin
  `import('./pages/AdminDashboard')`: `import('./pages/09_admin/AdminDashboard')`,
  `import('./pages/UserManagement')`: `import('./pages/09_admin/UserManagement')`,
  
  // Integration
  `import('./pages/FacebookIntegration')`: `import('./pages/10_integration/FacebookIntegration')`,
  `import('./pages/TikTokIntegration')`: `import('./pages/10_integration/TikTokIntegration')`,
};

async function updateAppImports() {
  console.log('🔄 تحديث imports في App.tsx...\n');

  try {
    let content = fs.readFileSync(APP_FILE, 'utf8');
    let updatedCount = 0;

    for (const [oldImport, newImport] of Object.entries(IMPORT_UPDATES)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
        console.log(`✅ تحديث: ${oldImport} → ${newImport}`);
        updatedCount++;
      }
    }

    fs.writeFileSync(APP_FILE, content, 'utf8');
    console.log(`\n📊 إجمالي التحديثات: ${updatedCount}`);
    console.log('✅ تم تحديث App.tsx بنجاح!\n');

  } catch (error) {
    console.error('❌ خطأ في تحديث App.tsx:', error.message);
    process.exit(1);
  }
}

updateAppImports();
