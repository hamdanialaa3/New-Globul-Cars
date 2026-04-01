// src/services/certified/koli-certified.service.ts
// Koli Certified — Automated Vehicle History & Trust Badge System
// Integrates carVertical API for vehicle history, inspection partnerships

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import { upstashCache, CACHE_TTL } from '../cache/upstash-cache.service';

// ─── Types ───────────────────────────────────────────────────────────

export type CertificationLevel = 'basic' | 'standard' | 'premium' | 'platinum';
export type InspectionStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'passed'
  | 'failed'
  | 'expired';
export type HistoryCheckStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'unavailable';

export interface VehicleHistoryReport {
  id: string;
  vin: string;
  carId: string;
  sellerId: string;
  provider: 'carvertical' | 'drivingdna' | 'internal';
  status: HistoryCheckStatus;
  reportUrl?: string;
  data: {
    odometerReadings: OdometerReading[];
    odometerTampered: boolean;
    accidentHistory: AccidentRecord[];
    hasAccidents: boolean;
    totalAccidents: number;
    stolenCheck: boolean;
    isStolen: boolean;
    previousOwners: number;
    registrationCountries: string[];
    serviceRecords: ServiceRecord[];
    recallsOpen: number;
    emissionClass: string;
    firstRegistration?: string;
    insuranceClaims: number;
  };
  score: number; // 0-100 trust score
  generatedAt: Date;
  expiresAt: Date;
  cost: number; // EUR
}

export interface OdometerReading {
  date: string;
  mileageKm: number;
  source: string;
  suspicious: boolean;
}

export interface AccidentRecord {
  date: string;
  severity: 'minor' | 'moderate' | 'severe' | 'total_loss';
  description: string;
  repaired: boolean;
  country: string;
}

export interface ServiceRecord {
  date: string;
  mileageKm: number;
  type: 'scheduled' | 'repair' | 'recall';
  description: string;
  serviceCenter: string;
}

export interface InspectionReport {
  id: string;
  carId: string;
  vin: string;
  inspectionCenter: InspectionCenter;
  status: InspectionStatus;
  scheduledDate?: Date;
  completedDate?: Date;
  inspector?: string;
  checkpoints: InspectionCheckpoint[];
  totalPoints: number;
  maxPoints: number;
  passPercentage: number;
  passed: boolean;
  photos: string[];
  notes: string;
  validUntil?: Date;
}

export interface InspectionCheckpoint {
  category:
    | 'exterior'
    | 'interior'
    | 'engine'
    | 'transmission'
    | 'brakes'
    | 'suspension'
    | 'electrical'
    | 'safety'
    | 'tires'
    | 'emissions';
  name: string;
  nameBg: string;
  maxPoints: number;
  scoredPoints: number;
  status: 'pass' | 'warning' | 'fail';
  notes?: string;
}

export interface InspectionCenter {
  id: string;
  name: string;
  nameBg: string;
  type: 'tuv_nord' | 'dekra' | 'autobox' | 'koli_partner';
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  workingHours: string;
  certifications: string[];
  averageRating: number;
  totalInspections: number;
  isActive: boolean;
}

export interface KoliCertifiedBadge {
  carId: string;
  vin: string;
  level: CertificationLevel;
  historyReport?: VehicleHistoryReport;
  inspectionReport?: InspectionReport;
  overallScore: number; // 0-100
  badgeUrl: string;
  issuedAt: Date;
  validUntil: Date;
  isValid: boolean;
  benefits: {
    en: string[];
    bg: string[];
  };
}

// ─── Constants ───────────────────────────────────────────────────────

const CERTIFICATION_LEVELS: Record<
  CertificationLevel,
  {
    minScore: number;
    requiresHistory: boolean;
    requiresInspection: boolean;
    validityDays: number;
    priceBump: number; // estimated % price increase
  }
> = {
  basic: {
    minScore: 40,
    requiresHistory: true,
    requiresInspection: false,
    validityDays: 180,
    priceBump: 3,
  },
  standard: {
    minScore: 60,
    requiresHistory: true,
    requiresInspection: false,
    validityDays: 180,
    priceBump: 5,
  },
  premium: {
    minScore: 75,
    requiresHistory: true,
    requiresInspection: true,
    validityDays: 365,
    priceBump: 8,
  },
  platinum: {
    minScore: 90,
    requiresHistory: true,
    requiresInspection: true,
    validityDays: 365,
    priceBump: 12,
  },
};

