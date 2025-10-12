// Firebase v9 Auth Internal Error Diagnostic
// Copy and paste this in browser console for immediate diagnosis

console.log('🔍 بدء التشخيص السريع لخطأ auth/internal-error (Firebase v9)...');

// Quick diagnostic function
async function quickDiagnosis() {
  
  // 1. Check if Firebase is loaded
  console.group('1️⃣ فحص تحميل Firebase');
  if (typeof window !== 'undefined' && window.firebase) {
    console.log('✅ Firebase SDK loaded (v8 compat)');
  } else {
    console.log('ℹ️ Using Firebase v9 modular SDK');
  }
  console.groupEnd();

  // 2. Check environment
  console.group('2️⃣ فحص البيئة الحالية');
  const envInfo = {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    fullUrl: window.location.href,
    cookiesEnabled: navigator.cookieEnabled,
    userAgent: navigator.userAgent.slice(0, 100) + '...'
  };
  console.table(envInfo);
  
  // Check for HTTPS requirement
  if (envInfo.protocol !== 'https:' && envInfo.hostname !== 'localhost') {
    console.warn('⚠️ Firebase Auth requires HTTPS in production');
  }
  console.groupEnd();

  // 3. Check localStorage and sessionStorage
  console.group('3️⃣ فحص التخزين المحلي');
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage working');
  } catch (error) {
    console.error('❌ localStorage error:', error);
  }
  
  try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
    console.log('✅ sessionStorage working');
  } catch (error) {
    console.error('❌ sessionStorage error:', error);
  }
  console.groupEnd();

  // 4. Check Firebase configuration from environment
  console.group('4️⃣ فحص تكوين Firebase');
  const expectedConfig = {
    apiKey: 'AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs',
    authDomain: 'studio-448742006-a3493.firebaseapp.com',
    projectId: 'studio-448742006-a3493'
  };
  console.log('Expected Config:', expectedConfig);
  console.groupEnd();

  // 5. Check network connectivity
  console.group('5️⃣ فحص الاتصال بالشبكة');
  const endpoints = [
    'https://identitytoolkit.googleapis.com',
    'https://accounts.google.com',
    `https://${expectedConfig.authDomain}`
  ];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      await fetch(endpoint, { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const endTime = Date.now();
      console.log(`✅ ${endpoint} - ${endTime - startTime}ms`);
    } catch (error) {
      console.error(`❌ ${endpoint} - Error:`, error.message);
    }
  }
  console.groupEnd();

  // 6. Check for common blocking issues
  console.group('6️⃣ فحص المشاكل الشائعة');
  
  // Check for ad blockers
  const testDiv = document.createElement('div');
  testDiv.className = 'ads banner-ads google-ads';
  testDiv.style.height = '1px';
  document.body.appendChild(testDiv);
  
  setTimeout(() => {
    if (testDiv.offsetHeight === 0) {
      console.warn('⚠️ Ad blocker detected - may interfere with OAuth');
    } else {
      console.log('✅ No ad blocker interference detected');
    }
    document.body.removeChild(testDiv);
  }, 100);
  
  // Check third-party cookies
  const iframe = document.createElement('iframe');
  iframe.src = 'data:text/html,<script>try{localStorage.test="test";}catch(e){parent.postMessage("blocked","*");}</script>';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  const messageHandler = (event) => {
    if (event.data === 'blocked') {
      console.warn('⚠️ Third-party storage blocked - will cause auth issues');
    }
    window.removeEventListener('message', messageHandler);
    document.body.removeChild(iframe);
  };
  window.addEventListener('message', messageHandler);
  
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      console.log('✅ Third-party storage appears to work');
      document.body.removeChild(iframe);
    }
  }, 500);
  
  console.groupEnd();

  // 7. Solutions for auth/internal-error
  console.group('🛠️ حلول خطأ auth/internal-error');
  console.log('%c1. Firebase Console Check:', 'font-weight: bold; color: #2196F3;');
  console.log('   • Go to: https://console.firebase.google.com');
  console.log('   • Select project: studio-448742006-a3493');
  console.log('   • Authentication > Sign-in method');
  console.log('   • Ensure Google provider is ENABLED');
  
  console.log('%c2. Domain Authorization:', 'font-weight: bold; color: #2196F3;');
  console.log('   • In Firebase Console: Authentication > Settings');
  console.log('   • Authorized domains should include:');
  console.log('     - localhost');
  console.log('     - 127.0.0.1');
  console.log('     - your-production-domain.com');
  
  console.log('%c3. Google Cloud Console:', 'font-weight: bold; color: #2196F3;');
  console.log('   • Go to: https://console.cloud.google.com');
  console.log('   • APIs & Services > Credentials');
  console.log('   • OAuth 2.0 Client IDs');
  console.log('   • Check Authorized redirect URIs');
  
  console.log('%c4. Browser Issues:', 'font-weight: bold; color: #2196F3;');
  console.log('   • Clear cache and cookies');
  console.log('   • Disable ad blockers');
  console.log('   • Enable third-party cookies');
  console.log('   • Try incognito/private mode');
  console.log('   • Try different browser');
  
  console.log('%c5. Network Issues:', 'font-weight: bold; color: #2196F3;');
  console.log('   • Check firewall settings');
  console.log('   • Verify VPN is not blocking Google services');
  console.log('   • Test from different network');
  
  console.groupEnd();

  console.log('✅ التشخيص مكتمل! راجع النتائج أعلاه لتحديد السبب.');
  console.log('🌐 للمزيد من التشخيص، زر: http://localhost:3001/debug/internal-error');

}

// Make function available globally for console access
if (typeof window !== 'undefined') {
  window.firebaseQuickDiagnosis = quickDiagnosis;
}

// Auto-run diagnosis when loaded
quickDiagnosis();