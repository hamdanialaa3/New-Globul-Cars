/**
 * Cloud Function: Process Loan Application
 * Validates credit scores and submits applications to Bulgarian banks
 * Engine 4: Open Banking Instant Pre-Approval
 *
 * File: functions/src/financing/process-loan-application.ts
 * Created: April 1, 2026
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Bank API Configuration (Bulgaria)
 * 4 partner banks with API endpoints
 */
const BANK_CONFIG = {
  DSK: {
    name: 'DSK Bank Bulgaria',
    endpoint: 'https://api.dsk.bg/v1/loans/apply',
    maxLoan: 50000,
    minRate: 4.9,
    maxRate: 11.5,
    requiresCollateral: false,
  },
  TBI: {
    name: 'TBI Bank Bulgaria',
    endpoint: 'https://api.tbibank.bg/v1/applications',
    maxLoan: 70000,
    minRate: 5.5,
    maxRate: 13.0,
    requiresCollateral: false,
  },
  FIBANK: {
    name: 'Fibank Bulgaria',
    endpoint: 'https://api.fibank.bg/loans/instant-application',
    maxLoan: 60000,
    minRate: 4.5,
    maxRate: 10.5,
    requiresCollateral: false,
  },
  UNICREDIT: {
    name: 'UniCredit Bank Bulgaria',
    endpoint: 'https://api.unicreditbg.bg/v2/loan-applications',
    maxLoan: 80000,
    minRate: 4.2,
    maxRate: 9.8,
    requiresCollateral: false,
  },
};

interface LoanApplicationRequest {
  userId: string;
  carId: string;
  creditScore: number;
  monthlyIncome: number;
  employmentType: string;
  existingDebt: number;
  carPrice: number;
  downPayment: number;
  requestedTermMonths: number;
  personalInfo: {
    fullName: string;
    egn: string;
    phone: string;
    email: string;
  };
}

interface BankApplicationResult {
  bankId: string;
  bankName: string;
  status: 'approved' | 'pending' | 'rejected';
  loanAmount: number;
  monthlyPayment: number;
  annualRate: number;
  term: number;
  approvalCode?: string;
  rejectionReason?: string;
  timestamp: string;
}

/**
 * Main Cloud Function: Process Loan Application
 * Validates credit & submits to all 4 banks in parallel
 *
 * @callable
 */
export const processLoanApplication = functions
  .region('europe-west1')
  .runWith({ timeoutSeconds: 120, memory: '512MB' })
  .https.onCall(async (data: LoanApplicationRequest, context) => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to submit a loan application.'
      );
    }

    const { userId } = data;

    // Verify UID matches
    if (context.auth.uid !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'UID mismatch. Cannot process application for another user.'
      );
    }

    try {
      // 1. Validate credit score (300-850 range)
      const scoreValidation = validateCreditScore(data.creditScore);
      if (!scoreValidation.valid) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          scoreValidation.error
        );
      }

      // 2. Calculate debt-to-income ratio
      const dtiRatio =
        (data.existingDebt * 12 + calculateMonthlyCarPayment(data)) /
        (data.monthlyIncome * 12);
      if (dtiRatio > 0.43) {
        functions.logger.warn(
          `[loan-app] High DTI ratio: ${dtiRatio} for user ${userId}`
        );
      }

      // 3. Submit to all 4 banks in parallel
      const bankPromises = Object.entries(BANK_CONFIG).map(
        async ([bankId, config]) => {
          return await submitToBankAPI(bankId, config, data);
        }
      );

      const bankResults = await Promise.allSettled(bankPromises);

      // 4. Aggregate results
      const approvedOffers: BankApplicationResult[] = [];
      const rejectedOffers: BankApplicationResult[] = [];

      bankResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          if (result.value.status === 'approved') {
            approvedOffers.push(result.value);
          } else {
            rejectedOffers.push(result.value);
          }
        }
      });

      // 5. Store application in Firestore
      const applicationId = `app_${userId}_${Date.now()}`;
      const applicationRef = db
        .collection('loan_applications')
        .doc(applicationId);

      await applicationRef.set({
        userId,
        carId: data.carId,
        applicationId,
        status: approvedOffers.length > 0 ? 'approved' : 'pending',
        creditScore: data.creditScore,
        dtiRatio: parseFloat(dtiRatio.toFixed(2)),
        carPrice: data.carPrice,
        downPayment: data.downPayment,
        requestedLoanAmount: data.carPrice - data.downPayment,
        requestedTermMonths: data.requestedTermMonths,
        approvedOffers,
        rejectedOffers,
        personalInfo: {
          fullName: data.personalInfo.fullName,
          email: data.personalInfo.email,
          phone: data.personalInfo.phone,
          // Never store raw EGN
          egn_hash: hashEGN(data.personalInfo.egn),
        },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
      });

      // 6. Log success
      functions.logger.info(
        `[loan-app] Application processed for user ${userId}`,
        {
          approvedCount: approvedOffers.length,
          rejectedCount: rejectedOffers.length,
          applicationId,
        }
      );

      return {
        success: true,
        applicationId,
        approvedOffers: approvedOffers.map(o => ({
          bankId: o.bankId,
          bankName: o.bankName,
          loanAmount: o.loanAmount,
          monthlyPayment: o.monthlyPayment,
          annualRate: o.annualRate,
          term: o.term,
        })),
        rejectedCount: rejectedOffers.length,
      };
    } catch (error) {
      functions.logger.error(
        `[loan-app] Error processing application: ${error}`
      );
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to process loan application. Please try again later.'
      );
    }
  });

