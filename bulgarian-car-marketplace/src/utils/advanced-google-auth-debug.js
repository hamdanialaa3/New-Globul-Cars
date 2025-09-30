// src/utils/advanced-google-auth-debug.js
// أداة تشخيص متقدمة لمشاكل Google Authentication

export const advancedGoogleAuthDebug = async () => {
  console.clear();
  console.log('🔍 تشخيص متقدم لمشاكل Google Authentication');
  console.log('='.repeat(60));

  // 1. فحص متغيرات البيئة مقابل القيم المطلوبة
  console.group('1️⃣ مقارنة التكوين');
  const expectedConfig = {
    apiKey: "AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs",
    authDomain: "studio-448742006-a3493.firebaseapp.com", 
    projectId: "studio-448742006-a3493",
    storageBucket: "studio-448742006-a3493.firebasestorage.app",
    messagingSenderId: "687922812237",
    appId: "1:687922812237:web:e2f36cf22eab4e53ddd304"
  };

  const currentConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };

  let configCorrect = true;
  Object.keys(expectedConfig).forEach(key => {
    if (currentConfig[key] === expectedConfig[key]) {
      console.log(`✅ ${key}: صحيح`);
    } else {
      console.error(`❌ ${key}:`);
      console.error(`   المطلوب: ${expectedConfig[key]}`);
      console.error(`   الحالي: ${currentConfig[key] || 'غير موجود'}`);
      configCorrect = false;
    }
  });

  if (!configCorrect) {
    console.error('❌ التكوين غير صحيح! يرجى تحديث ملف .env');
  }
  console.groupEnd();

  // 2. اختبار الاتصال بـ Firebase
  console.group('2️⃣ اختبار الاتصال بـ Firebase');
  try {
    const authDomain = currentConfig.authDomain;
    console.log('🔗 اختبار الوصول إلى:', authDomain);
    
    await fetch(`https://${authDomain}`, { 
      method: 'HEAD',
      mode: 'no-cors' 
    });
    console.log('✅ الاتصال بـ Firebase نجح');
  } catch (error) {
    console.error('❌ فشل الاتصال بـ Firebase:', error.message);
  }
  console.groupEnd();

  // 3. فحص Firebase Auth
  console.group('3️⃣ فحص Firebase Auth');
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    console.log('✅ Firebase Auth مُهيأ');
    console.log('Auth Domain:', auth.config.authDomain);
    console.log('Current User:', auth.currentUser ? auth.currentUser.email : 'غير مسجل دخول');
    
    // فحص إعدادات Auth
    console.group('إعدادات Auth');
    console.log('Language Code:', auth.languageCode);
    console.log('Settings:', {
      appVerificationDisabledForTesting: auth.settings?.appVerificationDisabledForTesting,
    });
    console.groupEnd();
    
  } catch (error) {
    console.error('❌ خطأ في Firebase Auth:', error);
  }
  console.groupEnd();

  // 4. اختبار Google Provider
  console.group('4️⃣ اختبار Google Provider');
  try {
    const { GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    
    console.log('✅ Google Provider تم إنشاؤه');
    console.log('Provider ID:', provider.providerId);
    console.log('Scopes:', provider.scopes || []);
    console.log('Custom Parameters:', provider.customParameters || {});
  } catch (error) {
    console.error('❌ خطأ في Google Provider:', error);
  }
  console.groupEnd();

  // 5. فحص المتصفح والبيئة
  console.group('5️⃣ فحص المتصفح والبيئة');
  console.log('URL الحالي:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Protocol:', window.location.protocol);
  console.log('Host:', window.location.host);
  console.log('المتصفح:', navigator.userAgent.split(' ').slice(-2).join(' '));
  console.log('الوضع:', process.env.NODE_ENV);

  // فحص popup support
  try {
    const testPopup = window.open('', '_blank', 'width=1,height=1');
    if (testPopup) {
      testPopup.close();
      console.log('✅ النوافذ المنبثقة مدعومة');
    } else {
      console.warn('⚠️ النوافذ المنبثقة محجوبة');
    }
  } catch (error) {
    console.error('❌ النوافذ المنبثقة غير مدعومة:', error.message);
  }
  console.groupEnd();

  // 6. اختبار Google OAuth URLs
  console.group('6️⃣ اختبار URLs');
  const testUrls = [
    'https://accounts.google.com',
    'https://www.googleapis.com',
    `https://${currentConfig.authDomain}`,
  ];

  for (const url of testUrls) {
    try {
      console.log(`🔗 اختبار: ${url}`);
      await fetch(url, { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      console.log(`✅ ${url}: متاح`);
    } catch (error) {
      console.error(`❌ ${url}: غير متاح - ${error.message}`);
    }
  }
  console.groupEnd();

  // 7. تحليل الأخطاء المحتملة
  console.group('7️⃣ التحليل والتوصيات');
  
  const recommendations = [];
  
  if (!configCorrect) {
    recommendations.push('❌ تحديث ملف .env بالقيم الصحيحة');
  }
  
  if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    recommendations.push('❌ استخدام HTTPS في الإنتاج');
  }
  
  if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    recommendations.push('⚠️ التأكد من إضافة النطاق إلى Firebase Authorized Domains');
  }

  if (recommendations.length === 0) {
    console.log('✅ لم يتم العثور على مشاكل واضحة في التكوين');
    console.log('🔍 المشكلة قد تكون في:');
    console.log('   1. إعدادات Firebase Console (Google Provider)');
    console.log('   2. إعدادات Google Cloud Console (OAuth)');
    console.log('   3. شبكة أو جدار حماية');
  } else {
    console.log('📋 التوصيات:');
    recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }
  console.groupEnd();

  console.log('='.repeat(60));
  console.log('انتهى التشخيص المتقدم');
};

