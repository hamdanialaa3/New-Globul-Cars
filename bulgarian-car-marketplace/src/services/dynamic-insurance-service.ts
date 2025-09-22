import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export interface DrivingBehavior {
  userId: string;
  vin: string;
  date: Timestamp;
  totalDistance: number; // كم
  averageSpeed: number; // كم/ساعة
  maxSpeed: number;
  harshAcceleration: number; // عدد المرات
  harshBraking: number; // عدد المرات
  speedingEvents: number; // عدد المرات
  nightDriving: number; // نسبة مئوية
  cityDriving: number; // نسبة مئوية
  highwayDriving: number; // نسبة مئوية
  idleTime: number; // دقائق
  fuelEfficiency: number; // لتر/100كم
  accidentHistory: number;
}

export interface RiskScore {
  userId: string;
  vin: string;
  overallScore: number; // 0-100 (100 = مخاطر عالية)
  speedRisk: number;
  accelerationRisk: number;
  distanceRisk: number;
  timeRisk: number;
  accidentRisk: number;
  lastUpdated: Timestamp;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface DynamicInsurancePolicy {
  policyId: string;
  userId: string;
  vin: string;
  basePremium: number; // يورو شهرياً
  currentPremium: number;
  riskAdjustment: number; // نسبة مئوية (±)
  coverage: {
    liability: boolean;
    collision: boolean;
    comprehensive: boolean;
    roadside: boolean;
    rental: boolean;
  };
  deductibles: {
    liability: number;
    collision: number;
    comprehensive: number;
  };
  status: 'active' | 'suspended' | 'cancelled';
  nextBillingDate: Timestamp;
  lastRiskAssessment: Timestamp;
  provider: string;
  policyNumber: string;
}

export interface InsuranceClaim {
  claimId: string;
  policyId: string;
  userId: string;
  vin: string;
  incidentDate: Timestamp;
  reportDate: Timestamp;
  type: 'accident' | 'theft' | 'vandalism' | 'weather' | 'other';
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedDamage: number;
  approvedAmount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'paid';
  documents: string[]; // روابط الملفات
  adjusterNotes: string;
}

export class DynamicInsuranceService {
  private db = getFirestore();
  private readonly BULGARIAN_TIMEZONE = 'Europe/Sofia';

  /**
   * تسجيل سلوك القيادة اليومي
   */
  async recordDrivingBehavior(behavior: Omit<DrivingBehavior, 'date'>): Promise<void> {
    try {
      const behaviorRef = doc(collection(this.db, 'drivingBehavior'));
      const behaviorData: DrivingBehavior = {
        ...behavior,
        date: Timestamp.now()
      };

      await setDoc(behaviorRef, behaviorData);

      // تحديث نقاط المخاطر
      await this.updateRiskScore(behavior.userId, behavior.vin);

    } catch (error) {
      console.error('خطأ في تسجيل سلوك القيادة:', error);
      throw new Error('فشل في تسجيل سلوك القيادة');
    }
  }

  /**
   * حساب وتحديث نقاط المخاطر
   */
  private async updateRiskScore(userId: string, vin: string): Promise<void> {
    try {
      // الحصول على سلوك القيادة للأشهر الثلاثة الماضية
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const behaviorQuery = query(
        collection(this.db, 'drivingBehavior'),
        where('userId', '==', userId),
        where('vin', '==', vin),
        where('date', '>=', Timestamp.fromDate(threeMonthsAgo))
      );

      const behaviorSnapshot = await getDocs(behaviorQuery);
      const behaviors = behaviorSnapshot.docs.map(doc => doc.data() as DrivingBehavior);

      if (behaviors.length === 0) return;

      // حساب متوسط السلوك
      const avgBehavior = this.calculateAverageBehavior(behaviors);

      // حساب نقاط المخاطر باستخدام Vertex AI (محاكاة)
      const riskScore = await this.calculateRiskScore(avgBehavior);

      // حفظ نقاط المخاطر
      const riskRef = doc(this.db, 'riskScores', `${userId}_${vin}`);
      await setDoc(riskRef, riskScore);

      // تحديث قسط التأمين
      await this.adjustInsurancePremium(userId, vin, riskScore);

    } catch (error) {
      console.error('خطأ في تحديث نقاط المخاطر:', error);
    }
  }

