import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { VinVerification } from '../types/vin.types';
import { serviceLogger } from './logger-service';

/**
 * 📜 Article 11 & 12: Trust & Market Integrity
 * Service responsible for resolving VIN histories to detect fraud.
 */
export class VinVerificationService {
  /**
   * Verify a VIN against the (Mocked) EU Database
   * @param vin The 17-character VIN
   * @param listingId The ID of the listing if we want to save it directly to the DB
   * @param collectionName The collection to update (e.g. 'passenger_cars')
   */
  static async verifyVin(vin: string, listingId?: string, collectionName: string = 'cars'): Promise<VinVerification> {
    serviceLogger.info('[VinVerification] Starting VIN Verification process', { vin });

    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN length. Must be exactly 17 characters.');
    }

    try {
      // Simulate API Call to Data Provider (e.g. EUCARIS, carVertical)
      const mockResult = await this.simulateApiCall(vin);
      
      // Update the listing in Firestore if ID is provided
      if (listingId && collectionName) {
         const docRef = doc(db, collectionName, listingId);
         
         // 🛡️ Constitution compliance: Store verification safely
         await updateDoc(docRef, {
           'vinVerification': mockResult
         });
         serviceLogger.info('[VinVerification] Successfully updated listing with VIN data', { listingId });
      }

      return mockResult;
    } catch (error) {
      serviceLogger.error('[VinVerification] Verification failed', error as Error);
      throw error;
    }
  }

  /**
   * Mock API Call imitating a real EU Database response
   * TODO: Replace with real HTTP request to chosen provider when launching to production
   */
  private static async simulateApiCall(vin: string): Promise<VinVerification> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mocking logic: 
        // If VIN ends with 'X', it has flags (simulating salvage/rollback). 
        // Otherwise, it's clean.
        const isSuspicious = vin.endsWith('X') || vin.endsWith('x');
        
        const result: VinVerification = {
          isVerified: true,
          provider: 'EUCARIS-Mock',
          verifiedAt: Timestamp.now(),
          reportId: `REP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        };

        if (isSuspicious) {
          result.hasFlags = true;
          result.reportedMileage = 345000;
          result.flagsSummary = ['Mileage inconsistency detected', 'Salvage title recovered in DE'];
        } else {
          result.hasFlags = false;
          result.reportedMileage = Math.floor(Math.random() * 80000) + 15000;
        }

        resolve(result);
      }, 1500); // Simulate network delay
    });
  }
}