/**
 * Submit application to bank API
 * Simulates bank response (production: real API calls)
 */
async function submitToBankAPI(
  bankId: string,
  config: (typeof BANK_CONFIG)[keyof typeof BANK_CONFIG],
  data: LoanApplicationRequest
): Promise<BankApplicationResult> {
  try {
    const loanAmount = data.carPrice - data.downPayment;

    // Validation checks
    if (loanAmount > config.maxLoan) {
      return {
        bankId,
        bankName: config.name,
        status: 'rejected',
        loanAmount: 0,
        monthlyPayment: 0,
        annualRate: 0,
        term: 0,
        rejectionReason: `Loan amount exceeds maximum of €${config.maxLoan}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Credit score thresholds
    if (data.creditScore < 500) {
      return {
        bankId,
        bankName: config.name,
        status: 'rejected',
        loanAmount: 0,
        monthlyPayment: 0,
        annualRate: 0,
        term: 0,
        rejectionReason: 'Credit score below minimum threshold',
        timestamp: new Date().toISOString(),
      };
    }

    // Calculate interest rate based on score
    const rateRange = config.maxRate - config.minRate;
    const scoreRange = 850 - 300;
    const normalizedScore = Math.min((data.creditScore - 300) / scoreRange, 1);
    const annualRate = config.maxRate - rateRange * normalizedScore;

    // Calculate monthly payment (PMT formula)
    const monthlyRate = annualRate / 100 / 12;
    const n = data.requestedTermMonths;
    const monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);

    // Approval code (production: from bank response)
    const approvalCode = `${bankId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      bankId,
      bankName: config.name,
      status: 'approved',
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      annualRate: Math.round(annualRate * 100) / 100,
      term: data.requestedTermMonths,
      approvalCode,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error(`[loan-app] Bank API error for ${bankId}: ${error}`);
    throw error;
  }
}

/**
 * Validate credit score (FICO-style 300-850)
 */
function validateCreditScore(score: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof score !== 'number' || isNaN(score)) {
    return { valid: false, error: 'Credit score must be a number.' };
  }
  if (score < 300 || score > 850) {
    return { valid: false, error: 'Credit score must be between 300 and 850.' };
  }
  return { valid: true };
}

/**
 * Calculate estimated monthly car payment (simple approximation)
 */
function calculateMonthlyCarPayment(data: LoanApplicationRequest): number {
  const loanAmount = data.carPrice - data.downPayment;
  const monthlyRate = 0.06 / 12; // Assume 6% average
  const n = data.requestedTermMonths;
  return (
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
    (Math.pow(1 + monthlyRate, n) - 1)
  );
}

/**
 * Hash EGN for security (never store raw)
 */
function hashEGN(egn: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(egn).digest('hex');
}
