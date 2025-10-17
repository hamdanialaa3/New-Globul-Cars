#!/usr/bin/env node

/**
 * Globul Cars - n8n Webhooks Automated Testing Script
 * 
 * Tests all 21 webhook endpoints automatically
 * Run: node test-all-webhooks.js
 */

const BASE_URL = 'https://globul-cars-bg.app.n8n.cloud/webhook';

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}▶${colors.reset} ${msg}`)
};

// Test data for all endpoints
const webhookTests = [
  // Workflow 1: Sell Process Started
  {
    workflow: 'Sell Process',
    endpoint: '/sell-started',
    body: {
      userId: 'user-test-' + Date.now(),
      timestamp: new Date().toISOString(),
      source: 'automated_test',
      userProfile: {
        displayName: 'Test User',
        email: 'test@globul.net',
        language: 'bg'
      }
    }
  },

  // Workflow 2: Vehicle Type Selected
  {
    workflow: 'Vehicle Type',
    endpoint: '/vehicle-type-selected',
    body: {
      userId: 'user-test-' + Date.now(),
      vehicleType: 'car',
      timestamp: new Date().toISOString(),
      sessionId: 'session-test-' + Date.now()
    }
  },

  // Workflow 3: Complete Sell Workflow
  {
    workflow: 'Complete Sell',
    endpoint: '/seller-type-selected',
    body: {
      userId: 'user-test-' + Date.now(),
      sellerType: 'private',
      timestamp: new Date().toISOString(),
      sessionId: 'session-test-' + Date.now()
    }
  },
  {
    workflow: 'Complete Sell',
    endpoint: '/vehicle-data-entered',
    body: {
      userId: 'user-test-' + Date.now(),
      sessionId: 'session-test-' + Date.now(),
      vehicleData: {
        make: 'BMW',
        model: 'X5',
        year: 2020,
        mileage: 45000,
        fuelType: 'diesel',
        transmission: 'automatic'
      },
      timestamp: new Date().toISOString()
    }
  },
  {
    workflow: 'Complete Sell',
    endpoint: '/equipment-selected',
    body: {
      userId: 'user-test-' + Date.now(),
      sessionId: 'session-test-' + Date.now(),
      equipment: ['air_conditioning', 'navigation', 'leather_seats'],
      timestamp: new Date().toISOString()
    }
  },
  {
    workflow: 'Complete Sell',
    endpoint: '/images-uploaded',
    body: {
      userId: 'user-test-' + Date.now(),
      sessionId: 'session-test-' + Date.now(),
      images: [
        { url: 'https://example.com/car1.jpg', type: 'exterior', order: 1 },
        { url: 'https://example.com/car2.jpg', type: 'interior', order: 2 }
      ],
      totalImages: 2,
      timestamp: new Date().toISOString()
    }
  },
  {
    workflow: 'Complete Sell',
    endpoint: '/price-set',
    body: {
      userId: 'user-test-' + Date.now(),
      sessionId: 'session-test-' + Date.now(),
      price: 35000,
      currency: 'EUR',
      negotiable: true,
      timestamp: new Date().toISOString()
    }
  },
  {
    workflow: 'Complete Sell',
    endpoint: '/contact-info-entered',
    body: {
      userId: 'user-test-' + Date.now(),
      sessionId: 'session-test-' + Date.now(),
      contactInfo: {
        name: 'Test User',
        phone: '+359888123456',
        email: 'test@globul.net',
        preferredContact: 'phone'
      },
      timestamp: new Date().toISOString()
    }
  },
  {
    workflow: 'Complete Sell',
    endpoint: '/listing-published',
    body: {
      userId: 'user-test-' + Date.now(),
      sessionId: 'session-test-' + Date.now(),
      listingId: 'listing-test-' + Date.now(),
      status: 'published',
      publishedAt: new Date().toISOString()
    }
  },

  // Workflow 4: User Tracking
  {
    workflow: 'User Tracking',
    endpoint: '/user-registered',
    body: {
      userId: 'user-test-' + Date.now(),
      email: 'test@globul.net',
      displayName: 'Test User',
      registrationMethod: 'email',
      timestamp: new Date().toISOString()
    }
  },
  {
    workflow: 'User Tracking',
    endpoint: '/user-logged-in',
    body: {
      userId: 'user-test-' + Date.now(),
      timestamp: new Date().toISOString(),
      loginMethod: 'email',
      deviceInfo: {
        type: 'desktop',
        os: 'Windows',
        browser: 'Chrome'
      }
    }
  },
  {
    workflow: 'User Tracking',
    endpoint: '/profile-updated',
    body: {
      userId: 'user-test-' + Date.now(),
      timestamp: new Date().toISOString(),
      updatedFields: ['phone', 'location']
    }
  },
  {
    workflow: 'User Tracking',
    endpoint: '/listing-created',
    body: {
      userId: 'user-test-' + Date.now(),
      listingId: 'listing-test-' + Date.now(),
      vehicleType: 'car',
      make: 'BMW',
      model: 'X5',
      year: 2020,
      price: 35000,
      timestamp: new Date().toISOString()
    }
  },

  // Workflow 5: User Engagement
  {
    workflow: 'User Engagement',
    endpoint: '/car-viewed',
    body: {
      userId: 'user-test-' + Date.now(),
      carId: 'car-test-' + Date.now(),
      timestamp: new Date().toISOString(),
      viewDuration: 45,
      source: 'search_results'
    }
  },
  {
    workflow: 'User Engagement',
    endpoint: '/favorite-added',
    body: {
      userId: 'user-test-' + Date.now(),
      carId: 'car-test-' + Date.now(),
      timestamp: new Date().toISOString(),
      source: 'listing_page'
    }
  },
  {
    workflow: 'User Engagement',
    endpoint: '/message-sent',
    body: {
      event: 'message_sent',
      messageId: 'msg-test-' + Date.now(),
      chatId: 'chat-test-' + Date.now(),
      carId: 'car-test-' + Date.now(),
      senderId: 'user-test-' + Date.now(),
      receiverId: 'seller-test-' + Date.now(),
      text: 'Test message from automated script',
      language: 'en',
      timestamp: new Date().toISOString()
    }
  },
  {
    workflow: 'User Engagement',
    endpoint: '/search-performed',
    body: {
      userId: 'user-test-' + Date.now(),
      timestamp: new Date().toISOString(),
      searchQuery: {
        make: 'BMW',
        yearFrom: 2018,
        yearTo: 2023
      },
      resultsCount: 15
    }
  },

  // Workflow 6: Admin & BI
  {
    workflow: 'Admin & BI',
    endpoint: '/admin-login',
    body: {
      action: 'admin_login',
      adminId: 'admin-test',
      timestamp: new Date().toISOString(),
      data: {
        isNewLocation: false,
        isNewDevice: false,
        multipleFailedAttempts: false
      }
    }
  },
  {
    workflow: 'Admin & BI',
    endpoint: '/admin-action',
    body: {
      action: 'admin_action',
      adminId: 'admin-test',
      timestamp: new Date().toISOString(),
      data: {
        operation: 'view_dashboard',
        targetId: 'dashboard-main'
      }
    }
  },
  {
    workflow: 'Admin & BI',
    endpoint: '/analytics-viewed',
    body: {
      action: 'analytics_viewed',
      adminId: 'admin-test',
      timestamp: new Date().toISOString(),
      data: {
        view: 'sales_dashboard',
        filters: { period: '7d' }
      }
    }
  },
  {
    workflow: 'Admin & BI',
    endpoint: '/system-alert',
    body: {
      action: 'system_alert',
      adminId: 'admin-test',
      timestamp: new Date().toISOString(),
      data: {
        severity: 'low',
        alertType: 'test_alert',
        message: 'Automated test alert'
      }
    }
  }
];

// Test a single webhook
async function testWebhook(test) {
  const url = BASE_URL + test.endpoint;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(test.body)
    });

    const status = response.status;
    let result = { success: false, status, error: null };

    if (status >= 200 && status < 300) {
      result.success = true;
      log.success(`[${test.workflow}] ${test.endpoint} → ${status}`);
    } else {
      const errorText = await response.text();
      result.error = errorText;
      log.error(`[${test.workflow}] ${test.endpoint} → ${status}`);
      log.warn(`   Response: ${errorText.substring(0, 100)}`);
    }

    return result;
  } catch (error) {
    log.error(`[${test.workflow}] ${test.endpoint} → FAILED`);
    log.warn(`   Error: ${error.message}`);
    return { success: false, status: 0, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  Globul Cars - n8n Webhooks Automated Test Suite     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  
  log.info(`Testing ${webhookTests.length} endpoints...`);
  log.info(`Base URL: ${BASE_URL}\n`);

  const results = [];
  let currentWorkflow = '';

  for (const test of webhookTests) {
    if (test.workflow !== currentWorkflow) {
      log.section(`Testing ${test.workflow}`);
      currentWorkflow = test.workflow;
    }

    const result = await testWebhook(test);
    results.push({ ...test, ...result });

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                         ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  const successRate = ((successful / total) * 100).toFixed(1);

  log.info(`Total Tests: ${total}`);
  log.success(`Successful: ${successful}`);
  if (failed > 0) {
    log.error(`Failed: ${failed}`);
  }
  log.info(`Success Rate: ${successRate}%`);

  if (failed > 0) {
    console.log('\n' + colors.yellow + 'Failed Endpoints:' + colors.reset);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint} (${r.status || 'Network Error'})`);
    });
  }

  console.log('\n' + colors.cyan + 'Next Steps:' + colors.reset);
  console.log('  1. Check n8n Executions: https://globul-cars-bg.app.n8n.cloud');
  console.log('  2. Verify workflows are Active');
  console.log('  3. Review any failed endpoints above\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log.error('Fatal error: ' + error.message);
  process.exit(1);
});
