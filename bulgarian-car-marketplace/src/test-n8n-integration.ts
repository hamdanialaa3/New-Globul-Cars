// Test script for n8n integration with Globul Cars
// اختبار تكامل n8n مع مشروع Globul Cars

import N8nIntegrationService from '../src/services/n8n-integration';

// Test data
const testUserId = 'test-user-12345';
const testUserProfile = {
  displayName: 'Test User',
  email: 'test@globul.net',
  language: 'bg'
};

// تشغيل اختبارات التكامل
async function runIntegrationTests() {
  console.log('🧪 Starting n8n Integration Tests...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing n8n Health Check...');
  try {
    const isHealthy = await N8nIntegrationService.healthCheck();
    console.log(`   ✅ Health Check: ${isHealthy ? 'PASSED' : 'FAILED'}\n`);
  } catch (error) {
    console.log(`   ❌ Health Check Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }

  // Test 2: Sell Started Event
  console.log('2️⃣ Testing Sell Started Event...');
  try {
    const result = await N8nIntegrationService.onSellStarted(testUserId, testUserProfile);
    console.log('   ✅ Sell Started Event: SENT');
    console.log('   📊 Response:', result);
    console.log('');
  } catch (error) {
    console.log(`   ❌ Sell Started Event Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }

  // Wait a bit before next test
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Vehicle Type Selection
  console.log('3️⃣ Testing Vehicle Type Selection...');
  try {
    const result = await N8nIntegrationService.onVehicleTypeSelected(testUserId, 'car');
    console.log('   ✅ Vehicle Type Selection: SENT');
    console.log('   📊 Response:', result);
    console.log('');
  } catch (error) {
    console.log(`   ❌ Vehicle Type Selection Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }

  // Test 4: Seller Type Detection
  console.log('4️⃣ Testing Seller Type Detection...');
  try {
    const result = await N8nIntegrationService.onSellerTypeDetected(testUserId, 'private', false);
    console.log('   ✅ Seller Type Detection: SENT');
    console.log('   📊 Response:', result);
    console.log('');
  } catch (error) {
    console.log(`   ❌ Seller Type Detection Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }

  // Test 5: Car Published Event
  console.log('5️⃣ Testing Car Published Event...');
  try {
    const testCarData = {
      make: 'BMW',
      model: 'X5',
      year: 2020,
      price: 45000,
      currency: 'EUR'
    };
    const result = await N8nIntegrationService.onCarPublished(testUserId, 'test-car-123', testCarData);
    console.log('   ✅ Car Published Event: SENT');
    console.log('   📊 Response:', result);
    console.log('');
  } catch (error) {
    console.log(`   ❌ Car Published Event Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }

  console.log('🎉 Integration Tests Completed!');
  console.log('🔗 Check n8n dashboard at: http://localhost:5678');
  console.log('👀 Look for workflow executions in the "Executions" tab');
}

// Test individual webhook endpoints
async function testWebhookEndpoints() {
  console.log('\n🔗 Testing Individual Webhook Endpoints...\n');

  const webhooks = [
    {
      name: 'Sell Started',
      url: 'http://localhost:5678/webhook/sell-started',
      data: {
        userId: testUserId,
        userProfile: testUserProfile,
        timestamp: new Date().toISOString()
      }
    },
    {
      name: 'Vehicle Type Selected',
      url: 'http://localhost:5678/webhook/vehicle-type-selected',
      data: {
        userId: testUserId,
        vehicleType: 'suv',
        timestamp: new Date().toISOString()
      }
    }
  ];

  for (const webhook of webhooks) {
    console.log(`📡 Testing ${webhook.name}...`);
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhook.data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ ${webhook.name}: SUCCESS`);
        console.log('   📊 Response:', result);
      } else {
        console.log(`   ❌ ${webhook.name}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${webhook.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log('');
  }
}

// معلومات مفيدة للمطور
function showDeveloperInfo() {
  console.log('\n📋 Developer Information:');
  console.log('🌐 n8n Editor: http://localhost:5678');
  console.log('🔑 Username: globul_admin');
  console.log('🔑 Password: globul2025!');
  console.log('\n📁 Workflow Files Created:');
  console.log('   • n8n-workflows/01-sell-process-started.json');
  console.log('   • n8n-workflows/02-vehicle-type-selected.json');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Import workflows into n8n');
  console.log('   2. Activate workflows');
  console.log('   3. Test webhooks');
  console.log('   4. Monitor executions');
}

// تشغيل الاختبارات
if (typeof window === 'undefined') {
  // Node.js environment
  runIntegrationTests()
    .then(() => testWebhookEndpoints())
    .then(() => showDeveloperInfo())
    .catch(console.error);
} else {
  // Browser environment
  (window as any).testN8nIntegration = {
    runTests: runIntegrationTests,
    testWebhooks: testWebhookEndpoints,
    showInfo: showDeveloperInfo
  };
}

export {
  runIntegrationTests,
  testWebhookEndpoints,
  showDeveloperInfo
};