const INSPECTION_CHECKPOINTS: Omit<
  InspectionCheckpoint,
  'scoredPoints' | 'status' | 'notes'
>[] = [
  {
    category: 'exterior',
    name: 'Body Condition',
    nameBg: 'Състояние на каросерията',
    maxPoints: 10,
  },
  {
    category: 'exterior',
    name: 'Paint Quality',
    nameBg: 'Качество на боята',
    maxPoints: 10,
  },
  {
    category: 'exterior',
    name: 'Glass & Lights',
    nameBg: 'Стъкла и светлини',
    maxPoints: 10,
  },
  {
    category: 'interior',
    name: 'Seats & Upholstery',
    nameBg: 'Седалки и тапицерия',
    maxPoints: 10,
  },
  {
    category: 'interior',
    name: 'Dashboard & Controls',
    nameBg: 'Табло и контроли',
    maxPoints: 10,
  },
  {
    category: 'engine',
    name: 'Engine Performance',
    nameBg: 'Работа на двигателя',
    maxPoints: 10,
  },
  {
    category: 'engine',
    name: 'Fluids & Leaks',
    nameBg: 'Течности и течове',
    maxPoints: 10,
  },
  {
    category: 'transmission',
    name: 'Gearbox',
    nameBg: 'Скоростна кутия',
    maxPoints: 10,
  },
  {
    category: 'brakes',
    name: 'Brake System',
    nameBg: 'Спирачна система',
    maxPoints: 10,
  },
  {
    category: 'suspension',
    name: 'Suspension',
    nameBg: 'Окачване',
    maxPoints: 10,
  },
  {
    category: 'electrical',
    name: 'Electrical Systems',
    nameBg: 'Електрическа система',
    maxPoints: 10,
  },
  {
    category: 'safety',
    name: 'Airbags & Safety',
    nameBg: 'Въздушни възглавници',
    maxPoints: 10,
  },
  {
    category: 'tires',
    name: 'Tires & Wheels',
    nameBg: 'Гуми и джанти',
    maxPoints: 10,
  },
  {
    category: 'emissions',
    name: 'Emissions Test',
    nameBg: 'Тест на емисиите',
    maxPoints: 10,
  },
];

// ─── Service ─────────────────────────────────────────────────────────

class KoliCertifiedService {
  private static instance: KoliCertifiedService;
  private carVerticalApiKey: string | null = null;

  private constructor() {
    this.carVerticalApiKey = import.meta.env.VITE_CARVERTICAL_API_KEY || null;
  }

  static getInstance(): KoliCertifiedService {
    if (!KoliCertifiedService.instance) {
      KoliCertifiedService.instance = new KoliCertifiedService();
    }
    return KoliCertifiedService.instance;
  }

  // ─── Vehicle History ──────────────────────────────────────────────

  /**
   * Request a vehicle history report via carVertical API
   */
  async requestHistoryReport(
    vin: string,
    carId: string,
    sellerId: string
  ): Promise<VehicleHistoryReport> {
    try {
      serviceLogger.info('Koli Certified: Requesting history report', {
        vin,
        carId,
      });

      // Check cache first
      const cached = await upstashCache.get<VehicleHistoryReport>(
        `history:${vin}`,
        { namespace: 'certified' }
      );
      if (cached) return cached;

      let report: VehicleHistoryReport;

      if (this.carVerticalApiKey) {
        report = await this.fetchCarVerticalReport(vin, carId, sellerId);
      } else {
        // Fallback: generate internal report from available data
        report = await this.generateInternalReport(vin, carId, sellerId);
      }

      // Store in Firestore
      await setDoc(doc(db, 'vehicle_history_reports', report.id), {
        ...report,
        generatedAt: serverTimestamp(),
      });

      // Cache for 24 hours
      await upstashCache.set(`history:${vin}`, report, {
        namespace: 'certified',
        ttl: CACHE_TTL.VIN_HISTORY,
      });

      return report;
    } catch (error) {
      serviceLogger.error(
        'Koli Certified: History report error',
        error as Error,
        { vin }
      );
      throw error;
    }
  }

