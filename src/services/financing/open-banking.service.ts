// src/services/financing/open-banking.service.ts
// Open Banking Engine — Instant credit scoring & financing pre-approval
// DSK/TBI/Fibank integration layer for 15-second loan decisions

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

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'scoring'
  | 'pre_approved'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'accepted'
  | 'disbursed';

export type CreditRating = 'A' | 'B' | 'C' | 'D' | 'F';

export interface BankPartner {
  id: string;
  name: string;
  nameBg: string;
  logo: string;
  minRate: number;
  maxRate: number;
  minTerm: number; // months
  maxTerm: number;
  minAmount: number;
  maxAmount: number;
  maxLtv: number; // loan-to-value percentage
  features: string[];
  active: boolean;
}

export interface CreditScoreResult {
  userId: string;
  score: number; // 300-850
  rating: CreditRating;
  factors: CreditFactor[];
  maxLoanAmount: number;
  suggestedRate: number;
  validUntil: Date;
  scoredAt: Date;
}

export interface CreditFactor {
  name: string;
  nameBg: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  descriptionBg: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  carId: string;
  vin?: string;
  status: ApplicationStatus;
  personalInfo: {
    fullName: string;
    egn: string; // Bulgarian personal ID (encrypted reference)
    phone: string;
    email: string;
    monthlyIncome: number;
    employmentType: 'employed' | 'self_employed' | 'retired' | 'other';
    employerName?: string;
  };
  loanDetails: {
    carPrice: number;
    downPayment: number;
    requestedAmount: number;
    requestedTermMonths: number;
    currency: 'EUR';
  };
  creditScore?: CreditScoreResult;
  offers: LoanOffer[];
  selectedOfferId?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface LoanOffer {
  id: string;
  bankId: string;
  bankName: string;
  bankNameBg: string;
  annualRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  termMonths: number;
  approvedAmount: number;
  fees: {
    processingFee: number;
    insuranceFee: number;
    monthlyAccountFee: number;
  };
  conditions: string[];
  conditionsBg: string[];
  validUntil: Date;
  isPreApproved: boolean;
}

export interface FinancingWidget {
  carId: string;
  carPrice: number;
  minDownPayment: number;
  defaultDownPayment: number;
  availableTerms: number[];
  bestRate: number;
  bestMonthlyPayment: number;
  bankCount: number;
  preQualified: boolean;
}

// ─── Bank Partners ──────────────────────────────────────────────────

const BANK_PARTNERS: BankPartner[] = [
  {
    id: 'dsk_bank',
    name: 'DSK Bank',
    nameBg: 'Банка ДСК',
    logo: '/images/banks/dsk.png',
    minRate: 4.9,
    maxRate: 11.5,
    minTerm: 12,
    maxTerm: 84,
    minAmount: 1000,
    maxAmount: 100000,
    maxLtv: 80,
    features: ['Бързо одобрение', 'Без такса за предсрочно погасяване'],
    active: true,
  },
  {
    id: 'tbi_bank',
    name: 'TBI Bank',
    nameBg: 'ТБИ Банк',
    logo: '/images/banks/tbi.png',
    minRate: 5.5,
    maxRate: 13.0,
    minTerm: 6,
    maxTerm: 72,
    minAmount: 500,
    maxAmount: 50000,
    maxLtv: 85,
    features: ['Онлайн одобрение', '15-минутно решение'],
    active: true,
  },
  {
    id: 'fibank',
    name: 'First Investment Bank',
    nameBg: 'Първа инвестиционна банка',
    logo: '/images/banks/fibank.png',
    minRate: 4.5,
    maxRate: 10.5,
    minTerm: 12,
    maxTerm: 96,
    minAmount: 2000,
    maxAmount: 150000,
    maxLtv: 75,
    features: ['Най-ниски лихви', 'За нови и употребявани автомобили'],
    active: true,
  },
  {
    id: 'unicredit',
    name: 'UniCredit Bulbank',
    nameBg: 'УниКредит Булбанк',
    logo: '/images/banks/unicredit.png',
    minRate: 4.2,
    maxRate: 9.8,
    minTerm: 12,
    maxTerm: 84,
    minAmount: 3000,
    maxAmount: 200000,
    maxLtv: 70,
    features: ['Премиум обслужване', 'Гъвкави условия'],
    active: true,
  },
];

// ─── Constants ───────────────────────────────────────────────────────

const SCORE_VALIDITY_DAYS = 30;
const APPLICATION_EXPIRY_DAYS = 7;
const MIN_INCOME_RATIO = 0.4; // Max 40% of monthly income for loan payment

// ─── Service ─────────────────────────────────────────────────────────

class OpenBankingService {
  private static instance: OpenBankingService;

