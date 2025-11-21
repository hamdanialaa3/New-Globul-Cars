// src/config/email-config.ts
// Email templates configuration for Firebase Auth

export const EMAIL_TEMPLATES = {
  bg: {
    subject: 'Потвърдете вашия имейл за Globul Cars',
    greeting: 'Здравейте %DISPLAY_NAME%,',
    message: 'Моля, следвайте този линк за да потвърдите вашия имейл адрес.',
    action: 'Потвърди имейл',
    ignore: 'Ако не сте поискали това потвърждение, можете да игнорирате този имейл.',
    signature: 'Благодарим ви,\nТимът на Globul Cars'
  },
  en: {
    subject: 'Verify your email for Globul Cars',
    greeting: 'Hello %DISPLAY_NAME%,',
    message: 'Follow this link to verify your email address.',
    action: 'Verify Email',
    ignore: 'If you didn\'t ask to verify this address, you can ignore this email.',
    signature: 'Thanks,\nThe Globul Cars team'
  }
};

export const EMAIL_CONFIG = {
  // Firebase Auth will use these settings
  from: 'noreply@globulcars.bg',
  replyTo: 'support@globulcars.bg',
  appName: 'Globul Cars',
  // Custom action URL
  continueUrl: typeof window !== 'undefined' ? `${window.location.origin}/email-verified` : '',
  // iOS app settings
  iOS: {
    bundleId: 'bg.globulcars.app'
  },
  // Android app settings
  android: {
    packageName: 'bg.globulcars.app',
    installApp: true,
    minimumVersion: '1.0'
  },
  // Dynamic link settings
  dynamicLinkDomain: 'globulcars.page.link'
};

// Action code settings generator
export const getActionCodeSettings = (language: 'bg' | 'en' = 'bg') => {
  return {
    url: typeof window !== 'undefined' ? `${window.location.origin}/email-verified?lang=${language}` : '',
    handleCodeInApp: true,
    iOS: EMAIL_CONFIG.iOS,
    android: EMAIL_CONFIG.android,
    dynamicLinkDomain: EMAIL_CONFIG.dynamicLinkDomain
  };
};

export default EMAIL_CONFIG;

