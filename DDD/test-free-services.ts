// Test Free Services Integration
// (Comment removed - was in Arabic)

import { bulgarianTranslationService } from './translation-service-free';
import { bulgarianSocketService } from './socket-service';
import { supabase } from './supabase-config';
import { verifyCaptcha } from './hcaptcha-service-clean';
// Test Translation Service
async function testTranslation() {
try {
    // Test basic translation
    const result1 = await bulgarianTranslationService.translateToBulgarian('Hello world', 'en');
const result2 = await bulgarianTranslationService.translateFromBulgarian('Здравей свят', 'en');
// Test car field translation
    const carField = await bulgarianTranslationService.translateCarField('price', 'Цена', 'en');

} catch (error) {
    console.error('❌ خطأ في خدمة الترجمة:', error instanceof Error ? error.message : String(error));
  }
}

// Test Socket.io Service
function testSocket() {
try {
    const isConnected = bulgarianSocketService.isConnected();

} catch (error) {
    console.error('❌ خطأ في خدمة Socket.io:', error instanceof Error ? error.message : String(error));
  }
}

// Test Supabase Service
async function testSupabase() {
try {
    // Test connection
    const { data, error } = await supabase.from('test').select('*').limit(1);
    if (error) {
      console.log('Mock Supabase connection test completed');
    } else {
      console.log('Mock Supabase data retrieved');
    }
} catch (error) {
    console.error('❌ خطأ في خدمة Supabase:', error instanceof Error ? error.message : String(error));
  }
}

// Test hCaptcha Service
async function testCaptcha() {
try {
    const siteKey = process.env.REACT_APP_HCAPTCHA_SITE_KEY;
    if (siteKey && siteKey !== 'your-hcaptcha-site-key') {
} else {
}
} catch (error) {
    console.error('❌ خطأ في خدمة hCaptcha:', error instanceof Error ? error.message : String(error));
  }
}

// Test Environment Variables
function testEnvironment() {
const envVars = [
    { name: 'REACT_APP_SUPABASE_URL', value: process.env.REACT_APP_SUPABASE_URL },
    { name: 'REACT_APP_SUPABASE_ANON_KEY', value: process.env.REACT_APP_SUPABASE_ANON_KEY },
    { name: 'NEXTAUTH_SECRET', value: process.env.NEXTAUTH_SECRET },
    { name: 'REACT_APP_SOCKET_URL', value: process.env.REACT_APP_SOCKET_URL },
    { name: 'REACT_APP_HCAPTCHA_SITE_KEY', value: process.env.REACT_APP_HCAPTCHA_SITE_KEY },
  ];

  envVars.forEach(({ name, value }) => {
    if (value && value !== `your-${name.toLowerCase().replace('react_app_', '')}`) {
} else {
}
  });
}

// Main test function
async function runAllTests() {
await testTranslation();
  testSocket();
  await testSupabase();
  await testCaptcha();
  testEnvironment();

}

// Export for use in other files
export { runAllTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}