  private constructor() {}

  static getInstance(): OpenBankingService {
    if (!OpenBankingService.instance) {
      OpenBankingService.instance = new OpenBankingService();
    }
    return OpenBankingService.instance;
  }

  // ─── Credit Scoring ───────────────────────────────────────────────

  /**
   * Perform instant credit scoring (15-second target)
   * Uses income, employment, existing credit history, and debt-to-income ratio
   */
  async performCreditScore(
    userId: string,
    params: {
      monthlyIncome: number;
      employmentType: 'employed' | 'self_employed' | 'retired' | 'other';
      yearsEmployed: number;
      existingDebt: number;
      hasDefaultHistory: boolean;
      age: number;
    }
  ): Promise<CreditScoreResult> {
    try {
      let score = 500; // Base score
      const factors: CreditFactor[] = [];

      // Income factor (up to +150 points)
      if (params.monthlyIncome >= 3000) {
        score += 150;
        factors.push({
          name: 'High Income',
          nameBg: 'Висок доход',
          impact: 'positive',
          description: 'Monthly income above €3,000',
          descriptionBg: 'Месечен доход над €3 000',
        });
      } else if (params.monthlyIncome >= 1500) {
        score += 100;
        factors.push({
          name: 'Moderate Income',
          nameBg: 'Среден доход',
          impact: 'positive',
          description: 'Monthly income above €1,500',
          descriptionBg: 'Месечен доход над €1 500',
        });
      } else if (params.monthlyIncome >= 800) {
        score += 50;
        factors.push({
          name: 'Low Income',
          nameBg: 'Нисък доход',
          impact: 'neutral',
          description: 'Income meets minimum requirements',
          descriptionBg: 'Доходът отговаря на минималните изисквания',
        });
      } else {
        score -= 100;
        factors.push({
          name: 'Insufficient Income',
          nameBg: 'Недостатъчен доход',
          impact: 'negative',
          description: 'Income below minimum threshold',
          descriptionBg: 'Доходът е под минималния праг',
        });
      }

      // Employment stability (up to +100 points)
      if (params.employmentType === 'employed' && params.yearsEmployed >= 3) {
        score += 100;
        factors.push({
          name: 'Stable Employment',
          nameBg: 'Стабилна заетост',
          impact: 'positive',
          description: '3+ years with current employer',
          descriptionBg: '3+ години при текущия работодател',
        });
      } else if (params.employmentType === 'self_employed') {
        score += 50;
        factors.push({
          name: 'Self Employment',
          nameBg: 'Самонаети',
          impact: 'neutral',
          description: 'Self-employed income verification required',
          descriptionBg: 'Необходима е проверка на дохода',
        });
      }

      // Debt-to-income (up to -200 / +50)
      const dtiRatio = params.existingDebt / Math.max(params.monthlyIncome, 1);
      if (dtiRatio > 0.5) {
        score -= 200;
        factors.push({
          name: 'High Debt',
          nameBg: 'Висок дълг',
          impact: 'negative',
          description: 'Debt-to-income ratio exceeds 50%',
          descriptionBg: 'Съотношение дълг/доход надвишава 50%',
        });
      } else if (dtiRatio < 0.15) {
        score += 50;
        factors.push({
          name: 'Low Debt',
          nameBg: 'Нисък дълг',
          impact: 'positive',
          description: 'Minimal existing debt',
          descriptionBg: 'Минимален съществуващ дълг',
        });
      }

      // Credit history
      if (params.hasDefaultHistory) {
        score -= 150;
        factors.push({
          name: 'Default History',
          nameBg: 'История на неплащане',
          impact: 'negative',
          description: 'Previous payment defaults found',
          descriptionBg: 'Открити са предишни неплащания',
        });
      }

      // Age factor
      if (params.age >= 25 && params.age <= 60) {
        score += 30;
      }

      // Clamp score
      score = Math.max(300, Math.min(850, score));

      // Determine rating
      const rating = this.scoreToRating(score);

      // Max loan amount (based on score + income)
      const maxLoanAmount = this.calculateMaxLoan(
        score,
        params.monthlyIncome,
        params.existingDebt
      );

      // Suggested rate
      const suggestedRate = this.calculateSuggestedRate(score);

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + SCORE_VALIDITY_DAYS);

      const result: CreditScoreResult = {
        userId,
        score,
        rating,
        factors,
        maxLoanAmount,
        suggestedRate,
        validUntil,
        scoredAt: new Date(),
      };

      // Store in Firestore
      await setDoc(doc(db, 'credit_scores', `${userId}_${Date.now()}`), {
        ...result,
        validUntil: Timestamp.fromDate(validUntil),
        scoredAt: serverTimestamp(),
      });

      serviceLogger.info('OpenBanking: Credit score completed', {
        userId,
        score,
        rating,
      });
      return result;
    } catch (error) {
      serviceLogger.error('OpenBanking: Credit scoring failed', error as Error);
      throw error;
    }
  }