  /**
   * حساب متوسط سلوك القيادة
   */
  private calculateAverageBehavior(behaviors: DrivingBehavior[]): Omit<DrivingBehavior, 'userId' | 'vin' | 'date'> {
    const total = behaviors.length;

    return {
      totalDistance: behaviors.reduce((sum, b) => sum + b.totalDistance, 0) / total,
      averageSpeed: behaviors.reduce((sum, b) => sum + b.averageSpeed, 0) / total,
      maxSpeed: Math.max(...behaviors.map(b => b.maxSpeed)),
      harshAcceleration: behaviors.reduce((sum, b) => sum + b.harshAcceleration, 0) / total,
      harshBraking: behaviors.reduce((sum, b) => sum + b.harshBraking, 0) / total,
      speedingEvents: behaviors.reduce((sum, b) => sum + b.speedingEvents, 0) / total,
      nightDriving: behaviors.reduce((sum, b) => sum + b.nightDriving, 0) / total,
      cityDriving: behaviors.reduce((sum, b) => sum + b.cityDriving, 0) / total,
      highwayDriving: behaviors.reduce((sum, b) => sum + b.highwayDriving, 0) / total,
      idleTime: behaviors.reduce((sum, b) => sum + b.idleTime, 0) / total,
      fuelEfficiency: behaviors.reduce((sum, b) => sum + b.fuelEfficiency, 0) / total,
      accidentHistory: behaviors[behaviors.length - 1]?.accidentHistory || 0
    };
  }

  /**
   * حساب نقاط المخاطر باستخدام Vertex AI
   */
  private async calculateRiskScore(behavior: Omit<DrivingBehavior, 'userId' | 'vin' | 'date'>): Promise<RiskScore> {
    // محاكاة حساب نقاط المخاطر
    // في الإنتاج، سيتم استخدام Vertex AI للتحليل المتقدم

    let speedRisk = 0;
    if (behavior.maxSpeed > 120) speedRisk = 30;
    else if (behavior.maxSpeed > 100) speedRisk = 15;

    let accelerationRisk = (behavior.harshAcceleration + behavior.harshBraking) * 5;
    accelerationRisk = Math.min(accelerationRisk, 40);

    let distanceRisk = 0;
    if (behavior.totalDistance > 2000) distanceRisk = -10; // مكافأة للقيادة المنخفضة
    else if (behavior.totalDistance < 500) distanceRisk = 10;

    let timeRisk = 0;
    if (behavior.nightDriving > 30) timeRisk = 20;
    if (behavior.idleTime > 60) timeRisk += 10;

    let accidentRisk = behavior.accidentHistory * 25;

    const overallScore = Math.max(0, Math.min(100,
      20 + speedRisk + accelerationRisk + distanceRisk + timeRisk + accidentRisk
    ));

    return {
      userId: '', // سيتم تعيينه لاحقاً
      vin: '', // سيتم تعيينه لاحقاً
      overallScore,
      speedRisk,
      accelerationRisk,
      distanceRisk,
      timeRisk,
      accidentRisk,
      lastUpdated: Timestamp.now(),
      trend: 'stable' // في الإنتاج سيتم حساب الاتجاه
    };
  }

  /**
   * تعديل قسط التأمين بناءً على نقاط المخاطر
   */
  private async adjustInsurancePremium(userId: string, vin: string, riskScore: RiskScore): Promise<void> {
    try {
      const policyQuery = query(
        collection(this.db, 'insurancePolicies'),
        where('userId', '==', userId),
        where('vin', '==', vin),
        where('status', '==', 'active')
      );

      const policySnapshot = await getDocs(policyQuery);

      for (const policyDoc of policySnapshot.docs) {
        const policy = policyDoc.data() as DynamicInsurancePolicy;

        // حساب التعديل بناءً على نقاط المخاطر
        let riskAdjustment = 0;
        if (riskScore.overallScore < 20) riskAdjustment = -15; // خصم 15%
        else if (riskScore.overallScore < 40) riskAdjustment = -5; // خصم 5%
        else if (riskScore.overallScore > 70) riskAdjustment = 25; // زيادة 25%
        else if (riskScore.overallScore > 50) riskAdjustment = 10; // زيادة 10%

        const newPremium = policy.basePremium * (1 + riskAdjustment / 100);

        await updateDoc(policyDoc.ref, {
          currentPremium: newPremium,
          riskAdjustment,
          lastRiskAssessment: Timestamp.now()
        });

        console.log(`تم تحديث قسط التأمين للسيارة ${vin}: ${policy.currentPremium} → ${newPremium} EUR`);
      }

    } catch (error) {
      console.error('خطأ في تعديل قسط التأمين:', error);
    }
  }

