// src/utils/google-auth-debugger.js
// أداة تشخيص مشاكل Google Authentication

export const debugGoogleAuth = async () => {
  console.clear();
  console.log('🔍 بدء تشخيص مشاكل Google Authentication...');
  console.log('='.repeat(50));

  // 1. فحص متغيرات البيئة
  console.group('1️⃣ فحص متغيرات البيئة');
  const envVars = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };

  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
    } else {
      console.error(`❌ ${key}: غير موجود`);
    }
  });
  console.groupEnd();

  // 2. فحص تهيئة Firebase
  console.group('2️⃣ فحص تهيئة Firebase');
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    console.log('✅ Firebase Auth تم تهيئته بنجاح');
    console.log('Auth Domain:', auth.config.authDomain);
    console.log('Current User:', auth.currentUser?.email || 'غير مسجل دخول');
  } catch (error) {
    console.error('❌ خطأ في تهيئة Firebase:', error);
  }
  console.groupEnd();

  // 3. فحص Google Provider
  console.group('3️⃣ فحص Google Provider');
  try {
    const { GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    console.log('✅ Google Provider تم إنشاؤه بنجاح');
    console.log('Provider ID:', provider.providerId);
  } catch (error) {
    console.error('❌ خطأ في إنشاء Google Provider:', error);
  }
  console.groupEnd();

  // 4. فحص الشبكة والنطاق
  console.group('4️⃣ فحص البيئة');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Protocol:', window.location.protocol);
  console.log('Host:', window.location.host);
  console.log('User Agent:', navigator.userAgent.substring(0, 100) + '...');
  console.groupEnd();

  // 5. اختبار الاتصال بـ Firebase
  console.group('5️⃣ اختبار الاتصال بـ Firebase');
  try {
    const response = await fetch(`https://${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN}`);
    console.log('✅ الاتصال بـ Firebase Auth Domain نجح');
    console.log('Status:', response.status);
  } catch (error) {
    console.error('❌ فشل الاتصال بـ Firebase:', error);
  }
  console.groupEnd();

  console.log('='.repeat(50));
  console.log('انتهى التشخيص. تحقق من النتائج أعلاه.');
};

// اختبار Google Sign-in مع تسجيل مفصل
export const testGoogleSignIn = async () => {
  console.group('🧪 اختبار Google Sign-in');
  
  try {
    console.log('⏳ بدء اختبار Google Sign-in...');
    
    // استيراد المكتبات المطلوبة
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    console.log('📱 محاولة فتح popup...');
    const result = await signInWithPopup(auth, provider);
    
    console.log('✅ نجح تسجيل الدخول!');
    console.log('User:', {
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ فشل تسجيل الدخول:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    
    // تحليل الأخطاء الشائعة
    switch (error.code) {
      case 'auth/popup-blocked':
        console.warn('💡 الحل: فعّل النوافذ المنبثقة لهذا الموقع');
        break;
      case 'auth/unauthorized-domain':
        console.warn('💡 الحل: أضف النطاق إلى Firebase Console');
        break;
      case 'auth/operation-not-allowed':
        console.warn('💡 الحل: فعّل Google provider في Firebase Console');
        break;
      case 'auth/popup-closed-by-user':
        console.warn('💡 المستخدم أغلق النافذة المنبثقة');
        break;
      default:
        console.warn('💡 خطأ غير معروف - تحقق من إعدادات Firebase');
    }
    
    throw error;
  } finally {
    console.groupEnd();
  }
};

// جعل الأدوات متاحة عالمياً
if (typeof window !== 'undefined') {
  window.debugGoogleAuth = debugGoogleAuth;
  window.testGoogleSignIn = testGoogleSignIn;
}