  // ─── Loan Application ────────────────────────────────────────────

  /**
   * Submit a loan application and get instant offers from bank partners
   */
  async submitApplication(params: {
    userId: string;
    carId: string;
    vin?: string;
    personalInfo: LoanApplication['personalInfo'];
    carPrice: number;
    downPayment: number;
    requestedTermMonths: number;
  }): Promise<LoanApplication> {
    try {
      const requestedAmount = params.carPrice - params.downPayment;

      if (requestedAmount <= 0) {
        throw new Error('Down payment exceeds car price');
      }

      const id = `loan_${params.userId}_${Date.now()}`;
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + APPLICATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      );

      // Generate offers from all active bank partners
      const offers = this.generateBankOffers(
        requestedAmount,
        params.requestedTermMonths,
        params.personalInfo.monthlyIncome,
        params.carPrice
      );

      const application: LoanApplication = {
        id,
        userId: params.userId,
        carId: params.carId,
        vin: params.vin,
        status: offers.length > 0 ? 'pre_approved' : 'submitted',
        personalInfo: params.personalInfo,
        loanDetails: {
          carPrice: params.carPrice,
          downPayment: params.downPayment,
          requestedAmount,
          requestedTermMonths: params.requestedTermMonths,
          currency: 'EUR',
        },
        offers,
        createdAt: now,
        updatedAt: now,
        expiresAt,
      };

      await setDoc(doc(db, 'loan_applications', id), {
        ...application,
        // Do not store raw EGN — store only a reference key
        personalInfo: {
          ...application.personalInfo,
          egn: '***REDACTED***', // Never store EGN in plaintext
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      serviceLogger.info('OpenBanking: Application submitted', {
        id,
        offerCount: offers.length,
        status: application.status,
      });

      return application;
    } catch (error) {
      serviceLogger.error(
        'OpenBanking: Application submission failed',
        error as Error
      );
      throw error;
    }
  }

  /**
   * Accept a specific loan offer
   */
  async acceptOffer(applicationId: string, offerId: string): Promise<void> {
    try {
      const appRef = doc(db, 'loan_applications', applicationId);

      await updateDoc(appRef, {
        status: 'accepted',
        selectedOfferId: offerId,
        updatedAt: serverTimestamp(),
      });

      serviceLogger.info('OpenBanking: Offer accepted', {
        applicationId,
        offerId,
      });
    } catch (error) {
      serviceLogger.error('OpenBanking: Error accepting offer', error as Error);
      throw error;
    }
  }

  /**
   * Get user's loan applications
   */
  async getUserApplications(userId: string): Promise<LoanApplication[]> {
    try {
      const q = query(
        collection(db, 'loan_applications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as LoanApplication);
    } catch (error) {
      serviceLogger.error(
        'OpenBanking: Error getting applications',
        error as Error
      );
      return [];
    }
  }

  // ─── Widget Data ──────────────────────────────────────────────────

  /**
   * Generate financing widget data for a car listing page
   */
  getFinancingWidget(carPrice: number): FinancingWidget {
    const minDownPayment = Math.round(carPrice * 0.1);
    const defaultDownPayment = Math.round(carPrice * 0.2);
    const loanAmount = carPrice - defaultDownPayment;
    const bestRate = Math.min(
      ...BANK_PARTNERS.filter(b => b.active).map(b => b.minRate)
    );
    const monthlyRate = bestRate / 100 / 12;
    const termMonths = 60; // 5 years default

    const bestMonthlyPayment =
      monthlyRate > 0
        ? Math.round(
            (loanAmount * monthlyRate) /
              (1 - Math.pow(1 + monthlyRate, -termMonths))
          )
        : Math.round(loanAmount / termMonths);

    return {
      carId: '',
      carPrice,
      minDownPayment,
      defaultDownPayment,
      availableTerms: [12, 24, 36, 48, 60, 72, 84],
      bestRate,
      bestMonthlyPayment,
      bankCount: BANK_PARTNERS.filter(b => b.active).length,
      preQualified: false,
    };
  }

  /**
   * Get list of active bank partners
   */
  getBankPartners(): BankPartner[] {
    return BANK_PARTNERS.filter(b => b.active);
  }

  // ─── Private Methods ──────────────────────────────────────────────

  private generateBankOffers(
    amount: number,
    termMonths: number,
    monthlyIncome: number,
    carPrice: number
  ): LoanOffer[] {
    const offers: LoanOffer[] = [];
    const maxPayment = monthlyIncome * MIN_INCOME_RATIO;
    const ltv = (amount / carPrice) * 100;

    for (const bank of BANK_PARTNERS) {
      if (!bank.active) continue;
      if (amount < bank.minAmount || amount > bank.maxAmount) continue;
      if (termMonths < bank.minTerm || termMonths > bank.maxTerm) continue;
      if (ltv > bank.maxLtv) continue;

      // Calculate rate based on amount, term, and LTV
      const baseRate =
        bank.minRate + (bank.maxRate - bank.minRate) * (ltv / 100);
      const annualRate = Math.round(baseRate * 100) / 100;
      const monthlyRate = annualRate / 100 / 12;

      const monthlyPayment =
        monthlyRate > 0
          ? Math.round(
              (amount * monthlyRate) /
                (1 - Math.pow(1 + monthlyRate, -termMonths))
            )
          : Math.round(amount / termMonths);

      // Check if payment exceeds income limit
      if (monthlyPayment > maxPayment) continue;

      const totalPayment = monthlyPayment * termMonths;
      const totalInterest = totalPayment - amount;

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + APPLICATION_EXPIRY_DAYS);

      offers.push({
        id: `offer_${bank.id}_${Date.now()}`,
        bankId: bank.id,
        bankName: bank.name,
        bankNameBg: bank.nameBg,
        annualRate,
        monthlyPayment,
        totalPayment,
        totalInterest,
        termMonths,
        approvedAmount: amount,
        fees: {
          processingFee: Math.round(amount * 0.01), // 1%
          insuranceFee: Math.round(amount * 0.005), // 0.5%
          monthlyAccountFee: 3, // EUR
        },
        conditions: [
          'Valid Bulgarian ID required',
          'Proof of income for last 3 months',
          'Vehicle must be registered in Bulgaria',
        ],
        conditionsBg: [
          'Изисква се валидна българска лична карта',
          'Доказателство за доход за последните 3 месеца',
          'Автомобилът трябва да е регистриран в България',
        ],
        validUntil,
        isPreApproved: true,
      });
    }

    // Sort by total cost (best offer first)
    offers.sort((a, b) => a.totalPayment - b.totalPayment);
    return offers;
  }

  private scoreToRating(score: number): CreditRating {
    if (score >= 750) return 'A';
    if (score >= 650) return 'B';
    if (score >= 550) return 'C';
    if (score >= 400) return 'D';
    return 'F';
  }

  private calculateMaxLoan(
    score: number,
    monthlyIncome: number,
    existingDebt: number
  ): number {
    const availableMonthly = monthlyIncome * MIN_INCOME_RATIO - existingDebt;
    if (availableMonthly <= 0) return 0;

    // Multiplier based on score
    const multiplier =
      score >= 750 ? 84 : score >= 650 ? 72 : score >= 550 ? 60 : 36;

    return Math.round(availableMonthly * multiplier * 0.85); // 85% discount for interest
  }

  private calculateSuggestedRate(score: number): number {
    if (score >= 800) return 4.2;
    if (score >= 750) return 5.0;
    if (score >= 700) return 6.5;
    if (score >= 650) return 8.0;
    if (score >= 550) return 10.0;
    return 13.0;
  }
}

export const openBankingService = OpenBankingService.getInstance();
