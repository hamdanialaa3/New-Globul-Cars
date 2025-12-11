/**
 * 🔍 DEBUG SCRIPT: Check if car has images in Firestore
 * 
 * Usage: Run this in browser console on car details page
 * Or paste into Firebase Console > Firestore > Query
 */

// Car ID from URL: http://localhost:3000/car/4jn62vEufTmNlVecv9tm
const carId = '4jn62vEufTmNlVecv9tm';

// Check in 'cars' collection
import { doc, getDoc } from 'firebase/firestore';
import { db } from './bulgarian-car-marketplace/src/firebase/firebase-config';

async function checkCarImages() {
  console.log('🔍 Checking car images for ID:', carId);
  
  const carRef = doc(db, 'cars', carId);
  const carDoc = await getDoc(carRef);
  
  if (!carDoc.exists()) {
    console.log('❌ Car not found in "cars" collection. Checking other collections...');
    
    // Check other vehicle type collections
    const collections = ['motorcycles', 'trucks', 'buses', 'trailers', 'construction-vehicles'];
    for (const collectionName of collections) {
      const ref = doc(db, collectionName, carId);
      const vehicleDoc = await getDoc(ref);
      
      if (vehicleDoc.exists()) {
        console.log(`✅ Found vehicle in "${collectionName}" collection`);
        const data = vehicleDoc.data();
        console.log('📸 Images:', data.images);
        console.log('📊 Images count:', data.images?.length || 0);
        console.log('📄 Full data:', data);
        return;
      }
    }
    
    console.log('❌ Vehicle not found in any collection');
    return;
  }
  
  const carData = carDoc.data();
  console.log('✅ Car found in "cars" collection');
  console.log('📸 Images:', carData.images);
  console.log('📊 Images count:', carData.images?.length || 0);
  console.log('📄 Full car data:', carData);
  
  // Check if images field exists but is empty
  if (!carData.images || carData.images.length === 0) {
    console.log('⚠️ PROBLEM: images field is missing or empty!');
    console.log('💡 Expected: images array with Firebase Storage URLs');
    console.log('💡 Actual:', carData.images);
  } else {
    console.log('✅ Images found:', carData.images.length, 'images');
    console.log('🔗 Image URLs:', carData.images);
  }
}

checkCarImages().catch(error => {
  console.error('❌ Error checking car images:', error);
});
