// src/utils/test-new-config.js
// اختبار التكوين الجديد لـ Firebase

export const testNewFirebaseConfig = () => {
  console.group('🔧 اختبار التكوين الجديد لـ Firebase');
  
  const config = {
    apiKey: "AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs",
    authDomain: "studio-448742006-a3493.firebaseapp.com",
    projectId: "studio-448742006-a3493",
    storageBucket: "studio-448742006-a3493.firebasestorage.app",
    messagingSenderId: "687922812237",
    appId: "1:687922812237:web:e2f36cf22eab4e53ddd304",
    measurementId: "G-ENC064NX05"
  };

  // التحقق من متغيرات البيئة
  const envConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  };

  console.log('📋 التكوين المطلوب:', config);
  console.log('🔧 التكوين الحالي من .env:', envConfig);

  // مقارنة التكوينات
  const configMatches = JSON.stringify(config) === JSON.stringify(envConfig);
  
  if (configMatches) {
    console.log('✅ التكوين صحيح! جميع القيم تتطابق مع Firebase Console');
  } else {
    console.error('❌ التكوين غير صحيح! هناك اختلافات:');
    
    Object.keys(config).forEach(key => {
      if (config[key] !== envConfig[key]) {
        console.error(`❌ ${key}:`);
        console.error(`   المطلوب: ${config[key]}`);
        console.error(`   الحالي: ${envConfig[key]}`);
      }
    });
  }

  // اختبار معرفات المشروع
  console.group('🔍 فحص معرفات المشروع');
  console.log('Project ID (ينتهي بـ 93):', envConfig.projectId);
  console.log('Project Number (رقم عام):', envConfig.messagingSenderId);
  console.log('App ID (يحتوي على Project Number):', envConfig.appId);
  
  if (envConfig.projectId && envConfig.projectId.endsWith('93')) {
    console.log('✅ Project ID صحيح (ينتهي بـ 93)');
  } else {
    console.error('❌ Project ID خطأ (يجب أن ينتهي بـ 93)');
  }
  
  if (envConfig.messagingSenderId === '687922812237') {
    console.log('✅ Project Number صحيح');
  } else {
    console.error('❌ Project Number خطأ');
  }
  
  console.groupEnd();
  console.groupEnd();

  return { configMatches, config, envConfig };
};

// جعله متاحاً عالمياً للاختبار
if (typeof window !== 'undefined') {
  window.testNewFirebaseConfig = testNewFirebaseConfig;
}