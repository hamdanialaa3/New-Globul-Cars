import { logger } from '../services/logger-service';
// Fix Old Data Ownership Script
// سكريبت تصحيح ملكية البيانات القديمة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

/**
 * هذا السكريبت يصلح البيانات القديمة التي قد تكون:
 * 1. منشورات بدون authorId صحيح
 * 2. سيارات بدون sellerEmail صحيح
 * 3. بيانات غير منسوبة لأصحابها
 */

interface FixReport {
  postsFixed: number;
  carsFixed: number;
  errors: string[];
  success: boolean;
}

export class DataOwnershipFixer {
  /**
   * إصلاح جميع البيانات القديمة
   */
  static async fixAllOldData(): Promise<FixReport> {
    logger.info('🔧 Starting data ownership fix...\n');
    
    const report: FixReport = {
      postsFixed: 0,
      carsFixed: 0,
      errors: [],
      success: false
    };

    try {
      // 1. إصلاح المنشورات
      logger.info('📝 Fixing posts...');
      report.postsFixed = await this.fixPosts();
      logger.info(`✅ Fixed ${report.postsFixed} posts\n`);

      // 2. إصلاح السيارات
      logger.info('🚗 Fixing cars...');
      report.carsFixed = await this.fixCars();
      logger.info(`✅ Fixed ${report.carsFixed} cars\n`);

      report.success = true;
      
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('✅ All data fixed successfully!');
      logger.info(`📝 Posts fixed: ${report.postsFixed}`);
      logger.info(`🚗 Cars fixed: ${report.carsFixed}`);
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return report;
    } catch (error) {
      logger.error('❌ Error during fix:', error);
      report.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return report;
    }
  }

  /**
   * إصلاح المنشورات بدون authorId أو authorId خاطئ
   */
  private static async fixPosts(): Promise<number> {
    let fixedCount = 0;

    try {
      // جلب جميع المنشورات
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      
      logger.info(`   Found ${postsSnapshot.size} posts to check...`);

      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        let needsUpdate = false;
        const updates: any = {};

        // ✅ Check 1: authorId موجود؟
        if (!postData.authorId) {
          logger.info(`   ⚠️ Post ${postDoc.id} has no authorId - SKIPPING (cannot fix)`);
          continue;
        }

        // ✅ Check 2: authorInfo موجود ومكتمل؟
        if (!postData.authorInfo || !postData.authorInfo.displayName) {
          try {
            const userDoc = await getDocs(
              query(collection(db, 'users'), where('email', '==', postData.authorId))
            );
            
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              updates.authorInfo = {
                displayName: userData.displayName || 'Anonymous',
                profileImage: userData.profileImage?.url,
                profileType: userData.profileType || 'private',
                isVerified: userData.verification?.emailVerified || false,
                trustScore: userData.verification?.trustScore || 0
              };
              needsUpdate = true;
            }
          } catch (err) {
            logger.error(`   Error fixing post ${postDoc.id}:`, err);
          }
        }

        // ✅ Check 3: status موجود؟
        if (!postData.status) {
          updates.status = 'published';
          needsUpdate = true;
        }

        // ✅ Check 4: visibility موجود؟
        if (!postData.visibility) {
          updates.visibility = 'public';
          needsUpdate = true;
        }

        // ✅ Check 5: engagement موجود؟
        if (!postData.engagement) {
          updates.engagement = {
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0
          };
          needsUpdate = true;
        }

        // تطبيق التحديثات
        if (needsUpdate) {
          await updateDoc(doc(db, 'posts', postDoc.id), updates);
          fixedCount++;
          logger.info(`   ✓ Fixed post ${postDoc.id}`);
        }
      }

