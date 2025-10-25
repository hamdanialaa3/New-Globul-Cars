import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { serviceLogger } from './logger-wrapper';

export interface MaintenanceAlert {
  id: string;
  vin: string;
  userId: string;
  type: 'proactive' | 'scheduled' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  issues: string[];
  recommendedActions: string[];
  estimatedCost: {
    min: number;
    max: number;
    currency: 'EUR';
  };
  serviceCenters: ServiceCenterOffer[];
  status: 'active' | 'accepted' | 'completed' | 'dismissed';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface ServiceCenterOffer {
  centerId: string;
  centerName: string;
  location: string;
  distance: number; // كم
  rating: number;
  reviewCount: number;
  price: number;
  currency: 'EUR';
  availability: string; // تاريخ ووقت متاح
  contactInfo: {
    phone: string;
    email: string;
  };
  warranty: string; // مدة الضمان
}

export interface MaintenanceRequest {
  id: string;
  alertId: string;
  userId: string;
  vin: string;
  serviceCenterId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Timestamp;
  estimatedCompletion: Timestamp;
  actualCost: number;
  currency: 'EUR';
  workDescription: string[];
  parts: MaintenancePart[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MaintenancePart {
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
}

export class ProactiveMaintenanceService {
  private db = getFirestore();
  private readonly BULGARIAN_TIMEZONE = 'Europe/Sofia';

  /**
   * (Comment removed - was in Arabic)
   */
  async createMaintenanceAlert(alertData: Omit<MaintenanceAlert, 'id' | 'createdAt' | 'expiresAt'>): Promise<string> {
    try {
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const alertRef = doc(this.db, 'maintenanceAlerts', alertId);

      const alert: MaintenanceAlert = {
        ...alertData,
        id: alertId,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 ????
      };

      await setDoc(alertRef, alert);

      // (Comment removed - was in Arabic)
      await this.notifyServiceCenters(alert);

      return alertId;

    } catch (error) {
      serviceLogger.error('Failed to create maintenance alert', error as Error, { userId: alertData.userId, vin: alertData.vin });
      throw new Error('فشل في إنشاء تنبيه الصيانة');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async getUserMaintenanceAlerts(userId: string): Promise<MaintenanceAlert[]> {
    try {
      const alertsQuery = query(
        collection(this.db, 'maintenanceAlerts'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const alertsSnapshot = await getDocs(alertsQuery);
      return alertsSnapshot.docs.map(doc => doc.data() as MaintenanceAlert);

    } catch (error) {
      serviceLogger.error('Failed to get user maintenance alerts', error as Error, { userId });
      return [];
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async submitServiceOffer(alertId: string, offer: ServiceCenterOffer): Promise<void> {
    try {
      const alertRef = doc(this.db, 'maintenanceAlerts', alertId);
      const alertDoc = await getDoc(alertRef);

      if (!alertDoc.exists()) {
        throw new Error('تنبيه الصيانة غير موجود');
      }

      const alert = alertDoc.data() as MaintenanceAlert;

      // (Comment removed - was in Arabic)
      const updatedOffers = [...alert.serviceCenters, offer];

      await updateDoc(alertRef, {
        serviceCenters: updatedOffers
      });

    } catch (error) {
      serviceLogger.error('Failed to submit service offer', error as Error, { alertId, centerId: offer.centerId });
      throw new Error('فشل في إرسال عرض الخدمة');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async acceptServiceOffer(alertId: string, centerId: string, scheduledDate: Date): Promise<string> {
    try {
      const alertRef = doc(this.db, 'maintenanceAlerts', alertId);
      const alertDoc = await getDoc(alertRef);

      if (!alertDoc.exists()) {
        throw new Error('تنبيه الصيانة غير موجود');
      }

      const alert = alertDoc.data() as MaintenanceAlert;
      const selectedOffer = alert.serviceCenters.find(offer => offer.centerId === centerId);

      if (!selectedOffer) {
        throw new Error('عرض الخدمة غير موجود');
      }

      // (Comment removed - was in Arabic)
      const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const requestRef = doc(this.db, 'maintenanceRequests', requestId);

      const request: MaintenanceRequest = {
        id: requestId,
        alertId,
        userId: alert.userId,
        vin: alert.vin,
        serviceCenterId: centerId,
        status: 'confirmed',
        scheduledDate: Timestamp.fromDate(scheduledDate),
        estimatedCompletion: Timestamp.fromDate(new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000)), // 2 ?????
        actualCost: selectedOffer.price,
        currency: 'EUR',
        workDescription: alert.recommendedActions,
        parts: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(requestRef, request);

      // (Comment removed - was in Arabic)
      await updateDoc(alertRef, {
        status: 'accepted'
      });

      return requestId;

    } catch (error) {
      serviceLogger.error('Failed to accept service offer', error as Error, { alertId, centerId });
      throw new Error('فشل في قبول عرض الخدمة');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async getUserMaintenanceRequests(userId: string): Promise<MaintenanceRequest[]> {
    try {
      const requestsQuery = query(
        collection(this.db, 'maintenanceRequests'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const requestsSnapshot = await getDocs(requestsQuery);
      return requestsSnapshot.docs.map(doc => doc.data() as MaintenanceRequest);

    } catch (error) {
      serviceLogger.error('Failed to get user maintenance requests', error as Error, { userId });
      return [];
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async updateMaintenanceRequest(requestId: string, updates: Partial<MaintenanceRequest>): Promise<void> {
    try {
      const requestRef = doc(this.db, 'maintenanceRequests', requestId);

      await updateDoc(requestRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      serviceLogger.error('Failed to update maintenance request', error as Error, { requestId });
      throw new Error('فشل في تحديث طلب الصيانة');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async notifyServiceCenters(alert: MaintenanceAlert): Promise<void> {
    try {
      // (Comment removed - was in Arabic)
// (Comment removed - was in Arabic)
      const mockCenters = await this.getNearbyServiceCenters(alert.vin);

      for (const center of mockCenters) {
        // (Comment removed - was in Arabic)
}

    } catch (error) {
      serviceLogger.error('Failed to notify service centers', error as Error, { alertId: alert.id, vin: alert.vin });
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async getNearbyServiceCenters(vin: string): Promise<any[]> {
    // (Comment removed - was in Arabic)
    return [
      {
        id: 'center_1',
        name: 'Gloubul Service Center Sofia',
        location: 'Sofia',
        distance: 5.2,
        rating: 4.8,
        reviewCount: 1250
      },
      {
        id: 'center_2',
        name: 'Auto Expert Plovdiv',
        location: 'Plovdiv',
        distance: 12.1,
        rating: 4.6,
        reviewCount: 890
      },
      {
        id: 'center_3',
        name: 'CarCare Varna',
        location: 'Varna',
        distance: 8.7,
        rating: 4.7,
        reviewCount: 654
      }
    ];
  }

  /**
   * (Comment removed - was in Arabic)
   */
  analyzeMaintenanceNeeds(digitalTwin: any): MaintenanceAlert | null {
    const issues: string[] = [];
    const actions: string[] = [];

    // (Comment removed - was in Arabic)
    if (digitalTwin.fuelLevelPercent < 15) {
      issues.push('مستوى الوقود منخفض');
      actions.push('تزويد الوقود');
    }

    // (Comment removed - was in Arabic)
    if (digitalTwin.engineHealth === 'critical') {
      issues.push('حالة المحرك حرجة - أكواد أعطال نشطة');
      actions.push('فحص تشخيصي شامل للمحرك');
      actions.push('إصلاح الأعطال المكتشفة');
    } else if (digitalTwin.engineHealth === 'warning') {
      issues.push('تحذير من حالة المحرك');
      actions.push('فحص وقائي للمحرك');
    }

    // (Comment removed - was in Arabic)
    if (digitalTwin.totalMileage >= digitalTwin.nextServiceDueKm) {
      issues.push('الصيانة الدورية مطلوبة');
      actions.push('تغيير زيت المحرك وفلاتر');
      actions.push('فحص المكابح والإطارات');
      actions.push('فحص السوائل والأنظمة الكهربائية');
    }

    // (Comment removed - was in Arabic)
    if (digitalTwin.batteryLevel < 30) {
      issues.push('بطارية الجهاز ضعيفة');
      actions.push('فحص وشحن بطارية الجهاز');
    }

    if (issues.length === 0) {
      return null;
    }

    // (Comment removed - was in Arabic)
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (issues.some(issue => issue.includes('حرجة') || issue.includes('critical'))) {
      priority = 'critical';
    } else if (issues.some(issue => issue.includes('تحذير') || issue.includes('warning'))) {
      priority = 'high';
    } else if (issues.length > 1) {
      priority = 'medium';
    }

    return {
      id: '',
      vin: digitalTwin.vin,
      userId: digitalTwin.userId,
      type: 'proactive',
      priority,
      title: 'تنبيه صيانة استباقي',
      description: `تم اكتشاف ${issues.length} مشاكل محتملة في سيارتك`,
      issues,
      recommendedActions: actions,
      estimatedCost: {
        min: 50,
        max: 500,
        currency: 'EUR'
      },
      serviceCenters: [],
      status: 'active',
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    };
  }
}

export const proactiveMaintenanceService = new ProactiveMaintenanceService();