  /**
   * Fetch report from carVertical API
   */
  private async fetchCarVerticalReport(
    vin: string,
    carId: string,
    sellerId: string
  ): Promise<VehicleHistoryReport> {
    const response = await fetch('https://api.carvertical.com/v1/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.carVerticalApiKey}`,
      },
      body: JSON.stringify({ vin }),
    });

    if (!response.ok) {
      throw new Error(`carVertical API error: ${response.status}`);
    }

    const apiData = await response.json();

    return this.mapCarVerticalResponse(apiData, vin, carId, sellerId);
  }

  /**
   * Map carVertical API response to our internal format
   */
  private mapCarVerticalResponse(
    apiData: Record<string, unknown>,
    vin: string,
    carId: string,
    sellerId: string
  ): VehicleHistoryReport {
    const data = apiData as any;
    const id = `hist_${vin}_${Date.now()}`;

    return {
      id,
      vin,
      carId,
      sellerId,
      provider: 'carvertical',
      status: 'completed',
      reportUrl: data.reportUrl,
      data: {
        odometerReadings: (data.mileageRecords || []).map((r: any) => ({
          date: r.date,
          mileageKm: r.mileage,
          source: r.source || 'carvertical',
          suspicious: r.suspicious || false,
        })),
        odometerTampered: data.mileageTampered || false,
        accidentHistory: (data.damages || []).map((d: any) => ({
          date: d.date,
          severity: d.severity || 'minor',
          description: d.description || '',
          repaired: d.repaired || false,
          country: d.country || 'BG',
        })),
        hasAccidents: (data.damages || []).length > 0,
        totalAccidents: (data.damages || []).length,
        stolenCheck: true,
        isStolen: data.stolen || false,
        previousOwners: data.owners || 0,
        registrationCountries: data.registrationCountries || ['BG'],
        serviceRecords: (data.serviceRecords || []).map((s: any) => ({
          date: s.date,
          mileageKm: s.mileage || 0,
          type: s.type || 'scheduled',
          description: s.description || '',
          serviceCenter: s.serviceCenter || '',
        })),
        recallsOpen: data.openRecalls || 0,
        emissionClass: data.emissionClass || '',
        firstRegistration: data.firstRegistration,
        insuranceClaims: data.insuranceClaims || 0,
      },
      score: this.calculateHistoryScore(data),
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      cost: 14.99,
    };
  }

  /**
   * Generate internal report from VIN decoder + Firestore data
   */
  private async generateInternalReport(
    vin: string,
    carId: string,
    sellerId: string
  ): Promise<VehicleHistoryReport> {
    const id = `hist_internal_${vin}_${Date.now()}`;

    // Check our own VIN records
    const vinDoc = await getDoc(doc(db, 'vin_checks', vin));
    const vinData = vinDoc.exists() ? vinDoc.data() : {};

    return {
      id,
      vin,
      carId,
      sellerId,
      provider: 'internal',
      status: 'completed',
      data: {
        odometerReadings: [],
        odometerTampered: false,
        accidentHistory: [],
        hasAccidents: false,
        totalAccidents: 0,
        stolenCheck: true,
        isStolen: vinData.stolen || false,
        previousOwners: vinData.owners || 0,
        registrationCountries: ['BG'],
        serviceRecords: [],
        recallsOpen: 0,
        emissionClass: vinData.emissionClass || '',
        firstRegistration: vinData.firstRegistration,
        insuranceClaims: 0,
      },
      score: 50, // Baseline for internal reports
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      cost: 0,
    };
  }

  // ─── Inspection System ────────────────────────────────────────────

  /**
   * Get available inspection centers near a location
   */
  async getInspectionCenters(city?: string): Promise<InspectionCenter[]> {
    try {
      let q;
      if (city) {
        q = query(
          collection(db, 'inspection_centers'),
          where('isActive', '==', true),
          where('city', '==', city)
        );
      } else {
        q = query(
          collection(db, 'inspection_centers'),
          where('isActive', '==', true),
          orderBy('averageRating', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        d => ({ ...d.data(), id: d.id }) as InspectionCenter
      );
    } catch (error) {
      serviceLogger.error(
        'Koli Certified: Error fetching inspection centers',
        error as Error
      );
      return [];
    }
  }

  /**
   * Schedule a 100-point inspection
   */
  async scheduleInspection(
    carId: string,
    vin: string,
    centerId: string,
    preferredDate: Date
  ): Promise<InspectionReport> {
    try {
      const centerDoc = await getDoc(doc(db, 'inspection_centers', centerId));
      if (!centerDoc.exists()) {
        throw new Error('Inspection center not found');
      }

      const center = {
        ...centerDoc.data(),
        id: centerDoc.id,
      } as InspectionCenter;
      const id = `insp_${carId}_${Date.now()}`;

      const report: InspectionReport = {
        id,
        carId,
        vin,
        inspectionCenter: center,
        status: 'scheduled',
        scheduledDate: preferredDate,
        checkpoints: INSPECTION_CHECKPOINTS.map(cp => ({
          ...cp,
          scoredPoints: 0,
          status: 'pass' as const,
        })),
        totalPoints: 0,
        maxPoints: INSPECTION_CHECKPOINTS.reduce(
          (sum, cp) => sum + cp.maxPoints,
          0
        ),
        passPercentage: 0,
        passed: false,
        photos: [],
        notes: '',
      };

      await setDoc(doc(db, 'inspection_reports', id), {
        ...report,
        scheduledDate: Timestamp.fromDate(preferredDate),
        createdAt: serverTimestamp(),
      });

      serviceLogger.info('Koli Certified: Inspection scheduled', {
        id,
        carId,
        centerId,
      });
      return report;
    } catch (error) {
      serviceLogger.error(
        'Koli Certified: Error scheduling inspection',
        error as Error
      );
      throw error;
    }
  }

  /**
   * Submit completed inspection results
   */
  async submitInspectionResults(
    inspectionId: string,
    checkpoints: InspectionCheckpoint[],
    photos: string[],
    notes: string
  ): Promise<InspectionReport> {
    try {
      const docRef = doc(db, 'inspection_reports', inspectionId);
      const inspDoc = await getDoc(docRef);

      if (!inspDoc.exists()) {
        throw new Error('Inspection not found');
      }

      const existing = inspDoc.data() as InspectionReport;
      const totalPoints = checkpoints.reduce(
        (sum, cp) => sum + cp.scoredPoints,
        0
      );
      const maxPoints = checkpoints.reduce((sum, cp) => sum + cp.maxPoints, 0);
      const passPercentage = Math.round((totalPoints / maxPoints) * 100);
      const passed =
        passPercentage >= 60 &&
        !checkpoints.some(
          cp => cp.status === 'fail' && cp.category === 'safety'
        );

      const updated: Partial<InspectionReport> = {
        status: passed ? 'passed' : 'failed',
        completedDate: new Date(),
        checkpoints,
        totalPoints,
        maxPoints,
        passPercentage,
        passed,
        photos,
        notes,
        validUntil: passed
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : undefined,
      };

      await updateDoc(docRef, {
        ...updated,
        completedDate: serverTimestamp(),
        validUntil: passed
          ? Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
          : null,
      });

      serviceLogger.info('Koli Certified: Inspection completed', {
        inspectionId,
        passed,
        score: passPercentage,
      });

      return { ...existing, ...updated } as InspectionReport;
    } catch (error) {
      serviceLogger.error(
        'Koli Certified: Error submitting inspection',
        error as Error
      );
      throw error;
    }
  }

  // ─── Certification Badge ──────────────────────────────────────────

  /**
   * Issue Koli Certified badge for a vehicle
   */
  async issueCertification(
    carId: string,
    vin: string,
    historyReport?: VehicleHistoryReport,
    inspectionReport?: InspectionReport
  ): Promise<KoliCertifiedBadge> {
    try {
      const overallScore = this.calculateOverallScore(
        historyReport,
        inspectionReport
      );
      const level = this.determineCertificationLevel(
        overallScore,
        !!historyReport,
        !!inspectionReport
      );
      const config = CERTIFICATION_LEVELS[level];

      const badge: KoliCertifiedBadge = {
        carId,
        vin,
        level,
        historyReport,
        inspectionReport,
        overallScore,
        badgeUrl: `/badges/koli-certified-${level}.svg`,
        issuedAt: new Date(),
        validUntil: new Date(
          Date.now() + config.validityDays * 24 * 60 * 60 * 1000
        ),
        isValid: true,
        benefits: {
          en: this.getBenefits(level, 'en'),
          bg: this.getBenefits(level, 'bg'),
        },
      };

      await setDoc(doc(db, 'koli_certified_badges', carId), {
        ...badge,
        issuedAt: serverTimestamp(),
        validUntil: Timestamp.fromDate(badge.validUntil),
      });

      // Update car listing with certification badge
      await updateDoc(doc(db, 'passenger_cars', carId), {
        koliCertified: true,
        certificationLevel: level,
        certificationScore: overallScore,
        certifiedAt: serverTimestamp(),
      });

      serviceLogger.info('Koli Certified: Badge issued', {
        carId,
        level,
        score: overallScore,
      });
      return badge;
    } catch (error) {
      serviceLogger.error(
        'Koli Certified: Error issuing badge',
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get certification badge for a car
   */
  async getCertification(carId: string): Promise<KoliCertifiedBadge | null> {
    try {
      const cached = await upstashCache.get<KoliCertifiedBadge>(
        `badge:${carId}`,
        { namespace: 'certified' }
      );
      if (cached) return cached;

      const badgeDoc = await getDoc(doc(db, 'koli_certified_badges', carId));
      if (!badgeDoc.exists()) return null;

      const badge = badgeDoc.data() as KoliCertifiedBadge;

      await upstashCache.set(`badge:${carId}`, badge, {
        namespace: 'certified',
        ttl: 300,
      });

      return badge;
    } catch (error) {
      serviceLogger.error(
        'Koli Certified: Error getting badge',
        error as Error
      );
      return null;
    }
  }

  /**
   * Get all certified cars (for search filter)
   */
  async getCertifiedCars(
    minLevel: CertificationLevel = 'basic',
    limitCount: number = 50
  ): Promise<string[]> {
    try {
      const minScore = CERTIFICATION_LEVELS[minLevel].minScore;

      const q = query(
        collection(db, 'koli_certified_badges'),
        where('isValid', '==', true),
        where('overallScore', '>=', minScore),
        orderBy('overallScore', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data().carId as string);
    } catch (error) {
      serviceLogger.error(
        'Koli Certified: Error getting certified cars',
        error as Error
      );
      return [];
    }
  }

  // ─── Scoring ──────────────────────────────────────────────────────

  private calculateHistoryScore(data: any): number {
    let score = 100;

    if (data.mileageTampered) score -= 40;
    if (data.stolen) score = 0;
    if (data.damages?.length > 0) score -= data.damages.length * 10;
    if (data.openRecalls > 0) score -= data.openRecalls * 5;
    if (data.insuranceClaims > 2) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  private calculateOverallScore(
    history?: VehicleHistoryReport,
    inspection?: InspectionReport
  ): number {
    if (!history && !inspection) return 0;

    let score = 0;
    let weight = 0;

    if (history) {
      score += history.score * 0.5;
      weight += 0.5;
    }

    if (inspection) {
      score += inspection.passPercentage * 0.5;
      weight += 0.5;
    }

    return weight > 0 ? Math.round(score / weight) : 0;
  }

  private determineCertificationLevel(
    score: number,
    hasHistory: boolean,
    hasInspection: boolean
  ): CertificationLevel {
    if (score >= 90 && hasHistory && hasInspection) return 'platinum';
    if (score >= 75 && hasHistory && hasInspection) return 'premium';
    if (score >= 60 && hasHistory) return 'standard';
    if (score >= 40 && hasHistory) return 'basic';
    return 'basic';
  }

  private getBenefits(level: CertificationLevel, lang: 'en' | 'bg'): string[] {
    const benefits: Record<CertificationLevel, { en: string[]; bg: string[] }> =
      {
        basic: {
          en: ['VIN history check', 'Stolen vehicle check'],
          bg: [
            'Проверка на историята по VIN',
            'Проверка за откраднат автомобил',
          ],
        },
        standard: {
          en: [
            'Full vehicle history report',
            'Mileage verification',
            'Accident check',
            'Priority listing',
          ],
          bg: [
            'Пълен доклад за историята',
            'Верификация на километража',
            'Проверка за катастрофи',
            'Приоритетно обявление',
          ],
        },
        premium: {
          en: [
            '100-point professional inspection',
            'Full history report',
            'Certified dealer badge',
            '12-month warranty eligible',
          ],
          bg: [
            '100-точков професионален преглед',
            'Пълен доклад за историята',
            'Сертифициран бадж',
            'Право на 12-месечна гаранция',
          ],
        },
        platinum: {
          en: [
            'Premium 100-point inspection',
            'Complete history',
            'Bumper-to-bumper certification',
            'Extended warranty',
            'Featured placement',
          ],
          bg: [
            'Премиум 100-точков преглед',
            'Пълна история',
            'Пълна сертификация',
            'Удължена гаранция',
            'Подчертано показване',
          ],
        },
      };

    return benefits[level][lang];
  }
}

export const koliCertifiedService = KoliCertifiedService.getInstance();
