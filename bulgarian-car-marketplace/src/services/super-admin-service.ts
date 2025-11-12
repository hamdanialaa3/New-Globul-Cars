// Super Admin Service - نظام الإدارة الفريد للمالك الوحيد
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

export interface SuperAdminUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  photoURL: string;
  role: 'super_admin';
  permissions: string[];
  lastLogin: Date;
  isActive: boolean;
  location: {
    city: string;
    region: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface RealTimeAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalCars: number;
  activeCars: number;
  totalMessages: number;
  totalViews: number;
  revenue: number;
  topCountries: Array<{country: string; count: number}>;
  topCities: Array<{city: string; count: number}>;
  userGrowth: Array<{date: string; count: number}>;
  carListings: Array<{date: string; count: number}>;
  lastUpdated: Date;
}

export interface UserActivity {
  uid: string;
  email: string;
  displayName: string;
  lastLogin: Date;
  loginCount: number;
  location: string;
  device: string;
  browser: string;
  isOnline: boolean;
  lastActivity: Date;
}

export interface ContentModeration {
  reportedCars: number;
  pendingReviews: number;
  bannedUsers: number;
  deletedContent: number;
  flaggedMessages: number;
}

export class SuperAdminService {
  private static instance: SuperAdminService;
  private readonly SUPER_ADMIN_EMAIL = 'alaa.hamdani@yahoo.com';
  private analyticsCache: RealTimeAnalytics | null = null;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): SuperAdminService {
    if (!SuperAdminService.instance) {
      SuperAdminService.instance = new SuperAdminService();
    }
    return SuperAdminService.instance;
  }

  // التحقق من هوية المالك الفريد
  public isSuperAdmin(email: string): boolean {
    return email === this.SUPER_ADMIN_EMAIL;
  }

  // الحصول على الإحصائيات الحقيقية
  public async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    try {
      // التحقق من الكاش
      if (this.analyticsCache && 
          (Date.now() - this.analyticsCache.lastUpdated.getTime()) < this.cacheExpiry) {
        return this.analyticsCache;
      }

      const [
        usersSnapshot,
        carsSnapshot,
        messagesSnapshot,
        viewsSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'cars')),
        getDocs(collection(db, 'messages')),
        getDocs(collection(db, 'analytics'))
      ]);

      // حساب المستخدمين النشطين (آخر 24 ساعة)
      const activeUsers = usersSnapshot.docs.filter(doc => {
        const data = doc.data();
        const lastLogin = data.lastLogin?.toDate();
        return lastLogin && (Date.now() - lastLogin.getTime()) < 24 * 60 * 60 * 1000;
      }).length;

      // حساب السيارات النشطة
      const activeCars = carsSnapshot.docs.filter(doc => 
        doc.data().isActive === true
      ).length;

      // حساب إجمالي المشاهدات
      const totalViews = viewsSnapshot.docs.reduce((sum, doc) => 
        sum + (doc.data().views || 0), 0
      );

      // تحليل المواقع الجغرافية
      const countries = new Map<string, number>();
      const cities = new Map<string, number>();
      
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.location?.country) {
          countries.set(data.location.country, (countries.get(data.location.country) || 0) + 1);
        }
        if (data.location?.city) {
          cities.set(data.location.city, (cities.get(data.location.city) || 0) + 1);
        }
      });

      const topCountries = Array.from(countries.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topCities = Array.from(cities.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // تحليل نمو المستخدمين (آخر 30 يوم)
      const userGrowth = await this.getUserGrowthData();
      const carListings = await this.getCarListingsData();

      const analytics: RealTimeAnalytics = {
        totalUsers: usersSnapshot.size,
        activeUsers,
        totalCars: carsSnapshot.size,
        activeCars,
        totalMessages: messagesSnapshot.size,
        totalViews,
        revenue: await this.calculateRevenue(),
        topCountries,
        topCities,
        userGrowth,
        carListings,
        lastUpdated: new Date()
      };

      this.analyticsCache = analytics;
      return analytics;

    } catch (error) {
      serviceLogger.error('Error fetching real-time analytics', error as Error);
      throw error;
    }
  }

  // الحصول على نشاط المستخدمين
  public async getUserActivity(): Promise<UserActivity[]> {
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), orderBy('lastLogin', 'desc'), limit(100))
      );

      return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || 'Unknown',
          lastLogin: data.lastLogin?.toDate() || new Date(),
          loginCount: data.loginCount || 0,
          location: `${data.location?.city || 'Unknown'}, ${data.location?.region || 'Unknown'}`,
          device: data.device || 'Unknown',
          browser: data.browser || 'Unknown',
          isOnline: data.isOnline || false,
          lastActivity: data.lastActivity?.toDate() || new Date()
        };
      });
    } catch (error) {
      serviceLogger.error('Error fetching user activity', error as Error);
      throw error;
    }
  }

  // إدارة المستخدمين
  public async banUser(userId: string, reason: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned: true,
        banReason: reason,
        bannedAt: serverTimestamp(),
        bannedBy: this.SUPER_ADMIN_EMAIL
      });

      // تسجيل العملية
      await this.logAdminAction('ban_user', { userId, reason });
    } catch (error) {
      serviceLogger.error('Error banning user', error as Error, { userId, reason });
      throw error;
    }
  }

  public async unbanUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null
      });

      await this.logAdminAction('unban_user', { userId });
    } catch (error) {
      serviceLogger.error('Error unbanning user', error as Error, { userId });
      throw error;
    }
  }

  public async deleteUser(userId: string | null | undefined): Promise<void> {
    // ✅ FIX: Guard against null/undefined userId BEFORE constructing queries
    if (!userId) {
      serviceLogger.warn('[SuperAdminService] deleteUser called with null/undefined userId');
      throw new Error('Invalid userId provided for deletion');
    }

    try {
      const batch = writeBatch(db);
      
      // حذف بيانات المستخدم
      batch.delete(doc(db, 'users', userId));
      
      // حذف سيارات المستخدم
      const carsSnapshot = await getDocs(
        query(collection(db, 'cars'), where('sellerId', '==', userId))
      );
      carsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // حذف رسائل المستخدم
      const messagesSnapshot = await getDocs(
        query(collection(db, 'messages'), where('senderId', '==', userId))
      );
      messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
      await this.logAdminAction('delete_user', { userId });
    } catch (error) {
      serviceLogger.error('Error deleting user', error as Error, { userId });
      throw error;
    }
  }

  // إدارة المحتوى
  public async deleteCar(carId: string, reason: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cars', carId));
      await this.logAdminAction('delete_car', { carId, reason });
    } catch (error) {
      serviceLogger.error('Error deleting car', error as Error, { carId, reason });
      throw error;
    }
  }

  public async flagContent(contentId: string, type: string, reason: string): Promise<void> {
    try {
      const flagRef = doc(collection(db, 'flagged_content'));
      await updateDoc(flagRef, {
        contentId,
        type,
        reason,
        flaggedBy: this.SUPER_ADMIN_EMAIL,
        flaggedAt: serverTimestamp(),
        status: 'pending'
      });
    } catch (error) {
      serviceLogger.error('Error flagging content', error as Error, { contentId, type, reason });
      throw error;
    }
  }

  // الحصول على بيانات الإشراف
  public async getContentModeration(): Promise<ContentModeration> {
    try {
      const [reportedCars, pendingReviews, bannedUsers, deletedContent, flaggedMessages] = await Promise.all([
        getDocs(query(collection(db, 'cars'), where('isReported', '==', true))),
        getDocs(query(collection(db, 'reviews'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'users'), where('isBanned', '==', true))),
        getDocs(query(collection(db, 'deleted_content'))),
        getDocs(query(collection(db, 'messages'), where('isFlagged', '==', true)))
      ]);

      return {
        reportedCars: reportedCars.size,
        pendingReviews: pendingReviews.size,
        bannedUsers: bannedUsers.size,
        deletedContent: deletedContent.size,
        flaggedMessages: flaggedMessages.size
      };
    } catch (error) {
      serviceLogger.error('Error fetching content moderation data', error as Error);
      throw error;
    }
  }

  // تسجيل أعمال الإدارة
  private async logAdminAction(action: string, details: any): Promise<void> {
    try {
      const logRef = doc(collection(db, 'admin_logs'));
      await updateDoc(logRef, {
        action,
        details,
        adminEmail: this.SUPER_ADMIN_EMAIL,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error logging admin action', error as Error, { action, details });
    }
  }

  // تحليل نمو المستخدمين
  private async getUserGrowthData(): Promise<Array<{date: string; count: number}>> {
    // تنفيذ تحليل نمو المستخدمين
    return [];
  }

  // تحليل قوائم السيارات
  private async getCarListingsData(): Promise<Array<{date: string; count: number}>> {
    // تنفيذ تحليل قوائم السيارات
    return [];
  }

  // حساب الإيرادات
  private async calculateRevenue(): Promise<number> {
    // حساب الإيرادات الحقيقية
    return 0;
  }

  // مراقبة في الوقت الفعلي
  public subscribeToRealTimeUpdates(callback: (data: RealTimeAnalytics) => void): () => void {
    return onSnapshot(collection(db, 'analytics'), (snapshot) => {
      this.getRealTimeAnalytics().then(callback);
    });
  }
}

export const superAdminService = SuperAdminService.getInstance();

