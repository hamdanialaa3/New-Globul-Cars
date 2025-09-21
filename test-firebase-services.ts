// test-firebase-services.ts
// Test file for Firebase Services Integration

import { BulgarianCarServices, initializeEmulators } from './firebase-services.js';

async function testFirebaseServices() {
  console.log('🧪 Testing Firebase Services for Bulgarian Car Marketplace');

  try {
    // Initialize emulators for testing
    await initializeEmulators();

    // Test car addition
    console.log('📝 Testing car addition...');
    const carResult = await BulgarianCarServices.addCar({
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      price: 85000,
      currency: 'EUR',
      location: 'София',
      description: 'Отличен автомобил в перфектно състояние'
    });

    if (carResult.success) {
      console.log('✅ Car added successfully:', carResult.id);
    } else {
      console.log('❌ Failed to add car:', carResult.error);
    }

    // Test car retrieval
    console.log('🔍 Testing car retrieval...');
    const carsResult = await BulgarianCarServices.getCars({ brand: 'BMW' });

    if (carsResult.success) {
      console.log('✅ Retrieved cars:', carsResult.cars?.length || 0);
    } else {
      console.log('❌ Failed to retrieve cars:', carsResult.error);
    }

    // Test remote config
    console.log('⚙️ Testing remote config...');
    const maxImages = await BulgarianCarServices.getRemoteConfigValue('max_car_images');
    console.log('📊 Max car images from remote config:', maxImages);

    console.log('🎉 All Firebase services tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testFirebaseServices();
}

export { testFirebaseServices };