      return fixedCount;
    } catch (error) {
      logger.error('Error fixing posts:', error);
      throw error;
    }
  }

  /**
   * إصلاح السيارات بدون sellerEmail أو ownerId صحيح
   */
  private static async fixCars(): Promise<number> {
    let fixedCount = 0;

    try {
      // جلب جميع السيارات
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      
      logger.info(`   Found ${carsSnapshot.size} cars to check...`);

      for (const carDoc of carsSnapshot.docs) {
        const carData = carDoc.data();
        let needsUpdate = false;
        const updates: any = {};

        // ✅ Check 1: userId/ownerId موجود؟
        if (!carData.userId && !carData.ownerId) {
          logger.info(`   ⚠️ Car ${carDoc.id} has no userId/ownerId - SKIPPING`);
          continue;
        }

        // ✅ Check 2: sellerEmail موجود؟
        if (!carData.sellerEmail) {
          const userId = carData.userId || carData.ownerId;
          try {
            const userDoc = await getDocs(
              query(collection(db, 'users'), where('uid', '==', userId))
            );
            
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              updates.sellerEmail = userData.email;
              updates.sellerName = userData.displayName || userData.firstName + ' ' + userData.lastName;
              updates.sellerPhone = userData.phoneNumber || carData.sellerPhone;
              needsUpdate = true;
            }
          } catch (err) {
            logger.error(`   Error fixing car ${carDoc.id}:`, err);
          }
        }

        // ✅ Check 3: status موجود؟
        if (!carData.status) {
          updates.status = 'active';
          needsUpdate = true;
        }

        // ✅ Check 4: userId unified (تأكد من وجود userId)
        if (!carData.userId && carData.ownerId) {
          updates.userId = carData.ownerId;
          needsUpdate = true;
        }

        // تطبيق التحديثات
        if (needsUpdate) {
          await updateDoc(doc(db, 'cars', carDoc.id), updates);
          fixedCount++;
          logger.info(`   ✓ Fixed car ${carDoc.id}`);
        }
      }

      return fixedCount;
    } catch (error) {
      logger.error('Error fixing cars:', error);
      throw error;
    }
  }

  /**
   * التحقق من سلامة البيانات (بدون تعديل)
   */
  static async checkDataIntegrity(): Promise<{
    postsWithIssues: number;
    carsWithIssues: number;
    totalPosts: number;
    totalCars: number;
  }> {
    logger.info('🔍 Checking data integrity...\n');

    let postsWithIssues = 0;
    let carsWithIssues = 0;

    // فحص المنشورات
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    logger.info(`📝 Total posts: ${postsSnapshot.size}`);
    
    postsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.authorId || !data.authorInfo?.displayName || !data.status) {
        postsWithIssues++;
        logger.info(`   ⚠️ Post ${doc.id}: Missing ${!data.authorId ? 'authorId' : !data.authorInfo?.displayName ? 'authorInfo' : 'status'}`);
      }
    });

    // فحص السيارات
    const carsSnapshot = await getDocs(collection(db, 'cars'));
    logger.info(`\n🚗 Total cars: ${carsSnapshot.size}`);
    
    carsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.sellerEmail || (!data.userId && !data.ownerId)) {
        carsWithIssues++;
        logger.info(`   ⚠️ Car ${doc.id}: Missing ${!data.sellerEmail ? 'sellerEmail' : 'userId/ownerId'}`);
      }
    });

    logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`📊 Results:`);
    logger.info(`   Posts with issues: ${postsWithIssues}/${postsSnapshot.size}`);
    logger.info(`   Cars with issues: ${carsWithIssues}/${carsSnapshot.size}`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      postsWithIssues,
      carsWithIssues,
      totalPosts: postsSnapshot.size,
      totalCars: carsSnapshot.size
    };
  }

  /**
   * التحقق من منشورات مستخدم معين
   */
  static async checkUserPosts(userId: string): Promise<void> {
    logger.info(`🔍 Checking posts for user: ${userId}\n`);

    const postsSnapshot = await getDocs(
      query(collection(db, 'posts'), where('authorId', '==', userId))
    );

    logger.info(`Found ${postsSnapshot.size} posts for this user:\n`);

    postsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      logger.info(`📝 Post ${doc.id}:`);
      logger.info(`   authorId: ${data.authorId}`);
      logger.info(`   authorInfo: ${data.authorInfo?.displayName || 'MISSING'}`);
      logger.info(`   status: ${data.status || 'MISSING'}`);
      logger.info(`   type: ${data.type}`);
      logger.info(`   text: ${data.content?.text?.substring(0, 50)}...`);
      logger.info('');
    });
  }

  /**
   * التحقق من سيارات مستخدم معين
   */
  static async checkUserCars(userEmail: string): Promise<void> {
    logger.info(`🔍 Checking cars for user email: ${userEmail}\n`);

    const carsSnapshot = await getDocs(
      query(collection(db, 'cars'), where('sellerEmail', '==', userEmail))
    );

    logger.info(`Found ${carsSnapshot.size} cars for this user:\n`);

    carsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      logger.info(`🚗 Car ${doc.id}:`);
      logger.info(`   make/model: ${data.make} ${data.model}`);
      logger.info(`   sellerEmail: ${data.sellerEmail || 'MISSING'}`);
      logger.info(`   userId: ${data.userId || data.ownerId || 'MISSING'}`);
      logger.info(`   status: ${data.status || 'MISSING'}`);
      logger.info('');
    });
  }
}

/**
 * كيفية الاستخدام:
 * 
 * // 1. التحقق أولاً (بدون تعديل)
 * const integrity = await DataOwnershipFixer.checkDataIntegrity();
 * 
 * // 2. إذا وجدت مشاكل، قم بالإصلاح
 * const report = await DataOwnershipFixer.fixAllOldData();
 * 
 * // 3. التحقق من مستخدم معين
 * await DataOwnershipFixer.checkUserPosts('user123');
 * await DataOwnershipFixer.checkUserCars('user@example.com');
 */

export default DataOwnershipFixer;

