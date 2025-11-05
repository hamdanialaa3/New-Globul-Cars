const fs = require('fs-extra');
const path = require('path');

/**
 * سكريبت إعادة الهيكلة الشامل
 * Comprehensive Restructure Migration Script
 * 
 * الاستخدام:
 * node RESTRUCTURE_PLANS/02_MIGRATION_SCRIPT.js [--dry-run] [--only=section]
 * 
 * Options:
 * --dry-run: محاكاة بدون تنفيذ فعلي
 * --only=core|auth|marketplace|sell|profile|services|business|admin|integration: تنفيذ قسم واحد فقط
 */

const PAGES_DIR = path.join(__dirname, '../src/pages');

// التحقق من وجود مجلد pages
if (!fs.existsSync(PAGES_DIR)) {
  console.error('❌ خطأ: مجلد src/pages/ غير موجود!');
  process.exit(1);
}

// معامل سطر الأوامر
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const onlySection = args.find(arg => arg.startsWith('--only='))?.split('=')[1];

// خريطة النقل الكاملة
const MIGRATION_MAP = {
  core: [
    { from: 'HomePage.tsx', to: '01_core/HomePage/index.tsx' },
    { from: 'AboutPage.tsx', to: '01_core/AboutPage/index.tsx' },
    { from: 'ContactPage.tsx', to: '01_core/ContactPage/index.tsx' },
    { from: 'TermsPage.tsx', to: '01_core/TermsPage/index.tsx' },
    { from: 'PrivacyPage.tsx', to: '01_core/PrivacyPage/index.tsx' },
    { from: 'NotFoundPage.tsx', to: '01_core/NotFoundPage/index.tsx' },
  ],
  
  auth: [
    { from: 'LoginPage.tsx', to: '02_auth/LoginPage/index.tsx' },
    { from: 'RegisterPage.tsx', to: '02_auth/RegisterPage/index.tsx' },
    { from: 'ForgotPasswordPage.tsx', to: '02_auth/ForgotPasswordPage/index.tsx' },
    { from: 'ResetPasswordPage.tsx', to: '02_auth/ResetPasswordPage/index.tsx' },
    { from: 'OAuthCallback.tsx', to: '02_auth/OAuthCallback/index.tsx' },
  ],
  
  marketplace: [
    { from: 'SearchPage', to: '03_marketplace/SearchPage' },
    { from: 'CategoryPage', to: '03_marketplace/CategoryPage' },
    { from: 'CarDetailsPage', to: '03_marketplace/CarDetailsPage' },
  ],
  
  sell: [
    // Desktop Workflow
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
    
    // Mobile Variants
    { from: 'MobileVehicleStartPageNew', to: '04_sell/_mobile/MobileVehicleStartPageNew' },
    { from: 'MobileSellerTypePageNew', to: '04_sell/_mobile/MobileSellerTypePageNew' },
    { from: 'MobileVehicleData', to: '04_sell/_mobile/MobileVehicleData' },
    { from: 'MobileEquipmentMainPage', to: '04_sell/_mobile/equipment/MobileEquipmentMainPage' },
    { from: 'MobileSafetyPage', to: '04_sell/_mobile/equipment/MobileSafetyPage' },
    { from: 'MobileComfortPage', to: '04_sell/_mobile/equipment/MobileComfortPage' },
    { from: 'MobileInfotainmentPage', to: '04_sell/_mobile/equipment/MobileInfotainmentPage' },
    { from: 'MobileExtrasPage', to: '04_sell/_mobile/equipment/MobileExtrasPage' },
    { from: 'MobileUnifiedEquipmentPage', to: '04_sell/_mobile/equipment/MobileUnifiedEquipmentPage' },
    { from: 'MobileImagesPage', to: '04_sell/_mobile/MobileImagesPage' },
    { from: 'MobilePricingPage', to: '04_sell/_mobile/MobilePricingPage' },
    { from: 'MobileContactNamePage', to: '04_sell/_mobile/contact/MobileContactNamePage' },
    { from: 'MobileContactAddressPage', to: '04_sell/_mobile/contact/MobileContactAddressPage' },
    { from: 'MobileContactPhonePage', to: '04_sell/_mobile/contact/MobileContactPhonePage' },
    { from: 'MobileUnifiedContactPage', to: '04_sell/_mobile/contact/MobileUnifiedContactPage' },
    
    // Legacy
    { from: 'sell', to: '04_sell/_legacy/sell' },
  ],
  
  profile: [
    { from: 'ProfilePage', to: '05_profile/ProfilePage' }, // له مجلد - ننقله كما هو
    { from: 'EditProfilePage.tsx', to: '05_profile/EditProfilePage/index.tsx' },
    { from: 'MyListingsPage.tsx', to: '05_profile/MyListingsPage/index.tsx' },
    { from: 'SavedCarsPage.tsx', to: '05_profile/SavedCarsPage/index.tsx' },
  ],
  
  services: [
    { from: 'MessagingPage', to: '06_user_services/messaging/MessagingPage' },
    { from: 'NotificationsPage', to: '06_user_services/notifications/NotificationsPage' },
    { from: 'FavoritesPage', to: '06_user_services/favorites/FavoritesPage' },
    { from: 'SettingsPage', to: '06_user_services/settings/SettingsPage' },
  ],
  
  business: [
    { from: 'DealerDashboard', to: '07_business/dealer/DealerDashboard' },
    { from: 'CompanyDashboard', to: '07_business/company/CompanyDashboard' },
  ],
  
  admin: [
    { from: 'AdminDashboard', to: '09_admin/AdminDashboard' },
    { from: 'UserManagement', to: '09_admin/UserManagement' },
  ],
  
  integration: [
    { from: 'FacebookIntegration', to: '10_integration/FacebookIntegration' },
    { from: 'TikTokIntegration', to: '10_integration/TikTokIntegration' },
  ],
};

