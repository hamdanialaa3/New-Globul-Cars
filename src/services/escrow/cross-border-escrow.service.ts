// src/services/escrow/cross-border-escrow.service.ts
// Cross-Border Escrow Engine — Secure international car purchases
// 1-Click Import from EU with escrow protection, customs calculation, logistics tracking

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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

// ─── Types ───────────────────────────────────────────────────────────

export type EscrowStatus =
  | 'initiated'
  | 'buyer_funded'
  | 'seller_confirmed'
  | 'in_transit'
  | 'inspection_pending'
  | 'inspection_passed'
  | 'inspection_failed'
  | 'released'
  | 'refunded'
  | 'disputed'
  | 'cancelled';

export type ImportCountry =
  | 'DE'
  | 'IT'
  | 'FR'
  | 'NL'
  | 'BE'
  | 'AT'
  | 'ES'
  | 'CZ'
  | 'PL'
  | 'RO'
  | 'HU';

export interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  carId: string;
  vin: string;
  status: EscrowStatus;
  amounts: {
    carPrice: number;
    customsDuty: number;
    vat: number;
    transportCost: number;
    inspectionFee: number;
    platformFee: number;
    totalCost: number;
    currency: 'EUR';
  };
  importDetails: {
    originCountry: ImportCountry;
    originCity: string;
    destinationCity: string;
    destinationCountry: 'BG';
    transportMethod: 'truck' | 'train' | 'self_drive';
    estimatedDays: number;
    trackingNumber?: string;
    customsReference?: string;
  };
  timeline: EscrowTimelineEvent[];
  inspection: {
    required: boolean;
    centerId?: string;
    scheduledDate?: Date;
    result?: 'passed' | 'failed';
    notes?: string;
  };
  dispute?: {
    reason: string;
    raisedBy: 'buyer' | 'seller';
    raisedAt: Date;
    resolution?: string;
    resolvedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface EscrowTimelineEvent {
  status: EscrowStatus;
  timestamp: Date;
  description: string;
  descriptionBg: string;
  actor: 'buyer' | 'seller' | 'platform' | 'system';
}

export interface ImportCostCalculation {
  carPrice: number;
  originCountry: ImportCountry;
  destinationCity: string;
  vehicleType: 'car' | 'suv' | 'van' | 'motorcycle';
  engineType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  engineCc?: number;
  yearOfManufacture: number;
  co2Emissions?: number;
  result: {
    carPrice: number;
    customsDuty: number; // 0 for EU-EU (single market)
    registrationTax: number; // Bulgarian registration tax
    vat: number; // 20% VAT on some imports
    environmentalTax: number; // Based on Euro class + age
    transportCost: number;
    inspectionFee: number;
    platformFee: number;
    totalLandedCost: number;
    currency: 'EUR';
    breakdown: CostBreakdownItem[];
  };
}

export interface CostBreakdownItem {
  label: string;
  labelBg: string;
  amount: number;
  type: 'tax' | 'fee' | 'service' | 'base';
  isEstimate: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────

// Bulgaria environmental tax rates by Euro class (approximate EUR values)
const ENVIRONMENTAL_TAX: Record<string, number> = {
  euro6: 0,
  euro5: 50,
  euro4: 150,
  euro3: 300,
  euro2: 500,
  euro1: 800,
  pre_euro: 1200,
};

// Estimated transport costs from major EU cities to Sofia (EUR)
const TRANSPORT_COSTS: Record<ImportCountry, number> = {
  DE: 600,
  IT: 550,
  FR: 900,
  NL: 750,
  BE: 750,
  AT: 400,
  ES: 1100,
  CZ: 350,
  PL: 400,
  RO: 200,
  HU: 300,
};

// Transit days from major EU countries to Bulgaria
const TRANSIT_DAYS: Record<ImportCountry, number> = {
  DE: 3,
  IT: 3,
  FR: 4,
  NL: 4,
  BE: 4,
  AT: 2,
  ES: 5,
  CZ: 2,
  PL: 3,
  RO: 1,
  HU: 1,
};

const PLATFORM_FEE_PERCENTAGE = 0.025; // 2.5%
const INSPECTION_FEE = 79; // EUR
const BULGARIAN_VAT = 0.2;
const ESCROW_EXPIRY_DAYS = 30;

// ─── Service ─────────────────────────────────────────────────────────

class CrossBorderEscrowService {
  private static instance: CrossBorderEscrowService;

  private constructor() {}

  static getInstance(): CrossBorderEscrowService {
    if (!CrossBorderEscrowService.instance) {
      CrossBorderEscrowService.instance = new CrossBorderEscrowService();
    }
    return CrossBorderEscrowService.instance;
  }

  // ─── Cost Calculator ──────────────────────────────────────────────

  /**
   * Calculate total landed cost for importing a car to Bulgaria
   * EU-EU: no customs duty, but registration tax + environmental tax apply
   */
  calculateImportCost(
    params: Omit<ImportCostCalculation, 'result'>
  ): ImportCostCalculation['result'] {
    const {
      carPrice,
      originCountry,
      vehicleType,
      engineType,
      engineCc,
      yearOfManufacture,
      co2Emissions,
    } = params;

    // EU single market: no customs duty between EU members
    const customsDuty = 0;

    // Bulgarian registration tax (based on engine size + age)
    const registrationTax = this.calculateRegistrationTax(
      engineCc || 1600,
      yearOfManufacture
    );

    // VAT: For used cars from EU, VAT is typically applied in destination country
    // If seller is VAT registered and charges VAT, buyer can reclaim
    // For private sales (non-VAT registered), no VAT on the car itself
    const vat = 0; // Simplified: most used car imports are private-to-private

    // Environmental tax
    const euroClass = this.determineEuroClass(yearOfManufacture, engineType);
    const environmentalTax =
      engineType === 'electric' ? 0 : ENVIRONMENTAL_TAX[euroClass] || 0;

    // Transport
    const transportCost = TRANSPORT_COSTS[originCountry] || 700;

    // Platform fee
    const platformFee = Math.round(carPrice * PLATFORM_FEE_PERCENTAGE);

    const totalLandedCost =
      carPrice +
      customsDuty +
      registrationTax +
      vat +
      environmentalTax +
      transportCost +
      INSPECTION_FEE +
      platformFee;

    const breakdown: CostBreakdownItem[] = [
      {
        label: 'Vehicle Price',
        labelBg: 'Цена на автомобила',
        amount: carPrice,
        type: 'base',
        isEstimate: false,
      },
      {
        label: 'Registration Tax',
        labelBg: 'Такса за регистрация',
        amount: registrationTax,
        type: 'tax',
        isEstimate: true,
      },
      {
        label: 'Environmental Tax',
        labelBg: 'Екологична такса',
        amount: environmentalTax,
        type: 'tax',
        isEstimate: true,
      },
      {
        label: 'Transport',
        labelBg: 'Транспорт',
        amount: transportCost,
        type: 'service',
        isEstimate: true,
      },
      {
        label: 'Koli Inspection',
        labelBg: 'Преглед Koli',
        amount: INSPECTION_FEE,
        type: 'fee',
        isEstimate: false,
      },
      {
        label: 'Platform Fee',
        labelBg: 'Такса на платформата',
        amount: platformFee,
        type: 'fee',
        isEstimate: false,
      },
    ];

    return {
      carPrice,
      customsDuty,
      registrationTax,
      vat,
      environmentalTax,
      transportCost,
      inspectionFee: INSPECTION_FEE,
      platformFee,
      totalLandedCost,
      currency: 'EUR',
      breakdown,
    };
  }

  // ─── Escrow Transactions ──────────────────────────────────────────

  /**
   * Initiate a cross-border escrow transaction
   */
  async initiateEscrow(params: {
    buyerId: string;
    sellerId: string;
    carId: string;
    vin: string;
    carPrice: number;
    originCountry: ImportCountry;
    originCity: string;
    destinationCity: string;
    transportMethod: 'truck' | 'train' | 'self_drive';
    engineType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    engineCc?: number;
    yearOfManufacture: number;
  }): Promise<EscrowTransaction> {
    try {
      const costResult = this.calculateImportCost({
        carPrice: params.carPrice,
        originCountry: params.originCountry,
        destinationCity: params.destinationCity,
        vehicleType: 'car',
        engineType: params.engineType,
        yearOfManufacture: params.yearOfManufacture,
        engineCc: params.engineCc,
      });

      const id = `escrow_${params.buyerId}_${Date.now()}`;
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + ESCROW_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      );

      const transaction: EscrowTransaction = {
        id,
        buyerId: params.buyerId,
        sellerId: params.sellerId,
        carId: params.carId,
        vin: params.vin,
        status: 'initiated',
        amounts: {
          carPrice: params.carPrice,
          customsDuty: costResult.customsDuty,
          vat: costResult.vat,
          transportCost: costResult.transportCost,
          inspectionFee: costResult.inspectionFee,
          platformFee: costResult.platformFee,
          totalCost: costResult.totalLandedCost,
          currency: 'EUR',
        },
        importDetails: {
          originCountry: params.originCountry,
          originCity: params.originCity,
          destinationCity: params.destinationCity,
          destinationCountry: 'BG',
          transportMethod: params.transportMethod,
          estimatedDays: TRANSIT_DAYS[params.originCountry] || 5,
        },
        timeline: [
          {
            status: 'initiated',
            timestamp: now,
            description: 'Escrow transaction initiated',
            descriptionBg: 'Ескроу транзакцията е стартирана',
            actor: 'buyer',
          },
        ],
        inspection: { required: true },
        createdAt: now,
        updatedAt: now,
        expiresAt,
      };

      await setDoc(doc(db, 'escrow_transactions', id), {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      serviceLogger.info('Escrow: Transaction initiated', {
        id,
        carId: params.carId,
      });
      return transaction;
    } catch (error) {
      serviceLogger.error('Escrow: Error initiating', error as Error);
      throw error;
    }
  }

  /**
   * Update escrow status with timeline tracking
   */
  async updateStatus(
    escrowId: string,
    newStatus: EscrowStatus,
    actor: 'buyer' | 'seller' | 'platform',
    notes?: string
  ): Promise<void> {
    try {
      const escrowRef = doc(db, 'escrow_transactions', escrowId);
      const escrowDoc = await getDoc(escrowRef);

      if (!escrowDoc.exists()) {
        throw new Error('Escrow transaction not found');
      }

      const current = escrowDoc.data() as EscrowTransaction;

      // Validate state transition
      if (!this.isValidTransition(current.status, newStatus)) {
        throw new Error(
          `Invalid status transition: ${current.status} → ${newStatus}`
        );
      }

      const descriptions: Record<EscrowStatus, { en: string; bg: string }> = {
        initiated: {
          en: 'Transaction initiated',
          bg: 'Транзакцията е стартирана',
        },
        buyer_funded: {
          en: 'Buyer deposited funds into escrow',
          bg: 'Купувачът е депозирал средства',
        },
        seller_confirmed: {
          en: 'Seller confirmed and shipped vehicle',
          bg: 'Продавачът потвърди и изпрати автомобила',
        },
        in_transit: { en: 'Vehicle in transit', bg: 'Автомобилът е в транзит' },
        inspection_pending: {
          en: 'Vehicle arrived, pending inspection',
          bg: 'Автомобилът пристигна, чака преглед',
        },
        inspection_passed: {
          en: 'Inspection passed',
          bg: 'Прегледът е успешен',
        },
        inspection_failed: {
          en: 'Inspection failed',
          bg: 'Прегледът не е успешен',
        },
        released: {
          en: 'Funds released to seller',
          bg: 'Средствата са освободени на продавача',
        },
        refunded: {
          en: 'Funds refunded to buyer',
          bg: 'Средствата са върнати на купувача',
        },
        disputed: { en: 'Transaction disputed', bg: 'Транзакцията е оспорена' },
        cancelled: {
          en: 'Transaction cancelled',
          bg: 'Транзакцията е отменена',
        },
      };

      const timelineEvent: EscrowTimelineEvent = {
        status: newStatus,
        timestamp: new Date(),
        description: notes || descriptions[newStatus].en,
        descriptionBg: descriptions[newStatus].bg,
        actor,
      };

      await updateDoc(escrowRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        timeline: [
          ...current.timeline,
          {
            ...timelineEvent,
            timestamp: Timestamp.fromDate(timelineEvent.timestamp),
          },
        ],
      });

      serviceLogger.info('Escrow: Status updated', { escrowId, newStatus });
    } catch (error) {
      serviceLogger.error('Escrow: Error updating status', error as Error);
      throw error;
    }
  }

  /**
   * Get escrow transaction by ID
   */
  async getTransaction(escrowId: string): Promise<EscrowTransaction | null> {
    try {
      const escrowDoc = await getDoc(doc(db, 'escrow_transactions', escrowId));
      if (!escrowDoc.exists()) return null;
      return escrowDoc.data() as EscrowTransaction;
    } catch (error) {
      serviceLogger.error('Escrow: Error getting transaction', error as Error);
      return null;
    }
  }

  /**
   * Get all escrow transactions for a user (buyer or seller)
   */
  async getUserTransactions(
    userId: string,
    role: 'buyer' | 'seller'
  ): Promise<EscrowTransaction[]> {
    try {
      const field = role === 'buyer' ? 'buyerId' : 'sellerId';
      const q = query(
        collection(db, 'escrow_transactions'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as EscrowTransaction);
    } catch (error) {
      serviceLogger.error(
        'Escrow: Error getting user transactions',
        error as Error
      );
      return [];
    }
  }

  /**
   * Raise a dispute on an escrow transaction
   */
  async raiseDispute(
    escrowId: string,
    raisedBy: 'buyer' | 'seller',
    reason: string
  ): Promise<void> {
    try {
      const escrowRef = doc(db, 'escrow_transactions', escrowId);

      await updateDoc(escrowRef, {
        status: 'disputed',
        dispute: {
          reason,
          raisedBy,
          raisedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });

      serviceLogger.info('Escrow: Dispute raised', { escrowId, raisedBy });
    } catch (error) {
      serviceLogger.error('Escrow: Error raising dispute', error as Error);
      throw error;
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private calculateRegistrationTax(engineCc: number, year: number): number {
    const age = new Date().getFullYear() - year;
    // Bulgarian registration tax: based on engine size and age
    let baseTax = 0;

    if (engineCc <= 1400) baseTax = 50;
    else if (engineCc <= 2000) baseTax = 100;
    else if (engineCc <= 2500) baseTax = 200;
    else if (engineCc <= 3000) baseTax = 350;
    else baseTax = 500;

    // Age factor
    if (age > 10) baseTax *= 1.5;
    else if (age > 5) baseTax *= 1.2;

    return Math.round(baseTax);
  }

  private determineEuroClass(year: number, engineType: string): string {
    if (engineType === 'electric') return 'euro6';
    if (year >= 2020) return 'euro6';
    if (year >= 2015) return 'euro6';
    if (year >= 2011) return 'euro5';
    if (year >= 2006) return 'euro4';
    if (year >= 2001) return 'euro3';
    if (year >= 1997) return 'euro2';
    if (year >= 1993) return 'euro1';
    return 'pre_euro';
  }

  private isValidTransition(from: EscrowStatus, to: EscrowStatus): boolean {
    const validTransitions: Record<EscrowStatus, EscrowStatus[]> = {
      initiated: ['buyer_funded', 'cancelled'],
      buyer_funded: ['seller_confirmed', 'cancelled', 'refunded'],
      seller_confirmed: ['in_transit', 'disputed', 'cancelled'],
      in_transit: ['inspection_pending', 'disputed'],
      inspection_pending: [
        'inspection_passed',
        'inspection_failed',
        'disputed',
      ],
      inspection_passed: ['released'],
      inspection_failed: ['refunded', 'disputed'],
      released: [],
      refunded: [],
      disputed: ['released', 'refunded'],
      cancelled: [],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }
}

export const crossBorderEscrowService = CrossBorderEscrowService.getInstance();
