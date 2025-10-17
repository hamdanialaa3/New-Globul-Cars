// Test Firebase Query - Debug tool
// أداة فحص استعلامات Firebase

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

export async function testMakeFilter(make: string) {
  console.log('🔍 Testing make filter:', make);
  
  try {
    // Test 1: Get all cars
    const allCarsQuery = query(collection(db, 'cars'));
    const allCarsSnapshot = await getDocs(allCarsQuery);
    console.log('📊 Total cars in database:', allCarsSnapshot.size);
    
    // Log first 3 cars to check their structure
    let count = 0;
    allCarsSnapshot.forEach((doc) => {
      if (count < 3) {
        const data = doc.data();
        console.log('🚗 Sample car:', {
          id: doc.id,
          make: data.make,
          model: data.model,
          year: data.year,
          region: data.region,
          status: data.status
        });
        count++;
      }
    });
    
    // Test 2: Filter by make
    const makeQuery = query(
      collection(db, 'cars'),
      where('make', '==', make)
    );
    const makeSnapshot = await getDocs(makeQuery);
    console.log(`🎯 Cars with make=${make}:`, makeSnapshot.size);
    
    makeSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('  -', {
        id: doc.id,
        make: data.make,
        model: data.model,
        year: data.year
      });
    });
    
    return {
      totalCars: allCarsSnapshot.size,
      filteredCars: makeSnapshot.size
    };
  } catch (error) {
    console.error('❌ Error testing make filter:', error);
    throw error;
  }
}

// Test in browser console:
// import { testMakeFilter } from './utils/test-firebase-query';
// testMakeFilter('Kia').then(result => console.log('Result:', result));

