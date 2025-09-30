// src/utils/quick-google-test.js
// اختبار سريع ومباشر لـ Google Authentication

export const quickGoogleTest = async () => {
  console.clear();
  console.log('🚀 اختبار Google Sign-in سريع');
  console.log('='.repeat(40));

  try {
    // 1. استيراد المكتبات
    console.log('📦 استيراد Firebase...');
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    
    // 2. تحضير Auth و Provider
    console.log('🔧 تحضير Authentication...');
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    // إضافة scopes أساسية
    provider.addScope('email');
    provider.addScope('profile');
    
    console.log('✅ تم تحضير Auth و Provider');
    console.log(`🌐 Auth Domain: ${auth.config.authDomain}`);
    
    // 3. محاولة تسجيل الدخول
    console.log('🔑 محاولة تسجيل الدخول...');
    console.log('⏳ انتظار اختيار المستخدم...');
    
    const result = await signInWithPopup(auth, provider);
    
    // 4. عرض النتيجة
    console.log('🎉 نجح تسجيل الدخول!');
    console.log('👤 معلومات المستخدم:');
    console.log(`   📧 البريد: ${result.user.email}`);
    console.log(`   👤 الاسم: ${result.user.displayName}`);
    console.log(`   🆔 UID: ${result.user.uid}`);
    console.log(`   📷 الصورة: ${result.user.photoURL ? 'متوفرة' : 'غير متوفرة'}`);
    
    // 5. معلومات إضافية
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential) {
      console.log('🔐 معلومات الاعتماد:');
      console.log(`   🎫 Access Token: ${credential.accessToken ? 'متوفر' : 'غير متوفر'}`);
      console.log(`   🔑 ID Token: ${credential.idToken ? 'متوفر' : 'غير متوفر'}`);
    }
    
    console.log('='.repeat(40));
    console.log('✅ تم الاختبار بنجاح!');
    
    return {
      success: true,
      user: result.user,
      message: 'تم تسجيل الدخول بنجاح!'
    };
    
  } catch (error) {
    console.log('='.repeat(40));
    console.error('❌ فشل الاختبار!');
    console.error(`🔴 كود الخطأ: ${error.code}`);
    console.error(`📝 رسالة الخطأ: ${error.message}`);
    
    // تحليل الخطأ
    console.log('\n🔍 تحليل الخطأ:');
    switch (error.code) {
      case 'auth/popup-blocked':
        console.log('🚫 النوافذ المنبثقة محجوبة');
        console.log('💡 الحل: فعّل النوافذ المنبثقة في المتصفح');
        break;
        
      case 'auth/unauthorized-domain':
        console.log('🚫 النطاق غير مصرح');
        console.log('💡 الحل: أضف localhost إلى Firebase Authorized Domains');
        break;
        
      case 'auth/operation-not-allowed':
        console.log('🚫 العملية غير مسموحة');
        console.log('💡 الحل: فعّل Google provider في Firebase Console');
        break;
        
      case 'auth/invalid-api-key':
        console.log('🚫 مفتاح API غير صالح');
        console.log('💡 الحل: تحقق من REACT_APP_FIREBASE_API_KEY في .env');
        break;
        
      case 'auth/network-request-failed':
        console.log('🚫 فشل في طلب الشبكة');
        console.log('💡 الحل: تحقق من الاتصال بالإنترنت');
        break;
        
      case 'auth/popup-closed-by-user':
        console.log('🚫 المستخدم أغلق النافذة المنبثقة');
        console.log('💡 جرب مرة أخرى');
        break;
        
      default:
        console.log(`🚫 خطأ غير معروف: ${error.code}`);
        console.log('💡 الحل: تحقق من إعدادات Firebase');
    }
    
    console.log('='.repeat(40));
    
    return {
      success: false,
      error: error,
      message: `فشل تسجيل الدخول: ${error.message}`
    };
  }
};

// جعل الاختبار متاح عالمياً
if (typeof window !== 'undefined') {
  window.quickGoogleTest = quickGoogleTest;
  
  // رسالة في console
  console.log('🔧 للاختبار السريع، اكتب: quickGoogleTest()');
}