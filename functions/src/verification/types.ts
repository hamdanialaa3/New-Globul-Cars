// functions/src/verification/types.ts
// Verification System Types for Cloud Functions

export interface VerificationRequest {
  id: string;
  userId: string;
  targetProfileType: 'dealer' | 'company';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: FirebaseFirestore.Timestamp;
  reviewedAt?: FirebaseFirestore.Timestamp;
  reviewedBy?: string;
  rejectionReason?: string;
  
  // User info
  userEmail: string;
  displayName: string;
  
  // Business info
  businessInfo: {
    legalName: string;
    eik: string;
    vat?: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  
  // Documents
  documents: VerificationDocument[];
}

export interface VerificationDocument {
  type: 'eik' | 'license' | 'vat' | 'insurance' | 'id';
  url: string;
  uploadedAt: FirebaseFirestore.Timestamp;
  verified: boolean;
}

export interface ApprovalResult {
  success: boolean;
  message: string;
  userId: string;
  newProfileType: 'dealer' | 'company';
}

export interface RejectionResult {
  success: boolean;
  message: string;
  userId: string;
  reason: string;
}

export interface EIKVerificationResult {
  valid: boolean;
  message?: string;
  eik?: string;
  companyName?: string;
  companyNameEn?: string;
  address?: string;
  registrationDate?: string;
  status?: string;
  legalForm?: string;
  error?: string;
}