  /**
   * الحصول على نقاط المخاطر لمستخدم
   */
  async getRiskScore(userId: string, vin: string): Promise<RiskScore | null> {
    try {
      const riskRef = doc(this.db, 'riskScores', `${userId}_${vin}`);
      const riskDoc = await getDoc(riskRef);

      if (riskDoc.exists()) {
        return riskDoc.data() as RiskScore;
      }

      return null;
    } catch (error) {
      console.error('خطأ في الحصول على نقاط المخاطر:', error);
      return null;
    }
  }

  /**
   * الحصول على بوليصة التأمين النشطة
   */
  async getActivePolicy(userId: string, vin: string): Promise<DynamicInsurancePolicy | null> {
    try {
      const policyQuery = query(
        collection(this.db, 'insurancePolicies'),
        where('userId', '==', userId),
        where('vin', '==', vin),
        where('status', '==', 'active')
      );

      const policySnapshot = await getDocs(policyQuery);

      if (!policySnapshot.empty) {
        return policySnapshot.docs[0].data() as DynamicInsurancePolicy;
      }

      return null;
    } catch (error) {
      console.error('خطأ في الحصول على البوليصة النشطة:', error);
      return null;
    }
  }

  /**
   * تقديم مطالبة تأمين
   */
  async fileInsuranceClaim(claimData: Omit<InsuranceClaim, 'claimId' | 'reportDate' | 'status'>): Promise<string> {
    try {
      const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const claimRef = doc(this.db, 'insuranceClaims', claimId);

      const claim: InsuranceClaim = {
        ...claimData,
        claimId,
        reportDate: Timestamp.now(),
        status: 'submitted',
        approvedAmount: 0,
        adjusterNotes: ''
      };

      await setDoc(claimRef, claim);

      // إشعار شركة التأمين (محاكاة)
      await this.notifyInsuranceProvider(claim);

      return claimId;

    } catch (error) {
      console.error('خطأ في تقديم مطالبة التأمين:', error);
      throw new Error('فشل في تقديم مطالبة التأمين');
    }
  }

  /**
   * الحصول على مطالبات التأمين لمستخدم
   */
  async getUserInsuranceClaims(userId: string): Promise<InsuranceClaim[]> {
    try {
      const claimsQuery = query(
        collection(this.db, 'insuranceClaims'),
        where('userId', '==', userId)
      );

      const claimsSnapshot = await getDocs(claimsQuery);
      return claimsSnapshot.docs.map(doc => doc.data() as InsuranceClaim);

    } catch (error) {
      console.error('خطأ في الحصول على مطالبات التأمين:', error);
      return [];
    }
  }

  /**
   * إشعار شركة التأمين بمطالبة جديدة
   */
  private async notifyInsuranceProvider(claim: InsuranceClaim): Promise<void> {
    try {
      // في الإنتاج، سيتم إرسال إشعار لشركة التأمين عبر API
      console.log(`إرسال إشعار مطالبة تأمين لشركة التأمين: ${claim.claimId}`);

    } catch (error) {
      console.error('خطأ في إشعار شركة التأمين:', error);
    }
  }

  /**
   * كشف الحوادث التلقائي وتقديم مطالبة فورية
   */
  async processAccidentClaim(vin: string, location: any, severity: 'minor' | 'moderate' | 'major'): Promise<void> {
    try {
      // الحصول على بيانات السيارة والمستخدم
      const twinQuery = query(
        collection(this.db, 'digitalTwins'),
        where('vin', '==', vin)
      );

      const twinSnapshot = await getDocs(twinQuery);
      if (twinSnapshot.empty) return;

      const twin = twinSnapshot.docs[0].data();

      // تقدير الضرر بناءً على الشدة
      let estimatedDamage = 0;
      switch (severity) {
        case 'minor': estimatedDamage = 500; break;
        case 'moderate': estimatedDamage = 2500; break;
        case 'major': estimatedDamage = 10000; break;
      }

      // تقديم مطالبة تلقائية
      const claimData = {
        policyId: '', // سيتم البحث عنه
        userId: twin.userId,
        vin,
        incidentDate: Timestamp.now(),
        type: 'accident' as const,
        description: `حادث تلقائي مكتشف - شدة: ${severity}`,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: 'موقع الحادث (GPS)'
        },
        estimatedDamage,
        approvedAmount: 0,
        adjusterNotes: '',
        documents: []
      };

      const claimId = await this.fileInsuranceClaim(claimData);
      console.log(`تم تقديم مطالبة تأمين تلقائية: ${claimId} للسيارة ${vin}`);

    } catch (error) {
      console.error('خطأ في معالجة مطالبة الحادث:', error);
    }
  }
}

export const dynamicInsuranceService = new DynamicInsuranceService();