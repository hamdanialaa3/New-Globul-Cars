// Quick Firebase Auth Internal Error Diagnostic
// Run this in browser console for immediate diagnosis

console.log('🔍 بدء التشخيص السريع لخطأ auth/internal-error...');

// 1. Check Firebase configuration
console.group('1️⃣ فحص تكوين Firebase');
try {
  const config = firebase.auth().app.options;
  console.log('✅ Firebase Config:', {
    apiKey: config.apiKey?.slice(0, 10) + '...',
    authDomain: config.authDomain,
    projectId: config.projectId
  });
} catch (error) {
  console.error('❌ Firebase Config Error:', error);
}
console.groupEnd();

// 2. Check current environment
console.group('2️⃣ فحص البيئة الحالية');
console.log('Protocol:', window.location.protocol);
console.log('Hostname:', window.location.hostname);
console.log('Port:', window.location.port);
console.log('User Agent:', navigator.userAgent);
console.log('Cookies Enabled:', navigator.cookieEnabled);
console.groupEnd();

// 3. Test Google Auth Provider
console.group('3️⃣ اختبار Google Auth Provider');
try {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  console.log('✅ Google Provider created successfully');
  console.log('Provider ID:', provider.providerId);
} catch (error) {
  console.error('❌ Google Provider Error:', error);
}
console.groupEnd();

// 4. Test Auth State
console.group('4️⃣ فحص حالة المصادقة');
const auth = firebase.auth();
console.log('Current User:', auth.currentUser);
console.log('Auth Domain:', auth.app.options.authDomain);

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ User signed in:', user.email);
  } else {
    console.log('❌ No user signed in');
  }
});
console.groupEnd();

// 5. Attempt Google Sign-in with detailed error logging
console.group('5️⃣ محاولة تسجيل الدخول مع Google');
async function testGoogleAuth() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    console.log('🔄 Attempting Google sign-in...');
    const result = await auth.signInWithPopup(provider);
    console.log('✅ Google sign-in successful!', {
      user: result.user.email,
      providerId: result.credential?.providerId
    });
    
    // Sign out immediately for testing
    await auth.signOut();
    console.log('✅ Signed out successfully');
    
  } catch (error) {
    console.error('❌ Google Sign-in Error Details:', {
      code: error.code,
      message: error.message,
      credential: error.credential,
      email: error.email,
      stack: error.stack
    });
    
    // Specific error analysis
    if (error.code === 'auth/internal-error') {
      console.log('🚨 INTERNAL ERROR DETECTED!');
      console.log('📋 تحليل الأسباب المحتملة:');
      console.log('1. Google Sign-in provider not enabled in Firebase Console');
      console.log('2. OAuth client configuration issues');
      console.log('3. Domain not authorized in Firebase Console');
      console.log('4. API key restrictions');
      console.log('5. Browser blocking third-party cookies');
      
      console.log('🛠️ الحلول المقترحة:');
      console.log('1. Check Firebase Console > Authentication > Sign-in method');
      console.log('2. Verify Google provider is enabled and configured');
      console.log('3. Add current domain to Authorized domains');
      console.log('4. Check Google Cloud Console > Credentials');
      console.log('5. Try incognito mode or different browser');
    }
  }
}

// 6. Run the test
console.log('▶️ تشغيل اختبار Google Authentication...');
testGoogleAuth();

console.groupEnd();

console.log('✅ التشخيص مكتمل. راجع النتائج أعلاه لتحديد السبب.');