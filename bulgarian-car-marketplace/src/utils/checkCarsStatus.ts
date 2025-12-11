/**
 * Check and Fix Cars Status Utility
 * أداة فحص وإصلاح حالة السيارات
 * 
 * استخدمها من Console في المتصفح
 */

import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';

const COLLECTIONS = [
  'cars',
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses'
];

interface CarStatus {
  id: string;
  collection: string;
  make?: string;
  model?: string;
  year?: number;
  status?: string;
  isActive?: boolean;
  isSold?: boolean;
  isVisible: boolean;
  reason?: string;
}

export async function checkAllCarsStatus(): Promise<CarStatus[]> {
  logger.info('Checking all cars status');
  
  const allCars: CarStatus[] = [];
  
  for (const collectionName of COLLECTIONS) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      
      if (snapshot.empty) {
        logger.warn(`${collectionName}: No documents`);
        continue;
      }
      
      logger.info(`${collectionName}: ${snapshot.size} documents`);
      
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        
        // Check visibility
        const isVisible = (
          data.status === 'active' &&
          data.isActive !== false &&
          data.isSold !== true
        );
        
        const reason = !isVisible ? (
          data.status !== 'active' ? 'status is not "active"' :
          data.isActive === false ? 'isActive is false' :
          data.isSold === true ? 'isSold is true' :
          'unknown'
        ) : undefined;
        
        allCars.push({
          id: docSnap.id,
          collection: collectionName,
          make: data.make,
          model: data.model,
          year: data.year,
          status: data.status,
          isActive: data.isActive,
          isSold: data.isSold,
          isVisible,
          reason
        });
        
        if (!isVisible) {
          logger.warn(`HIDDEN: ${data.make} ${data.model}`, { reason });
        } else {
          logger.debug(`VISIBLE: ${data.make} ${data.model}`);
        }
      });
    } catch (error) {
      logger.error(`Error checking ${collectionName}`, error as Error);
    }
  }
  
  // Summary
  const visibleCount = allCars.filter(c => c.isVisible).length;
  const hiddenCount = allCars.filter(c => !c.isVisible).length;
  
  logger.info('Cars Status Summary', {
    total: allCars.length,
    visible: visibleCount,
    hidden: hiddenCount
  });
  
  return allCars;
}

export async function fixAllCarsStatus(): Promise<number> {
  logger.info('Fixing all cars status');
  
  let fixedCount = 0;
  
  for (const collectionName of COLLECTIONS) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      
      if (snapshot.empty) {
        continue;
      }
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        const updates: any = {};
        let needsUpdate = false;
        
        // Check and fix status
        if (!data.status || data.status !== 'active') {
          updates.status = 'active';
          needsUpdate = true;
        }
        
        // Check and fix isActive
        if (data.isActive === undefined || data.isActive !== true) {
          updates.isActive = true;
          needsUpdate = true;
        }
        
        // Check and fix isSold
        if (data.isSold === undefined || data.isSold !== false) {
          updates.isSold = false;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          try {
            await updateDoc(doc(db, collectionName, docSnap.id), {
              ...updates,
              updatedAt: serverTimestamp()
            });
            
            fixedCount++;
            logger.info(`Fixed car: ${data.make} ${data.model}`, { collection: collectionName, id: docSnap.id, updates });
          } catch (error) {
            logger.error(`Failed to fix ${docSnap.id}`, error as Error);
          }
        }
      }
    } catch (error) {
      logger.error(`Error fixing ${collectionName}`, error as Error);
    }
  }
  
  logger.info('Fixing cars complete', { fixedCount });
  
  return fixedCount;
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).checkAllCarsStatus = checkAllCarsStatus;
  (window as any).fixAllCarsStatus = fixAllCarsStatus;
}

