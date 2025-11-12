// src/services/financial-services.ts
// Financial Services for Bulgarian Car Marketplace
// Handles finance leads and insurance quotes

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '@/firebase/firebase-config';
import { logger } from './logger-service';
import {
  ServiceLead,
  FinanceLeadData,
  InsuranceQuoteData,
  FINANCIAL_PARTNERS,
  FinancialPartner
} from '@/types/firestore-models';

export class BulgarianFinancialServices {
  private functions = getFunctions();

  // Submit finance lead
  async submitFinanceLead(
    carId: string,
    leadData: FinanceLeadData
  ): Promise<string> {
    try {
      const lead: Omit<ServiceLead, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: '', // Will be set by Cloud Function
        carId,
        type: 'finance',
        status: 'pending',
        submittedData: leadData
      };

      const docRef = await addDoc(collection(db, 'serviceLeads'), {
        ...lead,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Call Cloud Function to process the lead
      const submitFinanceLeadFn = httpsCallable(this.functions, 'submitFinanceLead');
      await submitFinanceLeadFn({
        leadId: docRef.id,
        leadData
      });

      return docRef.id;
    } catch (error) {
      logger.error('[SERVICE] Error submitting finance lead', error as Error);
      throw new Error('Грешка при изпращане на заявката за финансиране');
    }
  }

  // Submit insurance quote request
  async submitInsuranceQuote(
    carId: string,
    quoteData: InsuranceQuoteData
  ): Promise<string> {
    try {
      const lead: Omit<ServiceLead, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: '', // Will be set by Cloud Function
        carId,
        type: 'insurance',
        status: 'pending',
        submittedData: quoteData
      };

      const docRef = await addDoc(collection(db, 'serviceLeads'), {
        ...lead,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Call Cloud Function to process the quote
      const submitInsuranceQuoteFn = httpsCallable(this.functions, 'submitInsuranceQuote');
      await submitInsuranceQuoteFn({
        leadId: docRef.id,
        quoteData
      });

      return docRef.id;
    } catch (error) {
      logger.error('[SERVICE] Error submitting insurance quote', error as Error);
      throw new Error('Грешка при изпращане на заявката за застраховка');
    }
  }

  // Get user's service leads
  async getUserServiceLeads(userId: string): Promise<ServiceLead[]> {
    try {
      const q = query(
        collection(db, 'serviceLeads'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceLead));
    } catch (error) {
      logger.error('[SERVICE] Error getting user service leads', error as Error);
      throw new Error('Грешка при зареждане на заявките');
    }
  }

  // Get service lead by ID
  async getServiceLead(leadId: string): Promise<ServiceLead | null> {
    try {
      const docRef = doc(db, 'serviceLeads', leadId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ServiceLead;
      }
      return null;
    } catch (error) {
      logger.error('[SERVICE] Error getting service lead', error as Error);
      return null;
    }
  }

  // Get available financial partners
  getFinancialPartners(): FinancialPartner[] {
    return FINANCIAL_PARTNERS.filter(partner => partner.active);
  }

  // Get partners by type
  getPartnersByType(type: 'bank' | 'insurance'): FinancialPartner[] {
    return FINANCIAL_PARTNERS.filter(partner =>
      partner.active && partner.type === type
    );
  }

  // Calculate estimated monthly payment for finance
  calculateMonthlyPayment(
    carPrice: number,
    downPayment: number,
    loanTerm: number, // months
    interestRate: number = 0.06 // 6% annual
  ): number {
    const loanAmount = carPrice - downPayment;
    const monthlyRate = interestRate / 12;
    const numPayments = loanTerm;

    if (monthlyRate === 0) {
      return loanAmount / numPayments;
    }

    const monthlyPayment = loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return Math.round(monthlyPayment);
  }

  // Get insurance quote estimate
  getInsuranceEstimate(
    carPrice: number,
    insuranceType: string,
    driverAge: number,
    drivingExperience: number
  ): { minPrice: number; maxPrice: number; currency: string } {
    // Simple estimation logic - in real app this would come from partners
    let baseRate = 0.03; // 3% of car value

    // Adjust based on insurance type
    switch (insuranceType) {
      case 'comprehensive':
        baseRate = 0.04;
        break;
      case 'third_party':
        baseRate = 0.025;
        break;
      case 'accident_only':
        baseRate = 0.015;
        break;
    }

    // Adjust based on driver risk
    if (driverAge < 25) baseRate *= 1.5;
    if (drivingExperience < 3) baseRate *= 1.3;

    const annualPremium = carPrice * baseRate;
    const monthlyPremium = annualPremium / 12;

    return {
      minPrice: Math.round(monthlyPremium * 0.8),
      maxPrice: Math.round(monthlyPremium * 1.2),
      currency: 'EUR'
    };
  }

  // Validate Bulgarian personal ID
  validateBulgarianPersonalId(personalId: string): boolean {
    // Bulgarian Personal ID (EGN) validation
    if (!/^\d{10}$/.test(personalId)) return false;

    const digits = personalId.split('').map(Number);
    const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6];
    const checksum = digits.slice(0, 9).reduce((sum, digit, index) =>
      sum + digit * weights[index], 0
    ) % 11;

    const checkDigit = checksum === 10 ? 0 : checksum;
    return checkDigit === digits[9];
  }

  // Format currency in Bulgarian style
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

// Export singleton instance
export const bulgarianFinancialServices = new BulgarianFinancialServices();