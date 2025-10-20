// functions/src/billing/types.ts
// Types for Billing and Invoice System

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number; // VAT percentage (e.g., 20 for 20%)
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'standard' | 'proforma' | 'credit_note';
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  
  // Seller (Globul Cars)
  sellerName: string;
  sellerAddress: string;
  sellerEIK: string;
  sellerVAT: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerBank: string;
  sellerIBAN: string;
  sellerBIC: string;
  
  // Buyer (Dealer/Company)
  buyerId: string;
  buyerName: string;
  buyerAddress: string;
  buyerEIK?: string;
  buyerVAT?: string;
  buyerEmail: string;
  buyerPhone?: string;
  
  // Invoice details
  items: InvoiceItem[];
  subtotal: number;
  totalVAT: number;
  total: number;
  currency: 'BGN' | 'EUR';
  
  // Payment
  paymentMethod?: 'bank_transfer' | 'card' | 'cash';
  paymentDueDate: any;
  paidAt?: any;
  
  // Metadata
  notes?: string;
  referenceNumber?: string;
  relatedTransactionId?: string;
  
  // Timestamps
  issueDate: any;
  createdAt: any;
  updatedAt: any;
  
  // PDF
  pdfURL?: string;
}

export interface BulgarianInvoiceData {
  // Document info
  invoiceNumber: string;
  issueDate: string;
  paymentDueDate: string;
  
  // Seller (Издател)
  seller: {
    name: string;
    address: string;
    eik: string;
    vat: string;
    mol: string; // Материално отговорно лице
    phone: string;
    email: string;
    bank: string;
    iban: string;
    bic: string;
  };
  
  // Buyer (Получател)
  buyer: {
    name: string;
    address: string;
    eik?: string;
    vat?: string;
    mol?: string;
    email: string;
    phone?: string;
  };
  
  // Items (Стоки/Услуги)
  items: InvoiceItem[];
  
  // Totals
  subtotal: number;
  totalVAT: number;
  total: number;
  currency: string;
  
  // Notes
  notes?: string;
  paymentMethod?: string;
}

export interface GenerateInvoiceRequest {
  buyerId: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vat?: number;
  }>;
  type?: 'standard' | 'proforma' | 'credit_note';
  notes?: string;
  paymentMethod?: string;
  referenceNumber?: string;
}

export interface UpdateInvoiceStatusRequest {
  invoiceId: string;
  status: 'sent' | 'paid' | 'cancelled';
  paidAt?: any;
}

export interface SendInvoiceEmailRequest {
  invoiceId: string;
}

export interface CommissionPeriod {
  id: string;
  userId: string;
  period: string; // Format: "YYYY-MM"
  
  // Sales data
  totalSales: number;
  commissionRate: number; // 2% for dealers, 1.5% for companies
  commissionAmount: number;
  
  // Transaction breakdown
  transactions: Array<{
    transactionId: string;
    listingId: string;
    listingTitle: string;
    salePrice: number;
    commissionAmount: number;
    date: any;
  }>;
  
  // Status
  status: 'pending' | 'calculated' | 'charged' | 'paid';
  calculatedAt?: any;
  chargedAt?: any;
  paidAt?: any;
  
  // Invoice
  invoiceId?: string;
  
  createdAt: any;
  updatedAt: any;
}
