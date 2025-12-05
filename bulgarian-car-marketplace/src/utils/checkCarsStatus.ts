/**
 * Check and Fix Cars Status Utility
 * أداة فحص وإصلاح حالة السيارات
 * 
 * استخدمها من Console في المتصفح
 */

import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

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
  console.log('🔍 Checking all cars status...');
  
  const allCars: CarStatus[] = [];
  
  for (const collectionName of COLLECTIONS) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      
      if (snapshot.empty) {
        console.log(`⚠️  ${collectionName}: No documents`);
        continue;
      }
      
      console.log(`📦 ${collectionName}: ${snapshot.size} documents`);
      
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
          console.warn(`❌ HIDDEN: ${data.make} ${data.model} - ${reason}`);
        } else {
          console.log(`✅ VISIBLE: ${data.make} ${data.model}`);
        }
      });
    } catch (error) {
      console.error(`❌ Error checking ${collectionName}:`, error);
    }
  }
  
  // Summary
  const visibleCount = allCars.filter(c => c.isVisible).length;
  const hiddenCount = allCars.filter(c => !c.isVisible).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`Total cars: ${allCars.length}`);
  console.log(`Visible: ${visibleCount} ✅`);
  console.log(`Hidden: ${hiddenCount} ❌`);
  console.log('='.repeat(60));
  
  return allCars;
}

export async function fixAllCarsStatus(): Promise<number> {
  console.log('🔧 Fixing all cars status...');
  
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
            console.log(`✅ Fixed: ${data.make} ${data.model} (${collectionName}/${docSnap.id})`);
            console.log(`   Updates: ${JSON.stringify(updates)}`);
          } catch (error) {
            console.error(`❌ Failed to fix ${docSnap.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${collectionName}:`, error);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎉 Fixed ${fixedCount} cars!`);
  console.log('='.repeat(60));
  
  return fixedCount;
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).checkAllCarsStatus = checkAllCarsStatus;
  (window as any).fixAllCarsStatus = fixAllCarsStatus;
}

