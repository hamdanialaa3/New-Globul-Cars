/**
 * Payment Types for Manual Bank Transfer System
 * @since January 9, 2026
 */

export type PaymentStatus = 
  | 'pending_manual_verification'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'completed'
  | 'refunded';

export type PaymentType = 
  | 'subscription'
  | 'promotion'
  | 'listing'
  | 'upgrade';

export type BankAccountType = 'revolut' | 'icard';

export interface ManualPaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  
  // Payment Details
  amount: number;
  currency: 'EUR' | 'BGN';
  paymentType: PaymentType;
  itemId: string; // subscriptionId, promotionId, listingId, etc.
  itemDescription: string;
  
  // Bank Transfer Details
  referenceNumber: string;
  selectedBankAccount: BankAccountType;
  
  // Status & Timestamps
  status: PaymentStatus;
  createdAt: Date;
  verifiedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  
  // Verification
  verifiedBy?: string; // Admin user ID
  verificationNotes?: string;
  rejectionReason?: string;
  
  // User Confirmation
  userConfirmedTransfer: boolean;
  userTransferDate?: Date;
  userProvidedReference?: string;
  userProvidedAmount?: number;
  
  // 🆕 TRUST ENHANCEMENTS
  receiptUrl?: string; // Firebase Storage URL for payment screenshot
  receiptFileName?: string;
  receiptUploadedAt?: Date;
  whatsappMessageSent?: boolean; // User sent proof via WhatsApp
  whatsappMessageTimestamp?: Date;
  
  // Metadata
  metadata?: {
    planTier?: string;
    promotionType?: string;
    originalRequest?: any;
  };
}

export interface BankTransferFormData {
  amount: number;
  referenceNumber: string;
  selectedBank: BankAccountType;
  confirmedTransfer: boolean;
  transferDate?: string;
  userProvidedReference?: string;
  userNotes?: string;
  receiptFile?: File; // 🆕 Payment receipt/screenshot upload
}

export interface PaymentVerificationRequest {
  transactionId: string;
  status: 'verified' | 'rejected';
  notes?: string;
  adminId: string;
}

export interface BankDetails {
  bankName: string;
  beneficiary: string;
  iban: string;
  bic: string;
  address: string;
  revtag?: string;
  label: {
    bg: string;
    en: string;
  };
  description: {
    bg: string;
    en: string;
  };
  processingTime: {
    bg: string;
    en: string;
  };
}

export interface ContactDetails {
  phone: string;
  email: string;
  workAddress: {
    bg: string;
    en: string;
  };
  residentialAddress: {
    bg: string;
    en: string;
  };
}

export interface PaymentInstructions {
  title: string;
  steps: string[];
  note: string;
}
