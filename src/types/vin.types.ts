import { Timestamp } from 'firebase/firestore';

/**
 * VIN Verification Data Structure
 * Used for Neural Pricing and Auto Trust Verification Pipeline
 */
export interface VinVerification {
  /** True if the VIN was verified against an active database */
  isVerified: boolean;
  
  /** True if warnings or flags were discovered (stolen, salvage, etc.) */
  hasFlags?: boolean;
  
  /** Verification data provider (e.g. carVertical, EU-EUCARIS) */
  provider?: string;
  
  /** Last officially reported mileage from databases */
  reportedMileage?: number;
  
  /** Date of verification */
  verifiedAt?: Timestamp | any;
  
  /** Full report ID if available */
  reportId?: string;
  
  /** Short summary of flags if true */
  flagsSummary?: string[];
}
