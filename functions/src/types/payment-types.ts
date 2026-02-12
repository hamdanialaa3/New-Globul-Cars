/**
 * Payment Provider Types and Interfaces
 * Supports: iCard, Revolut, IBAN transfers, Stripe
 * @since February 5, 2026
 */

export type PaymentProvider = 'icard' | 'revolut' | 'iban' | 'stripe';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'cancelled'
  | 'expired';

export interface PaymentRecord {
  id: string;
  provider: PaymentProvider;
  provider_tx_id: string;
  ad_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotency_key: string;
  metadata?: Record<string, any>;
  raw_webhook?: Record<string, any>;
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
  settled_at?: FirebaseFirestore.Timestamp;
}

export interface WebhookVerificationResult {
  verified: boolean;
  error?: string;
}

export interface PaymentWebhookPayload {
  provider: PaymentProvider;
  event_type: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  raw_payload: any;
}

// iCard specific types
export interface ICardWebhookPayload {
  clientTransactionId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  timestamp: string;
  signature: string;
  metadata?: {
    ad_id?: string;
    user_id?: string;
  };
}

// Revolut specific types
export interface RevolutWebhookPayload {
  event: string;
  timestamp: string;
  data: {
    id: string;
    state: 'completed' | 'pending' | 'failed' | 'declined';
    amount: number;
    currency: string;
    reference?: string;
    merchant_order_id?: string;
  };
}

// IBAN transfer types (manual verification)
export interface IBANTransferPayload {
  transaction_id: string;
  iban: string;
  amount: number;
  currency: string;
  reference: string; // User reference for matching
  sender_name: string;
  timestamp: string;
  verified_by?: string; // Admin who verified
  verified_at?: FirebaseFirestore.Timestamp;
}

// Payment metrics for monitoring
export interface PaymentMetrics {
  provider: PaymentProvider;
  period: 'hour' | 'day' | 'week' | 'month';
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_amount: number;
  currency: string;
  success_rate: number;
  avg_settlement_time_minutes: number;
  webhook_failures: number;
  timestamp: FirebaseFirestore.Timestamp;
}

// Reconciliation report
export interface ReconciliationReport {
  id: string;
  provider: PaymentProvider;
  period_start: FirebaseFirestore.Timestamp;
  period_end: FirebaseFirestore.Timestamp;
  system_transactions: number;
  provider_transactions: number;
  matched_transactions: number;
  unmatched_system: string[]; // Transaction IDs
  unmatched_provider: string[];
  total_amount_system: number;
  total_amount_provider: number;
  discrepancy_amount: number;
  status: 'draft' | 'reviewed' | 'approved';
  generated_at: FirebaseFirestore.Timestamp;
  generated_by?: string;
}
