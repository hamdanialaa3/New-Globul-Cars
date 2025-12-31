import { logger } from '../services/logger-service';
// src/utils/clean-google-auth.js
// حل نظيف لإعادة تشغيل Google Authentication بدون تداخلات

export const cleanGoogleAuth = async () => {
  console.clear();
  logger.info('🧹 تنظيف Google Authentication وإعادة التشغيل');
  logger.info('='.repeat(50));

  try {
    // 1. مسح جميع البيانات المحفوظة
    logger.info('🗑️ مسح البيانات المحفوظة...');
    localStorage.clear();
    sessionStorage.clear();
    
    // مسح cookies خاصة بـ Firebase
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    logger.info('✅ تم مسح جميع البيانات المحفوظة');

    // 2. إعادة تهيئة Firebase من الصفر
    logger.info('🔄 إعادة تهيئة Firebase...');
    
    // استيراد Firebase
    const { initializeApp } = await import('firebase/app');
    const { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } = await import('firebase/auth');
    
    // Use Firebase config from environment variables
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.REACT_APP_FIREBASE_APP_ID || "",
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ""
    };

    // إنشاء تطبيق Firebase جديد
    const app = initializeApp(firebaseConfig, 'clean-auth-app');
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    // إضافة scopes
    provider.addScope('email');
    provider.addScope('profile');
    
    logger.info('✅ تم إنشاء Firebase app جديد');
    logger.info('Auth Domain:', auth.config.authDomain);

    // 3. استخدام Redirect فقط (تجنب popup completely)
    logger.info('🚀 بدء تسجيل الدخول باستخدام Redirect...');
    logger.info('سيتم توجيهك إلى Google للمصادقة...');
    
    // حفظ معلومات للعودة
    sessionStorage.setItem('auth-attempt', 'true');
    sessionStorage.setItem('auth-timestamp', Date.now().toString());
    
    // استخدام redirect مباشرة
    await signInWithRedirect(auth, provider);
    
    // هذا السطر لن يتم تنفيذه لأن المستخدم سيتم توجيهه
    return { success: true, redirected: true };
    
  } catch (error) {
    logger.error('❌ فشل في التنظيف وإعادة التشغيل:', error);
    logger.error('Error Code:', error.code);
    logger.error('Error Message:', error.message);
    
    return { 
      success: false, 
      error: error,
      message: `فشل في إعادة التشغيل: ${error.message}`
    };
  }
};

// معالج للتحقق من نتيجة redirect عند العودة
export const checkCleanAuthResult = async () => {
  logger.info('🔍 التحقق من نتيجة تسجيل الدخول...');
  
  // التحقق من وجود محاولة مصادقة سابقة
  const authAttempt = sessionStorage.getItem('auth-attempt');
  const authTimestamp = sessionStorage.getItem('auth-timestamp');
  
  if (!authAttempt) {
    logger.info('ℹ️ لا توجد محاولة مصادقة سابقة');
    return null;
  }

  try {
    const { getAuth, getRedirectResult } = await import('firebase/auth');
    const auth = getAuth();
    
    logger.info('📥 التحقق من redirect result...');
    const result = await getRedirectResult(auth);
    
    // مسح علامات المحاولة
    sessionStorage.removeItem('auth-attempt');
    sessionStorage.removeItem('auth-timestamp');
    
    if (result && result.user) {
      logger.info('🎉 نجح تسجيل الدخول عبر Redirect!');
      logger.info('User:', {
        email: result.user.email,
        displayName: result.user.displayName,
        uid: result.user.uid
      });
      
      return {
        success: true,
        user: result.user,
        message: `مرحباً ${result.user.displayName || result.user.email}! تم تسجيل الدخول بنجاح.`
      };
    } else {
      logger.info('ℹ️ لا توجد نتيجة redirect');
      return null;
    }
    
  } catch (error) {
    logger.error('❌ خطأ في التحقق من redirect result:', error);
    
    // مسح علامات المحاولة في حالة الخطأ
    sessionStorage.removeItem('auth-attempt');
    sessionStorage.removeItem('auth-timestamp');
    
    return {
      success: false,
      error: error,
      message: `خطأ في المصادقة: ${error.message}`
    };
  }
};

// جعل الدوال متاحة عالمياً
if (typeof window !== 'undefined') {
  window.cleanGoogleAuth = cleanGoogleAuth;
  window.checkCleanAuthResult = checkCleanAuthResult;
  
  // التحقق التلقائي عند تحميل الصفحة
  window.addEventListener('load', async () => {
    const result = await checkCleanAuthResult();
    if (result) {
      logger.info('🔔 نتيجة المصادقة:', result);
    }
  });
}

// إضافة رابط مباشر للتجربة
logger.info('🌐 يمكنك تجربة الرابط المباشر: http://localhost:3001/clean-google-auth');