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
    console.log('🔧 Starting data ownership fix...\n');
    
    const report: FixReport = {
      postsFixed: 0,
      carsFixed: 0,
      errors: [],
      success: false
    };

    try {
      // 1. إصلاح المنشورات
      console.log('📝 Fixing posts...');
      report.postsFixed = await this.fixPosts();
      console.log(`✅ Fixed ${report.postsFixed} posts\n`);

      // 2. إصلاح السيارات
      console.log('🚗 Fixing cars...');
      report.carsFixed = await this.fixCars();
      console.log(`✅ Fixed ${report.carsFixed} cars\n`);

      report.success = true;
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ All data fixed successfully!');
      console.log(`📝 Posts fixed: ${report.postsFixed}`);
      console.log(`🚗 Cars fixed: ${report.carsFixed}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return report;
    } catch (error) {
      console.error('❌ Error during fix:', error);
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
      
      console.log(`   Found ${postsSnapshot.size} posts to check...`);

      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        let needsUpdate = false;
        const updates: any = {};

        // ✅ Check 1: authorId موجود؟
        if (!postData.authorId) {
          console.log(`   ⚠️ Post ${postDoc.id} has no authorId - SKIPPING (cannot fix)`);
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
            console.error(`   Error fixing post ${postDoc.id}:`, err);
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
          console.log(`   ✓ Fixed post ${postDoc.id}`);
        }
      }

      return fixedCount;
    } catch (error) {
      console.error('Error fixing posts:', error);
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
      
      console.log(`   Found ${carsSnapshot.size} cars to check...`);

      for (const carDoc of carsSnapshot.docs) {
        const carData = carDoc.data();
        let needsUpdate = false;
        const updates: any = {};

        // ✅ Check 1: userId/ownerId موجود؟
        if (!carData.userId && !carData.ownerId) {
          console.log(`   ⚠️ Car ${carDoc.id} has no userId/ownerId - SKIPPING`);
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
            console.error(`   Error fixing car ${carDoc.id}:`, err);
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
          console.log(`   ✓ Fixed car ${carDoc.id}`);
        }
      }

      return fixedCount;
    } catch (error) {
      console.error('Error fixing cars:', error);
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
    console.log('🔍 Checking data integrity...\n');

    let postsWithIssues = 0;
    let carsWithIssues = 0;

    // فحص المنشورات
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    console.log(`📝 Total posts: ${postsSnapshot.size}`);
    
    postsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.authorId || !data.authorInfo?.displayName || !data.status) {
        postsWithIssues++;
        console.log(`   ⚠️ Post ${doc.id}: Missing ${!data.authorId ? 'authorId' : !data.authorInfo?.displayName ? 'authorInfo' : 'status'}`);
      }
    });

    // فحص السيارات
    const carsSnapshot = await getDocs(collection(db, 'cars'));
    console.log(`\n🚗 Total cars: ${carsSnapshot.size}`);
    
    carsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.sellerEmail || (!data.userId && !data.ownerId)) {
        carsWithIssues++;
        console.log(`   ⚠️ Car ${doc.id}: Missing ${!data.sellerEmail ? 'sellerEmail' : 'userId/ownerId'}`);
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Results:`);
    console.log(`   Posts with issues: ${postsWithIssues}/${postsSnapshot.size}`);
    console.log(`   Cars with issues: ${carsWithIssues}/${carsSnapshot.size}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
    console.log(`🔍 Checking posts for user: ${userId}\n`);

    const postsSnapshot = await getDocs(
      query(collection(db, 'posts'), where('authorId', '==', userId))
    );

    console.log(`Found ${postsSnapshot.size} posts for this user:\n`);

    postsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`📝 Post ${doc.id}:`);
      console.log(`   authorId: ${data.authorId}`);
      console.log(`   authorInfo: ${data.authorInfo?.displayName || 'MISSING'}`);
      console.log(`   status: ${data.status || 'MISSING'}`);
      console.log(`   type: ${data.type}`);
      console.log(`   text: ${data.content?.text?.substring(0, 50)}...`);
      console.log('');
    });
  }

  /**
   * التحقق من سيارات مستخدم معين
   */
  static async checkUserCars(userEmail: string): Promise<void> {
    console.log(`🔍 Checking cars for user email: ${userEmail}\n`);

    const carsSnapshot = await getDocs(
      query(collection(db, 'cars'), where('sellerEmail', '==', userEmail))
    );

    console.log(`Found ${carsSnapshot.size} cars for this user:\n`);

    carsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`🚗 Car ${doc.id}:`);
      console.log(`   make/model: ${data.make} ${data.model}`);
      console.log(`   sellerEmail: ${data.sellerEmail || 'MISSING'}`);
      console.log(`   userId: ${data.userId || data.ownerId || 'MISSING'}`);
      console.log(`   status: ${data.status || 'MISSING'}`);
      console.log('');
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

