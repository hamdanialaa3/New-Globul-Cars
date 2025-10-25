// Firebase Cloud Functions Entry Point
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Cloud Functions
export { exchangeOAuthToken } from './social-media/oauth-handler';

// Export other functions (if they exist)
// export { someOtherFunction } from './some-other-module';