// اختبار مفصل لـ Google Sign-in
export const detailedGoogleSignInTest = async () => {
  console.group('🧪 اختبار Google Sign-in مفصل');
  
  try {
    // استيراد المكتبات
    console.log('📦 استيراد Firebase modules...');
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    // إضافة scopes
    provider.addScope('email');
    provider.addScope('profile');
    
    console.log('✅ تم تحضير Auth و Provider');
    console.log('Auth config:', {
      authDomain: auth.config.authDomain,
      apiKey: auth.config.apiKey?.substring(0, 10) + '...'
    });
    
    // محاولة الاتصال
    console.log('🚀 بدء محاولة signInWithPopup...');
    
    const result = await signInWithPopup(auth, provider);
    
    console.log('✅ نجح تسجيل الدخول!');
    console.log('User Info:', {
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid,
      photoURL: result.user.photoURL
    });
    
    return { success: true, user: result.user };
    
  } catch (error) {
    console.error('❌ فشل تسجيل الدخول:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    
    // تحليل الخطأ
    console.group('🔍 تحليل الخطأ');
    switch (error.code) {
      case 'auth/popup-blocked':
        console.log('💡 الحل: تفعيل النوافذ المنبثقة أو استخدام redirect');
        break;
      case 'auth/unauthorized-domain':
        console.log('💡 الحل: إضافة النطاق إلى Firebase Authorized Domains');
        console.log('   Firebase Console → Authentication → Settings → Authorized domains');
        break;
      case 'auth/operation-not-allowed':
        console.log('💡 الحل: تفعيل Google provider في Firebase Console');
        console.log('   Firebase Console → Authentication → Sign-in method → Google');
        break;
      case 'auth/invalid-api-key':
        console.log('💡 الحل: التحقق من صحة API Key في .env');
        break;
      case 'auth/network-request-failed':
        console.log('💡 الحل: التحقق من الاتصال بالإنترنت أو جدار الحماية');
        break;
      default:
        console.log('💡 خطأ غير معروف - تحقق من إعدادات Firebase و Google Cloud Console');
    }
    console.groupEnd();
    
    return { success: false, error, user: null };
  } finally {
    console.groupEnd();
  }
};

// جعل الأدوات متاحة عالمياً
if (typeof window !== 'undefined') {
  window.advancedGoogleAuthDebug = advancedGoogleAuthDebug;
  window.detailedGoogleSignInTest = detailedGoogleSignInTest;
}