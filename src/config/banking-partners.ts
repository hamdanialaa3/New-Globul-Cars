/**
 * Banking Partners Configuration
 * Established Bulgarian car financing banks
 * Location: Bulgaria
 * 
 * File: src/config/banking-partners.ts
 * Created: February 8, 2026
 */

export interface BankPartner {
  id: string;
  name: string;
  logo: string;
  website: string;
  minLoan: number;
  maxLoan: number;
  minDuration: number;
  maxDuration: number;
  baseRate: number;
  interestRates: {
    duration: number;
    rate: number;
  }[];
  documentationUrl: string;
  contactEmail: string;
  isActive: boolean;
}

export const BANKING_PARTNERS: Record<string, BankPartner> = {
  dsk: {
    id: 'dsk',
    name: 'DSK Bank',
    logo: 'https://www.dskbank.bg/logo.svg',
    website: 'https://www.dskbank.bg',
    minLoan: 3000,
    maxLoan: 50000,
    minDuration: 24,
    maxDuration: 84,
    baseRate: 5.5,
    interestRates: [
      { duration: 24, rate: 6.2 },
      { duration: 36, rate: 5.9 },
      { duration: 48, rate: 5.7 },
      { duration: 60, rate: 5.5 },
      { duration: 72, rate: 5.8 },
      { duration: 84, rate: 6.1 }
    ],
    documentationUrl: 'https://www.dskbank.bg/auto-loans',
    contactEmail: 'autoloans@dskbank.bg',
    isActive: true
  },

  unicredit: {
    id: 'unicredit',
    name: 'UniCredit Bank Bulgaria',
    logo: 'https://www.unicreditbulbank.bg/logo.svg',
    website: 'https://www.unicreditbulbank.bg',
    minLoan: 2500,
    maxLoan: 100000,
    minDuration: 12,
    maxDuration: 84,
    baseRate: 5.0,
    interestRates: [
      { duration: 12, rate: 7.2 },
      { duration: 24, rate: 6.5 },
      { duration: 36, rate: 5.9 },
      { duration: 48, rate: 5.5 },
      { duration: 60, rate: 5.2 },
      { duration: 72, rate: 5.4 },
      { duration: 84, rate: 5.8 }
    ],
    documentationUrl: 'https://www.unicreditbulbank.bg/products/auto-loans',
    contactEmail: 'autoloans@unicreditbulbank.bg',
    isActive: true
  },

  raiffeisenbank: {
    id: 'raiffeisenbank',
    name: 'Raiffeisen Bank Bulgaria',
    logo: 'https://www.raiffeisenbank.bg/logo.svg',
    website: 'https://www.raiffeisenbank.bg',
    minLoan: 3000,
    maxLoan: 80000,
    minDuration: 24,
    maxDuration: 72,
    baseRate: 5.2,
    interestRates: [
      { duration: 24, rate: 6.1 },
      { duration: 36, rate: 5.7 },
      { duration: 48, rate: 5.3 },
      { duration: 60, rate: 5.1 },
      { duration: 72, rate: 5.5 }
    ],
    documentationUrl: 'https://www.raiffeisenbank.bg/products/auto-loans',
    contactEmail: 'autoloans@raiffeisenbank.bg',
    isActive: true
  },

  first_investment_bank: {
    id: 'first_investment_bank',
    name: 'First Investment Bank',
    logo: 'https://www.fibank.bg/logo.svg',
    website: 'https://www.fibank.bg',
    minLoan: 2000,
    maxLoan: 120000,
    minDuration: 12,
    maxDuration: 84,
    baseRate: 4.8,
    interestRates: [
      { duration: 12, rate: 7.5 },
      { duration: 24, rate: 6.8 },
      { duration: 36, rate: 6.2 },
      { duration: 48, rate: 5.8 },
      { duration: 60, rate: 5.5 },
      { duration: 72, rate: 5.7 },
      { duration: 84, rate: 6.0 }
    ],
    documentationUrl: 'https://www.fibank.bg/products/car-loans',
    contactEmail: 'carloans@fibank.bg',
    isActive: true
  },

  society_general_expresss: {
    id: 'society_general_expresss',
    name: 'Société Générale Expresss',
    logo: 'https://www.expresss.bg/logo.svg',
    website: 'https://www.expresss.bg',
    minLoan: 1500,
    maxLoan: 50000,
    minDuration: 12,
    maxDuration: 60,
    baseRate: 6.0,
    interestRates: [
      { duration: 12, rate: 8.5 },
      { duration: 24, rate: 7.8 },
      { duration: 36, rate: 7.2 },
      { duration: 48, rate: 6.8 },
      { duration: 60, rate: 6.5 }
    ],
    documentationUrl: 'https://www.expresss.bg/auto-loans',
    contactEmail: 'autoloans@expresss.bg',
    isActive: true
  }
};

export function getBankById(id: string): BankPartner | null {
  return BANKING_PARTNERS[id] || null;
}

export function getActiveBanks(): BankPartner[] {
  return Object.values(BANKING_PARTNERS).filter(bank => bank.isActive);
}

export function getInterestRateForBank(
  bankId: string,
  durationMonths: number
): number {
  const bank = getBankById(bankId);
  if (!bank) return 0;

  const rates = bank.interestRates.sort((a, b) => Math.abs(a.duration - durationMonths) - Math.abs(b.duration - durationMonths));

  if (rates.length === 0) return bank.baseRate;

  const closestRate = rates[0];
  if (closestRate.duration === durationMonths) {
    return closestRate.rate;
  }

  const nextRate = rates[1];
  if (!nextRate) return closestRate.rate;

  const ratio =
    (durationMonths - closestRate.duration) / (nextRate.duration - closestRate.duration);
  return closestRate.rate + (nextRate.rate - closestRate.rate) * ratio;
}