// دالة النقل
async function migrateFiles(section, files) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 القسم: ${section.toUpperCase()}`);
  console.log(`${'='.repeat(60)}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const { from, to } of files) {
    const sourcePath = path.join(PAGES_DIR, from);
    const destPath = path.join(PAGES_DIR, to);

    try {
      // التحقق من وجود المصدر
      if (!await fs.pathExists(sourcePath)) {
        console.log(`⏭️  [${section}] تخطي (غير موجود): ${from}`);
        skipCount++;
        continue;
      }

      // تحقق من وجود الوجهة (تجنب الكتابة فوق ملفات موجودة)
      if (await fs.pathExists(destPath)) {
        console.log(`⚠️  [${section}] موجود مسبقاً (تخطي): ${to}`);
        skipCount++;
        continue;
      }

      if (isDryRun) {
        console.log(`🧪 [${section}] محاكاة: ${from} → ${to}`);
        successCount++;
      } else {
        // إنشاء المجلد الهدف
        await fs.ensureDir(path.dirname(destPath));

        // نقل الملف/المجلد
        await fs.move(sourcePath, destPath, { overwrite: false });

        console.log(`✅ [${section}] تم: ${from} → ${to}`);
        successCount++;
      }

    } catch (error) {
      console.error(`❌ [${section}] خطأ: ${from}`, error.message);
      errorCount++;
    }
  }

  return { successCount, skipCount, errorCount };
}

// دالة حذف مجلد DDD الخاطئ
async function cleanupDDDFolder() {
  const dddPath = path.join(PAGES_DIR, 'DDD');
  
  if (await fs.pathExists(dddPath)) {
    console.log('\n⚠️  مجلد DDD/ موجود داخل src/pages/');
    
    if (isDryRun) {
      console.log('🧪 محاكاة: سيتم حذف src/pages/DDD/');
    } else {
      try {
        await fs.remove(dddPath);
        console.log('✅ تم حذف src/pages/DDD/ بنجاح');
      } catch (error) {
        console.error('❌ فشل حذف src/pages/DDD/', error.message);
      }
    }
  }
}

// التنفيذ الرئيسي
async function main() {
  console.log('\n' + '🚀'.repeat(30));
  console.log('🚀 سكريبت إعادة الهيكلة الشامل');
  console.log('🚀'.repeat(30) + '\n');

  if (isDryRun) {
    console.log('🧪 وضع المحاكاة (DRY-RUN) - لن يتم تنفيذ أي تغييرات فعلية\n');
  }

  if (onlySection) {
    console.log(`🎯 تنفيذ قسم واحد فقط: ${onlySection}\n`);
  }

  // 1. تنظيف مجلد DDD
  await cleanupDDDFolder();

  // 2. تنفيذ النقل
  let totalSuccess = 0;
  let totalSkip = 0;
  let totalError = 0;

  const sectionsToMigrate = onlySection 
    ? (MIGRATION_MAP[onlySection] ? [onlySection] : [])
    : Object.keys(MIGRATION_MAP);

  if (sectionsToMigrate.length === 0) {
    console.error(`❌ خطأ: القسم "${onlySection}" غير موجود!`);
    console.log('الأقسام المتاحة:', Object.keys(MIGRATION_MAP).join(', '));
    process.exit(1);
  }

  for (const section of sectionsToMigrate) {
    const files = MIGRATION_MAP[section];
    const result = await migrateFiles(section, files);
    totalSuccess += result.successCount;
    totalSkip += result.skipCount;
    totalError += result.errorCount;
  }

  // 3. ملخص النتائج
  console.log('\n' + '='.repeat(60));
  console.log('📊 النتائج النهائية:');
  console.log('='.repeat(60));
  console.log(`   ✅ نجح: ${totalSuccess}`);
  console.log(`   ⏭️  تخطي: ${totalSkip}`);
  console.log(`   ❌ أخطاء: ${totalError}`);
  console.log('='.repeat(60) + '\n');

  if (!isDryRun && totalSuccess > 0) {
    console.log('⚠️  الخطوة التالية: تحديث App.tsx و ProfileRouter.tsx');
    console.log('   راجع: RESTRUCTURE_PLANS/03_IMPORT_UPDATE_GUIDE.md\n');
    console.log('📝 بعد التحديث، شغّل:');
    console.log('   npm run build');
    console.log('   npm start\n');
  }

  if (isDryRun) {
    console.log('💡 لتنفيذ فعلي، شغّل السكريبت بدون --dry-run\n');
  }

  if (totalError > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ خطأ فادح:', error);
  process.exit(1);
});
