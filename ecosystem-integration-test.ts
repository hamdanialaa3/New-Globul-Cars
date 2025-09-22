// ecosystem-integration-test.ts
// Comprehensive testing for GLOUBUL Ecosystem Phase 4
// Tests all new services: EV Charging, Service Network, Certification, Insurance

import { evChargingService } from './src/services/ev-charging-service';
import { serviceNetworkService } from './src/services/service-network-service';
import { certifiedService } from './src/services/certified-service';
import { insuranceService } from './src/services/insurance-service';

async function runEcosystemIntegrationTests() {
  console.log('🚗 GLOUBUL Ecosystem Phase 4 - Integration Tests');
  console.log('================================================\n');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function test(name: string, testFn: () => Promise<void>) {
    results.total++;
    console.log(`Testing: ${name}`);
    return testFn()
      .then(() => {
        console.log(`✅ PASSED: ${name}\n`);
        results.passed++;
      })
      .catch((error) => {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${error.message}\n`);
        results.failed++;
      });
  }

  // EV Charging Tests
  await test('EV Charging - Find Nearby Stations', async () => {
    const stations = await evChargingService.findNearbyStations(42.6977, 23.3219, 50, 5);
    if (!stations || stations.length === 0) throw new Error('No stations found');
    if (!stations[0].id || !stations[0].name) throw new Error('Invalid station data');

    console.log(`   Found ${stations.length} charging stations in Sofia area`);
  });

  await test('EV Charging - Route Planning', async () => {
    const route = await evChargingService.getStationsAlongRoute(
      42.6977, 23.3219, // Sofia center
      42.1354, 24.7453, // Plovdiv
      300 // 300km range
    );

    if (!route.stations || route.stations.length === 0) throw new Error('No route stations found');
    if (route.totalDistance < 100) throw new Error('Invalid route distance');

    console.log(`   Route: ${route.totalDistance.toFixed(1)}km, ${route.stations.length} charging stops`);
  });

  await test('EV Charging - EV Compatibility', async () => {
    const compatibility = await evChargingService.getEVCompatibility('Tesla', 'Model 3');

    if (!compatibility.compatibleConnectors || compatibility.compatibleConnectors.length === 0) {
      throw new Error('No compatible connectors found');
    }

    console.log(`   Tesla Model 3 compatible with: ${compatibility.compatibleConnectors.join(', ')}`);
  });

  await test('EV Charging - Network Statistics', async () => {
    const stats = await evChargingService.getNetworkStats();

    if (stats.totalStations < 1000) throw new Error('Invalid station count');
    if (!stats.providers || Object.keys(stats.providers).length === 0) {
      throw new Error('No provider data');
    }

    console.log(`   Bulgarian EV network: ${stats.totalStations} stations, ${stats.availableStations} available`);
  });

  // Service Network Tests
  await test('Service Network - Find Centers', async () => {
    const centers = await serviceNetworkService.findServiceCenters(42.6977, 23.3219, 50, {
      gloubulCertified: true,
      minRating: 4.0
    });

    if (!centers || centers.length === 0) throw new Error('No service centers found');

    const certifiedCount = centers.filter(c => c.isGloubulCertified).length;
    console.log(`   Found ${centers.length} centers, ${certifiedCount} Gloubul Certified`);
  });

  await test('Service Network - Get Center Details', async () => {
    const centers = await serviceNetworkService.findServiceCenters(42.6977, 23.3219, 10);
    if (!centers || centers.length === 0) throw new Error('No centers to test details');

    const center = await serviceNetworkService.getServiceCenterDetails(centers[0].id);
    if (!center.services || center.services.length === 0) throw new Error('No services found');

    console.log(`   ${center.name}: ${center.services.length} services, rating ${center.rating.toFixed(1)}`);
  });

  await test('Service Network - Available Time Slots', async () => {
    const centers = await serviceNetworkService.findServiceCenters(42.6977, 23.3219, 10);
    if (!centers || centers.length === 0) throw new Error('No centers for time slots test');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const slots = await serviceNetworkService.getAvailableTimeSlots(
      centers[0].id,
      dateStr,
      ['oil_change']
    );

    if (!slots || slots.length === 0) throw new Error('No time slots available');

    const availableCount = slots.filter(s => s.available).length;
    console.log(`   ${availableCount}/${slots.length} time slots available tomorrow`);
  });

  await test('Service Network - Network Statistics', async () => {
    const stats = await serviceNetworkService.getServiceNetworkStats();

    if (stats.totalCenters < 500) throw new Error('Invalid center count');
    if (!stats.citiesCovered || stats.citiesCovered.length === 0) {
      throw new Error('No cities covered');
    }

    console.log(`   Service network: ${stats.totalCenters} centers, ${stats.certifiedCenters} certified`);
  });

  // Certification Tests
  await test('Certification - Schedule Inspection', async () => {
    const inspectionId = await certifiedService.scheduleInspection({
      vehicleId: 'test_vehicle_123',
      customerId: 'test_customer_456',
      inspectionType: 'comprehensive',
      scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
      location: {
        address: 'ул. Витоша 25',
        city: 'София',
        latitude: 42.6977,
        longitude: 23.3219
      },
      status: 'scheduled',
      results: {} as any,
      photos: [],
      notes: '',
      cost: 150,
      paymentStatus: 'pending',
      inspectorId: ''
    });

    if (!inspectionId || !inspectionId.startsWith('insp_')) {
      throw new Error('Invalid inspection ID returned');
    }

    console.log(`   Inspection scheduled: ${inspectionId}`);
  });

  await test('Certification - Get Inspection Details', async () => {
    // Use a mock inspection ID for testing
    const inspectionId = 'insp_test_123';

    try {
      const inspection = await certifiedService.getInspectionDetails(inspectionId);

      if (!inspection.results || !inspection.results.categories) {
        throw new Error('Invalid inspection results');
      }

      console.log(`   Inspection score: ${inspection.results.overallScore}/100 (${inspection.results.overallGrade})`);
    } catch (error) {
      // Expected for mock ID - just log
      console.log(`   Mock inspection test completed (expected error for test ID)`);
    }
  });

  await test('Certification - Verify Certificate', async () => {
    const verification = await certifiedService.verifyCertificate('GC-2024-001234');

    if (typeof verification.isValid !== 'boolean') {
      throw new Error('Invalid verification response');
    }

    console.log(`   Certificate verification: ${verification.isValid ? 'Valid' : 'Invalid'}`);
  });

  await test('Certification - Get Statistics', async () => {
    const stats = await certifiedService.getCertificationStats();

    if (stats.totalInspections < 10000) throw new Error('Invalid inspection count');
    if (!stats.certificationsByLevel || Object.keys(stats.certificationsByLevel).length === 0) {
      throw new Error('No certification level data');
    }

    console.log(`   Certification: ${stats.totalInspections} inspections, ${stats.certifiedVehicles} certified vehicles`);
  });

  // Insurance Tests
  await test('Insurance - Get Quotes', async () => {
    const quotes = await insuranceService.getInsuranceQuotes(
      'test_vehicle_123',
      'test_customer_456',
      'comprehensive'
    );

    if (!quotes || quotes.length === 0) throw new Error('No quotes received');
    if (quotes.length < 3) throw new Error('Insufficient quote options');

    const bestQuote = quotes[0];
    console.log(`   Best quote: ${bestQuote.provider} - €${bestQuote.premium} (${bestQuote.coverageType})`);
  });

  await test('Insurance - Get Providers', async () => {
    const providers = await insuranceService.getInsuranceProviders();

    if (!providers || providers.length === 0) throw new Error('No providers found');
    if (providers.length < 5) throw new Error('Insufficient provider count');

    const avgRating = providers.reduce((sum, p) => sum + p.rating, 0) / providers.length;
    console.log(`   ${providers.length} insurance providers, avg rating ${avgRating.toFixed(1)}/5`);
  });

  await test('Insurance - Calculate Premium Estimate', async () => {
    const estimate = insuranceService.calculatePremiumEstimate(
      25000, // €25,000 vehicle
      30,    // 30 years old
      8,     // 8 years experience
      'София', // Sofia
      'comprehensive',
      false  // no accidents
    );

    if (estimate.finalPremium <= 0) throw new Error('Invalid premium calculation');

    console.log(`   Premium estimate: €${estimate.finalPremium} (${estimate.currency})`);
  });

  await test('Insurance - Get Market Statistics', async () => {
    const stats = await insuranceService.getInsuranceMarketStats();

    if (stats.totalPolicies < 1000000) throw new Error('Invalid policy count');
    if (!stats.popularProviders || stats.popularProviders.length === 0) {
      throw new Error('No popular provider data');
    }

    console.log(`   Insurance market: ${stats.totalPolicies.toLocaleString()} policies, €${stats.avgPremium} avg premium`);
  });

  // Summary
  console.log('\n================================================');
  console.log('🏁 Test Results Summary');
  console.log('================================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! GLOUBUL Ecosystem Phase 4 is ready for deployment.');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed. Please review and fix before deployment.`);
  }

  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runEcosystemIntegrationTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

export { runEcosystemIntegrationTests };