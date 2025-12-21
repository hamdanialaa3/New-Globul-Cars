export async function checkPhoneAuthStatus(logStep: (msg: string) => void) {
    logStep('\n--- DIAGNOSING PHONE AUTHENTICATION ---');

    // 1. Check if auth object is initialized
    try {
        const { auth } = await import('../../src/firebase/firebase-config');
        logStep('✅ Firebase Auth initialized correctly.');
        logStep(`   Auth Domain: ${auth.config.authDomain}`);
        logStep(`   API Key: ${auth.config.apiKey.substring(0, 5)}...`);
    } catch (e) {
        logStep('❌ Firebase Auth NOT initialized.');
        logStep(String(e));
    }

    // 2. Check for App Check interference
    logStep('\nChecking App Check status...');
    if ((window as any).grecaptcha) {
        logStep('⚠️ Global grecaptcha object found (This is expected for Phone Auth but can conflict if App Check is misconfigured).');
    } else {
        logStep('ℹ️ No global grecaptcha object found yet.');
    }

    // 3. Explain common 400 error cause
    logStep('\n--- EXPLANATION OF 400 ERROR ---');
    logStep('The error "Phone verification code error" with HTTP 400 usually means:');
    logStep('1. The "localhost" domain is NOT authorized in Firebase Console > Authentication > Settings > Authorized domains.');
    logStep('2. App Check is enforcing reCAPTCHA v3, but Phone Auth requires reCAPTCHA v2 (invisible).');
    logStep('3. You are testing with a real phone number on localhost without App Check debug token.');

    return { verified: true };
}
