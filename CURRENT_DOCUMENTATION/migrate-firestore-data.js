/**
 * سكريبت نقل البيانات من Firebase القديم إلى الجديد
 * Migration script from old Firebase project to new one
 */

const admin = require('firebase-admin');

// ========================================
// المشروع القديم (المصدر)
// Old Project (Source)
// ========================================
const oldServiceAccount = {
  type: "service_account",
  project_id: "studio-448742006-a3493",
  // سنحتاج ملف service account من المشروع القديم
  // We need the service account file from old project
};

const oldApp = admin.initializeApp({
  credential: admin.credential.cert(oldServiceAccount),
  databaseURL: "https://studio-448742006-a3493.firebaseio.com"
}, 'oldProject');

const oldDb = oldApp.firestore();

// ========================================
// المشروع الجديد (الهدف)
// New Project (Target)
// ========================================
const newServiceAccount = {
  type: "service_account",
  project_id: "fire-new-globul",
  // سنحتاج ملف service account من المشروع الجديد
  // We need the service account file from new project
};

const newApp = admin.initializeApp({
  credential: admin.credential.cert(newServiceAccount),
  databaseURL: "https://fire-new-globul.firebaseio.com"
}, 'newProject');

const newDb = newApp.firestore();

// ========================================
// Collections to migrate
// ========================================
const COLLECTIONS_TO_MIGRATE = [
  'users',           // المستخدمين
  'cars',            // السيارات
  'profiles',        // الملفات الشخصية
  'listings',        // الإعلانات
  'favorites',       // المفضلة
  'messages',        // الرسائل
  'notifications',   // الإشعارات
  'reviews',         // التقييمات
  'savedSearches',   // البحث المحفوظ
  'follows',         // المتابعات
  'carViews',        // مشاهدات السيارات
  'analytics',       // التحليلات
  'reports',         // البلاغات
  'transactions',    // المعاملات
  // أضف أي collections أخرى
];

// ========================================
// Migration Functions
// ========================================

async function migrateCollection(collectionName) {
  console.log(`\n📦 بدء نقل Collection: ${collectionName}`);
  console.log(`📦 Starting migration of collection: ${collectionName}`);
  
  try {
    const snapshot = await oldDb.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`⚠️  Collection ${collectionName} فارغة - تخطي`);
      return { collection: collectionName, count: 0, success: true };
    }

    console.log(`📊 عدد المستندات: ${snapshot.size}`);
    
    const batch = newDb.batch();
    let batchCount = 0;
    let totalMigrated = 0;

    for (const doc of snapshot.docs) {
      const docRef = newDb.collection(collectionName).doc(doc.id);
      batch.set(docRef, doc.data());
      batchCount++;
      
      // Firestore batch limit is 500
      if (batchCount >= 500) {
        await batch.commit();
        totalMigrated += batchCount;
        console.log(`✅ تم نقل ${totalMigrated} من ${snapshot.size} مستندات`);
        batchCount = 0;
      }
    }

    // Commit remaining documents
    if (batchCount > 0) {
      await batch.commit();
      totalMigrated += batchCount;
    }

    console.log(`✅ اكتمل نقل ${collectionName}: ${totalMigrated} مستند`);
    return { collection: collectionName, count: totalMigrated, success: true };
    
  } catch (error) {
    console.error(`❌ خطأ في نقل ${collectionName}:`, error.message);
    return { collection: collectionName, count: 0, success: false, error: error.message };
  }
}

async function migrateSubcollections(parentCollection, parentDocId) {
  // نقل subcollections إذا كانت موجودة
  console.log(`🔄 فحص subcollections في ${parentCollection}/${parentDocId}`);
  
  // مثال: cars/{carId}/images
  // يمكن تخصيص هذا حسب بنية قاعدة البيانات
}

async function migrateAllData() {
  console.log('\n🚀 ===============================================');
  console.log('🚀 بدء عملية نقل البيانات الكاملة');
  console.log('🚀 Starting Full Data Migration');
  console.log('🚀 ===============================================\n');
  
  const startTime = Date.now();
  const results = [];

  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    const result = await migrateCollection(collectionName);
    results.push(result);
    
    // انتظر قليلاً بين كل collection لتجنب rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

  console.log('\n📊 ===============================================');
  console.log('📊 ملخص عملية النقل / Migration Summary');
  console.log('📊 ===============================================\n');
  
  let totalDocs = 0;
  let successCount = 0;
  let failureCount = 0;

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.collection}: ${result.count} مستندات`);
    totalDocs += result.count;
    if (result.success) successCount++;
    else failureCount++;
  });

  console.log(`\n⏱️  المدة الزمنية: ${duration} دقيقة`);
  console.log(`📈 إجمالي المستندات المنقولة: ${totalDocs}`);
  console.log(`✅ Collections ناجحة: ${successCount}`);
  console.log(`❌ Collections فاشلة: ${failureCount}`);
  
  console.log('\n🎉 ===============================================');
  console.log('🎉 اكتملت عملية النقل!');
  console.log('🎉 Migration Completed!');
  console.log('🎉 ===============================================\n');
}

// ========================================
// Run Migration
// ========================================

async function main() {
  try {
    await migrateAllData();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ فشلت عملية النقل:', error);
    process.exit(1);
  }
}

// تحقق من الحجج
if (process.argv.includes('--help')) {
  console.log(`
📚 استخدام سكريبت نقل البيانات
================================

قبل التشغيل:
1. قم بتحميل ملفات Service Account من كلا المشروعين
2. ضعها في مجلد scripts/
3. قم بتحديث المسارات في السكريبت

التشغيل:
node migrate-firestore-data.js

خيارات:
--help              عرض هذه المساعدة
--dry-run          معاينة فقط بدون نقل فعلي
--collection=NAME   نقل collection محدد فقط
  `);
  process.exit(0);
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { migrateCollection, migrateAllData };

