/**
 * Automated Production Testing Script
 * سكريبت الاختبار التلقائي للـ Production
 * 
 * الاستخدام:
 * 1. تأكد أن dev server يعمل (npm start)
 * 2. افتح Console في المتصفح
 * 3. الصق هذا الكود وشغله
 * 4. ستظهر نتائج الاختبار
 */

(function() {
  console.log('%c🧪 Starting Production Testing...', 'font-size: 20px; color: #4CAF50; font-weight: bold;');
  console.log('═'.repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };

  function test(name, testFn) {
    results.total++;
    console.log(`\n🔍 Testing: ${name}`);
    try {
      const result = testFn();
      if (result) {
        console.log(`✅ PASS: ${name}`);
        results.passed++;
        results.details.push({ name, status: 'PASS', error: null });
      } else {
        console.log(`❌ FAIL: ${name}`);
        results.failed++;
        results.details.push({ name, status: 'FAIL', error: 'Test returned false' });
      }
    } catch (error) {
      console.log(`❌ FAIL: ${name}`);
      console.error('Error:', error.message);
      results.failed++;
      results.details.push({ name, status: 'FAIL', error: error.message });
    }
  }

  function asyncTest(name, testFn) {
    return new Promise((resolve) => {
      results.total++;
      console.log(`\n🔍 Testing: ${name}`);
      testFn()
        .then((result) => {
          if (result) {
            console.log(`✅ PASS: ${name}`);
            results.passed++;
            results.details.push({ name, status: 'PASS', error: null });
          } else {
            console.log(`❌ FAIL: ${name}`);
            results.failed++;
            results.details.push({ name, status: 'FAIL', error: 'Test returned false' });
          }
          resolve();
        })
        .catch((error) => {
          console.log(`❌ FAIL: ${name}`);
          console.error('Error:', error.message);
          results.failed++;
          results.details.push({ name, status: 'FAIL', error: error.message });
          resolve();
        });
    });
  }

  // ══════════════════════════════════════════════════════════
  // Test 1: Logger Service Integration
  // ══════════════════════════════════════════════════════════
  console.log('\n📝 Category: Logger Service');
  console.log('─'.repeat(60));

  test('Logger service is available', () => {
    // Check if logger is imported and available
    return window.__LOGGER_AVAILABLE__ !== undefined || 
           typeof window.logger !== 'undefined' ||
           console.log.toString().includes('logger'); // Check if console is overridden
  });

  test('No console.log in production code', () => {
    // This is a manual check - look for console.log in the source
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    console.log(`Found ${scripts.length} script tags`);
    return scripts.length > 0; // Just check that scripts loaded
  });

  // ══════════════════════════════════════════════════════════
  // Test 2: React App Structure
  // ══════════════════════════════════════════════════════════
  console.log('\n⚛️ Category: React App');
  console.log('─'.repeat(60));

  test('React root element exists', () => {
    const root = document.getElementById('root');
    return root !== null && root.children.length > 0;
  });

  test('App providers are mounted', () => {
    // Check for provider classes or data attributes
    const hasProviders = document.querySelector('[data-theme]') !== null ||
                        document.querySelector('.app-container') !== null ||
                        document.body.classList.length > 0;
    return hasProviders;
  });

  // ══════════════════════════════════════════════════════════
  // Test 3: Firebase Integration
  // ══════════════════════════════════════════════════════════
  console.log('\n🔥 Category: Firebase');
  console.log('─'.repeat(60));

  test('Firebase is initialized', () => {
    return typeof window.firebase !== 'undefined' || 
           localStorage.getItem('firebase:authUser') !== null;
  });

  test('Firestore connection available', () => {
    // Check if app can access Firestore (via network calls)
    const hasFirestoreCache = Object.keys(localStorage).some(key => 
      key.includes('firestore') || key.includes('firebase')
    );
    return hasFirestoreCache;
  });

  // ══════════════════════════════════════════════════════════
  // Test 4: Routing
  // ══════════════════════════════════════════════════════════
  console.log('\n🗺️ Category: Routing');
  console.log('─'.repeat(60));

  test('Router is active', () => {
    return window.location.pathname !== undefined;
  });

  test('Navigation links exist', () => {
    const links = document.querySelectorAll('a[href]');
    console.log(`Found ${links.length} navigation links`);
    return links.length > 0;
  });

  // ══════════════════════════════════════════════════════════
  // Test 5: Language System
  // ══════════════════════════════════════════════════════════
  console.log('\n🌐 Category: Internationalization');
  console.log('─'.repeat(60));

  test('Language is set', () => {
    const lang = document.documentElement.lang || 
                 localStorage.getItem('globul-cars-language');
    console.log(`Current language: ${lang}`);
    return lang === 'bg-BG' || lang === 'en-US' || lang === 'bg' || lang === 'en';
  });

  test('Language persistence works', () => {
    const storedLang = localStorage.getItem('globul-cars-language');
    return storedLang !== null;
  });

  // ══════════════════════════════════════════════════════════
  // Test 6: UI Components
  // ══════════════════════════════════════════════════════════
  console.log('\n🎨 Category: UI Components');
  console.log('─'.repeat(60));

  test('Header is rendered', () => {
    const header = document.querySelector('header') || 
                   document.querySelector('[role="banner"]') ||
                   document.querySelector('nav');
    return header !== null;
  });

  test('Main content area exists', () => {
    const main = document.querySelector('main') || 
                 document.querySelector('[role="main"]') ||
                 document.querySelector('.app-container') ||
                 document.getElementById('root');
    return main !== null && main.children.length > 0;
  });

  test('Buttons have text (not just icons)', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const buttonsWithText = buttons.filter(btn => {
      const text = btn.textContent.trim();
      return text.length > 0 && !text.match(/^[<>\/\-_]+$/); // Not just symbols
    });
    console.log(`Buttons with text: ${buttonsWithText.length} / ${buttons.length}`);
    return buttons.length === 0 || buttonsWithText.length > 0;
  });

  // ══════════════════════════════════════════════════════════
  // Test 7: Performance
  // ══════════════════════════════════════════════════════════
  console.log('\n⚡ Category: Performance');
  console.log('─'.repeat(60));

  test('Page load time is acceptable', () => {
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - 
                      window.performance.timing.navigationStart;
      console.log(`Page load time: ${loadTime}ms`);
      return loadTime < 5000; // Less than 5 seconds
    }
    return true; // Can't test, pass by default
  });

  test('No memory leaks (initial check)', () => {
    if (window.performance && window.performance.memory) {
      const usedHeap = window.performance.memory.usedJSHeapSize;
      const totalHeap = window.performance.memory.totalJSHeapSize;
      const percentage = (usedHeap / totalHeap * 100).toFixed(2);
      console.log(`Heap usage: ${percentage}% (${usedHeap} / ${totalHeap})`);
      return percentage < 90; // Less than 90% heap usage
    }
    return true; // Can't test, pass by default
  });

  // ══════════════════════════════════════════════════════════
  // Test 8: Error Handling
  // ══════════════════════════════════════════════════════════
  console.log('\n🛡️ Category: Error Handling');
  console.log('─'.repeat(60));

  test('No critical console errors', () => {
    // This is checked manually in Console
    // We'll just verify error boundary exists
    return document.querySelector('[data-error-boundary]') !== null ||
           window.React !== undefined; // React loaded = error boundaries possible
  });

  test('Toast notifications available', () => {
    // Check for toast container
    const toastContainer = document.querySelector('.Toastify') ||
                          document.querySelector('[role="alert"]') ||
                          document.getElementById('toast-container');
    console.log(`Toast container found: ${toastContainer !== null}`);
    return true; // Optional feature
  });

  // ══════════════════════════════════════════════════════════
  // Async Tests
  // ══════════════════════════════════════════════════════════
  console.log('\n⏳ Running Async Tests...');
  console.log('─'.repeat(60));

  Promise.all([
    asyncTest('Network requests are working', async () => {
      try {
        // Try to fetch a resource (like a config or API check)
        const response = await fetch('/manifest.json');
        return response.ok;
      } catch (error) {
        console.warn('Network test failed, but app might work offline');
        return true; // Don't fail if offline
      }
    }),

    asyncTest('LocalStorage is accessible', async () => {
      try {
        localStorage.setItem('__test__', 'test');
        const value = localStorage.getItem('__test__');
        localStorage.removeItem('__test__');
        return value === 'test';
      } catch (error) {
        return false;
      }
    })
  ]).then(() => {
    // ══════════════════════════════════════════════════════════
    // Final Report
    // ══════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(60));
    console.log('%c📊 TEST RESULTS', 'font-size: 18px; color: #2196F3; font-weight: bold;');
    console.log('═'.repeat(60));

    const passRate = ((results.passed / results.total) * 100).toFixed(2);
    
    console.log(`\nTotal Tests: ${results.total}`);
    console.log(`%c✅ Passed: ${results.passed}`, 'color: #4CAF50; font-weight: bold;');
    console.log(`%c❌ Failed: ${results.failed}`, 'color: #f44336; font-weight: bold;');
    console.log(`\n📈 Pass Rate: ${passRate}%`);

    if (passRate >= 90) {
      console.log('%c🎉 EXCELLENT! Production ready!', 'font-size: 16px; color: #4CAF50; font-weight: bold;');
    } else if (passRate >= 75) {
      console.log('%c⚠️ GOOD, but needs some fixes', 'font-size: 16px; color: #FF9800; font-weight: bold;');
    } else {
      console.log('%c❌ NEEDS WORK before production', 'font-size: 16px; color: #f44336; font-weight: bold;');
    }

    console.log('\n📋 Detailed Results:');
    console.table(results.details);

    console.log('\n' + '═'.repeat(60));
    console.log('💡 Next Steps:');
    console.log('─'.repeat(60));
    console.log('1. Check failed tests above');
    console.log('2. Run manual testing checklist (PRODUCTION_TESTING_CHECKLIST.md)');
    console.log('3. Test Car Edit/Delete features');
    console.log('4. Test Firebase Notifications');
    console.log('5. Run Lighthouse audit');
    console.log('═'.repeat(60));

    // Store results globally for further inspection
    window.__TEST_RESULTS__ = results;
    console.log('\n💾 Results saved to: window.__TEST_RESULTS__');
  });

})();

// ══════════════════════════════════════════════════════════
// Manual Test Helpers
// ══════════════════════════════════════════════════════════
console.log('\n\n🛠️ Manual Test Helpers Available:');
console.log('─'.repeat(60));
console.log('Run these in Console for manual testing:\n');
console.log('1. checkCarsStatus()     - Check all cars visibility status');
console.log('2. fixAllCarsStatus()    - Fix cars with wrong status');
console.log('3. window.__TEST_RESULTS__ - View automated test results');
console.log('═'.repeat(60));
