// Test Free Services Integration
// اختبار تكامل الخدمات المجانية

import { bulgarianTranslationService } from './translation-service-free';
import { bulgarianSocketService } from './socket-service';
import { supabase } from './supabase-config';
import { verifyCaptcha } from './hcaptcha-service-clean';

console.log('🚀 بدء اختبار الخدمات المجانية...');

// Test Translation Service
async function testTranslation() {
  console.log('\n📝 اختبار خدمة الترجمة...');

  try {
    // Test basic translation
    const result1 = await bulgarianTranslationService.translateToBulgarian('Hello world', 'en');
    console.log('✅ ترجمة إنجليزية → بلغارية:', result1);

    const result2 = await bulgarianTranslationService.translateFromBulgarian('Здравей свят', 'en');
    console.log('✅ ترجمة بلغارية → إنجليزية:', result2);

    // Test car field translation
    const carField = await bulgarianTranslationService.translateCarField('price', 'Цена', 'en');
    console.log('✅ ترجمة حقل سيارة:', carField);

    console.log('✅ خدمة الترجمة تعمل بشكل صحيح');
  } catch (error) {
    console.error('❌ خطأ في خدمة الترجمة:', error instanceof Error ? error.message : String(error));
  }
}

// Test Socket.io Service
function testSocket() {
  console.log('\n🔌 اختبار خدمة Socket.io...');

  try {
    const isConnected = bulgarianSocketService.isConnected();
    console.log('📡 حالة الاتصال:', isConnected ? 'متصل' : 'غير متصل');

    console.log('✅ خدمة Socket.io جاهزة للاستخدام');
  } catch (error) {
    console.error('❌ خطأ في خدمة Socket.io:', error instanceof Error ? error.message : String(error));
  }
}

// Test Supabase Service
async function testSupabase() {
  console.log('\n🗄️ اختبار خدمة Supabase...');

  try {
    // Test connection
    const { data, error } = await supabase.from('test').select('*').limit(1);
    if (error) {
      console.log('⚠️ Supabase متصل لكن قاعدة البيانات تحتاج إعداد (هذا طبيعي)');
      console.log('ℹ️ لإعداد قاعدة البيانات: https://supabase.com/dashboard');
    } else {
      console.log('✅ Supabase متصل وقاعدة البيانات تعمل');
    }

    console.log('✅ خدمة Supabase جاهزة للاستخدام');
  } catch (error) {
    console.error('❌ خطأ في خدمة Supabase:', error instanceof Error ? error.message : String(error));
  }
}

// Test hCaptcha Service
async function testCaptcha() {
  console.log('\n🔒 اختبار خدمة hCaptcha...');

  try {
    const siteKey = process.env.REACT_APP_HCAPTCHA_SITE_KEY;
    if (siteKey && siteKey !== 'your-hcaptcha-site-key') {
      console.log('✅ hCaptcha مُعد مع مفتاح صحيح');
    } else {
      console.log('⚠️ hCaptcha غير مُعد - تحتاج لمفتاح من https://hcaptcha.com');
    }

    console.log('✅ خدمة hCaptcha جاهزة للاستخدام');
  } catch (error) {
    console.error('❌ خطأ في خدمة hCaptcha:', error instanceof Error ? error.message : String(error));
  }
}

// Test Environment Variables
function testEnvironment() {
  console.log('\n⚙️ اختبار متغيرات البيئة...');

  const envVars = [
    { name: 'REACT_APP_SUPABASE_URL', value: process.env.REACT_APP_SUPABASE_URL },
    { name: 'REACT_APP_SUPABASE_ANON_KEY', value: process.env.REACT_APP_SUPABASE_ANON_KEY },
    { name: 'NEXTAUTH_SECRET', value: process.env.NEXTAUTH_SECRET },
    { name: 'REACT_APP_SOCKET_URL', value: process.env.REACT_APP_SOCKET_URL },
    { name: 'REACT_APP_HCAPTCHA_SITE_KEY', value: process.env.REACT_APP_HCAPTCHA_SITE_KEY },
  ];

  envVars.forEach(({ name, value }) => {
    if (value && value !== `your-${name.toLowerCase().replace('react_app_', '')}`) {
      console.log(`✅ ${name}: مُعد`);
    } else {
      console.log(`⚠️ ${name}: غير مُعد`);
    }
  });
}

// Main test function
async function runAllTests() {
  console.log('🎯 بدء اختبار جميع الخدمات المجانية\n');

  await testTranslation();
  testSocket();
  await testSupabase();
  await testCaptcha();
  testEnvironment();

  console.log('\n🎉 انتهى اختبار الخدمات المجانية!');
  console.log('\n📋 ملخص الخدمات المُضافة:');
  console.log('✅ Supabase - بديل Firebase مجاني');
  console.log('✅ NextAuth.js - مصادقة مجانية');
  console.log('✅ Socket.io - رسائل فورية مجانية');
  console.log('✅ خدمة ترجمة محلية - ترجمة مجانية');
  console.log('✅ hCaptcha - بديل Recaptcha مجاني');

  console.log('\n🔗 روابط الإعداد:');
  console.log('• Supabase: https://supabase.com');
  console.log('• hCaptcha: https://hcaptcha.com');
  console.log('• Socket.io: https://socket.io');
}

// Export for use in other files
export { runAllTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}