import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

export interface DrivingBehavior {
  userId: string;
  vin: string;
  date: Timestamp;
  totalDistance: number; // km
  averageSpeed: number; // km/h
  maxSpeed: number;
  harshAcceleration: number; // count
  harshBraking: number; // count
  speedingEvents: number; // count
  nightDriving: number; // percentage
  cityDriving: number; // percentage
  highwayDriving: number; // percentage
  idleTime: number; // minutes
  fuelEfficiency: number; // liters/100km
  accidentHistory: number;
}

export interface RiskScore {
  userId: string;
  vin: string;
  overallScore: number; // 0-100 (100 = high risk)
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
  basePremium: number; // EUR per month
  currentPremium: number;
  riskAdjustment: number; // percentage (±)
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
  documents: string[]; // file links
  adjusterNotes: string;
}

export class DynamicInsuranceService {
  private readonly BULGARIAN_TIMEZONE = 'Europe/Sofia';

  /**
   * (Comment removed - was in Arabic)
   */
  async recordDrivingBehavior(behavior: Omit<DrivingBehavior, 'date'>): Promise<void> {
    try {
      const behaviorRef = doc(collection(db, 'drivingBehavior'));
      const behaviorData: DrivingBehavior = {
        ...behavior,
        date: Timestamp.now()
      };

      await setDoc(behaviorRef, behaviorData);

      // (Comment removed - was in Arabic)
      await this.updateRiskScore(behavior.userId, behavior.vin);

    } catch (error) {
      serviceLogger.error('Failed to record driving behavior', error as Error, { userId: behavior.userId, vin: behavior.vin });
      throw new Error('Failed to record driving behavior');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async updateRiskScore(userId: string, vin: string): Promise<void> {
    try {
      // (Comment removed - was in Arabic)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const behaviorQuery = query(
        collection(db, 'drivingBehavior'),
        where('userId', '==', userId),
        where('vin', '==', vin),
        where('date', '>=', Timestamp.fromDate(threeMonthsAgo))
      );

      const behaviorSnapshot = await getDocs(behaviorQuery);
      const behaviors = behaviorSnapshot.docs.map((doc: any) => doc.data() as DrivingBehavior);

      if (behaviors.length === 0) return;

      // (Comment removed - was in Arabic)
      const avgBehavior = this.calculateAverageBehavior(behaviors);

      // (Comment removed - was in Arabic)
      const riskScore = await this.calculateRiskScore(avgBehavior);

      // (Comment removed - was in Arabic)
      const riskRef = doc(db, 'riskScores', `${userId}_${vin}`);
      await setDoc(riskRef, riskScore);

      // (Comment removed - was in Arabic)
      await this.adjustInsurancePremium(userId, vin, riskScore);

    } catch (error) {
      serviceLogger.error('Failed to update risk score', error as Error, { userId, vin });
    }
  }

  /**
   * (Comment removed - was in Arabic)
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
   * (Comment removed - was in Arabic)
   */
  private async calculateRiskScore(behavior: Omit<DrivingBehavior, 'userId' | 'vin' | 'date'>): Promise<RiskScore> {
    // (Comment removed - was in Arabic)
    // (Comment removed - was in Arabic)

    let speedRisk = 0;
    if (behavior.maxSpeed > 120) speedRisk = 30;
    else if (behavior.maxSpeed > 100) speedRisk = 15;

    let accelerationRisk = (behavior.harshAcceleration + behavior.harshBraking) * 5;
    accelerationRisk = Math.min(accelerationRisk, 40);

    let distanceRisk = 0;
    if (behavior.totalDistance > 2000) distanceRisk = -10; // bonus for low driving
    else if (behavior.totalDistance < 500) distanceRisk = 10;

    let timeRisk = 0;
    if (behavior.nightDriving > 30) timeRisk = 20;
    if (behavior.idleTime > 60) timeRisk += 10;

    let accidentRisk = behavior.accidentHistory * 25;

    const overallScore = Math.max(0, Math.min(100,
      20 + speedRisk + accelerationRisk + distanceRisk + timeRisk + accidentRisk
    ));

    return {
      userId: '', // will be assigned later
      vin: '', // will be assigned later
      overallScore,
      speedRisk,
      accelerationRisk,
      distanceRisk,
      timeRisk,
      accidentRisk,
      lastUpdated: Timestamp.now(),
      trend: 'stable' // in production, trend will be calculated
    };
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async adjustInsurancePremium(userId: string, vin: string, riskScore: RiskScore): Promise<void> {
    try {
      const policyQuery = query(
        collection(db, 'insurancePolicies'),
        where('userId', '==', userId),
        where('vin', '==', vin),
        where('status', '==', 'active')
      );

      const policySnapshot = await getDocs(policyQuery);

      for (const policyDoc of policySnapshot.docs) {
        const policy = policyDoc.data() as DynamicInsurancePolicy;

        // (Comment removed - was in Arabic)
        let riskAdjustment = 0;
        if (riskScore.overallScore < 20) riskAdjustment = -15; // 15% discount
        else if (riskScore.overallScore < 40) riskAdjustment = -5; // 5% discount
        else if (riskScore.overallScore > 70) riskAdjustment = 25; // 25% increase
        else if (riskScore.overallScore > 50) riskAdjustment = 10; // 10% increase

        const newPremium = policy.basePremium * (1 + riskAdjustment / 100);

        await updateDoc(policyDoc.ref, {
          currentPremium: newPremium,
          riskAdjustment,
          lastRiskAssessment: Timestamp.now()
        });
}

    } catch (error) {
      serviceLogger.error('Failed to adjust insurance premium', error as Error, { userId, vin, overallScore: riskScore.overallScore });
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async getRiskScore(userId: string, vin: string): Promise<RiskScore | null> {
    try {
      const riskRef = doc(db, 'riskScores', `${userId}_${vin}`);
      const riskDoc = await getDoc(riskRef);

      if (riskDoc.exists()) {
        return riskDoc.data() as RiskScore;
      }

      return null;
    } catch (error) {
      serviceLogger.error('Failed to get risk score', error as Error, { userId, vin });
      return null;
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async getActivePolicy(userId: string, vin: string): Promise<DynamicInsurancePolicy | null> {
    try {
      const policyQuery = query(
        collection(db, 'insurancePolicies'),
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
      serviceLogger.error('Failed to get active policy', error as Error, { userId, vin });
      return null;
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async fileInsuranceClaim(claimData: Omit<InsuranceClaim, 'claimId' | 'reportDate' | 'status'>): Promise<string> {
    try {
      const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const claimRef = doc(db, 'insuranceClaims', claimId);

      const claim: InsuranceClaim = {
        ...claimData,
        claimId,
        reportDate: Timestamp.now(),
        status: 'submitted',
        approvedAmount: 0,
        adjusterNotes: ''
      };

      await setDoc(claimRef, claim);

      // (Comment removed - was in Arabic)
      await this.notifyInsuranceProvider(claim);

      return claimId;

    } catch (error) {
      serviceLogger.error('Failed to file insurance claim', error as Error, { userId: claimData.userId, vin: claimData.vin });
      throw new Error('Failed to file insurance claim');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async getUserInsuranceClaims(userId: string): Promise<InsuranceClaim[]> {
    try {
      const claimsQuery = query(
        collection(db, 'insuranceClaims'),
        where('userId', '==', userId)
      );

      const claimsSnapshot = await getDocs(claimsQuery);
      return claimsSnapshot.docs.map((doc: any) => doc.data() as InsuranceClaim);

    } catch (error) {
      serviceLogger.error('Failed to get user insurance claims', error as Error, { userId });
      return [];
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async notifyInsuranceProvider(claim: InsuranceClaim): Promise<void> {
    try {
      // (Comment removed - was in Arabic)
} catch (error) {
      serviceLogger.error('Failed to notify insurance provider', error as Error, { claimId: claim.claimId });
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async processAccidentClaim(vin: string, location: any, severity: 'minor' | 'moderate' | 'major'): Promise<void> {
    try {
      // (Comment removed - was in Arabic)
      const twinQuery = query(
        collection(db, 'digitalTwins'),
        where('vin', '==', vin)
      );

      const twinSnapshot = await getDocs(twinQuery);
      if (twinSnapshot.empty) return;

      const twin = twinSnapshot.docs[0].data();

      // (Comment removed - was in Arabic)
      let estimatedDamage = 0;
      switch (severity) {
        case 'minor': estimatedDamage = 500; break;
        case 'moderate': estimatedDamage = 2500; break;
        case 'major': estimatedDamage = 10000; break;
      }

      // (Comment removed - was in Arabic)
      const claimData = {
        policyId: '', // will be looked up
        userId: twin.userId,
        vin,
        incidentDate: Timestamp.now(),
        type: 'accident' as const,
        description: `Auto-detected accident - severity: ${severity}`,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: 'Accident location (GPS)'
        },
        estimatedDamage,
        approvedAmount: 0,
        adjusterNotes: '',
        documents: []
      };

      const claimId = await this.fileInsuranceClaim(claimData);
} catch (error) {
      serviceLogger.error('Failed to process accident claim', error as Error, { vin, severity });
    }
  }
}

export const dynamicInsuranceService = new DynamicInsuranceService();