// src/features/verification/types.ts
// Verification System Types

export type VerificationLevel = 'none' | 'basic' | 'business' | 'company';
export type VerificationStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type DocumentType = 'eik' | 'vat' | 'license' | 'id' | 'insurance' | 'tax_registration';

export interface VerificationDocument {
  type: DocumentType;
  url: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  fileName?: string;
  fileSize?: number;
}

export interface VerificationRequest {
  userId: string;
  targetProfileType: 'dealer' | 'company';
  documents: VerificationDocument[];
  submittedAt: Date;
  status: VerificationStatus;
  level: VerificationLevel;
  notes?: string;
  reviewerId?: string;
  reviewedAt?: Date;
}

export interface DocumentRequirement {
  type: DocumentType;
  required: boolean;
  label: {
    bg: string;
    en: string;
  };
  description: {
    bg: string;
    en: string;
  };
  maxSize: number;  // in MB
  acceptedFormats: string[];  // ['application/pdf', 'image/jpeg', etc.]
}

