"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIndexing = exports.indexingService = exports.GoogleIndexingService = void 0;
// functions/src/seo/indexing-service.ts
const functions = require("firebase-functions/v1");
const googleapis_1 = require("googleapis");
const logger = functions.logger;
// Ensure you have this file deployed or use environment variables for credentials
// Using ADC (Application Default Credentials) is best for Cloud Functions
const SCOPES = ['https://www.googleapis.com/auth/indexing'];
class GoogleIndexingService {
    constructor() {
        // Uses Google Application Default Credentials (ADC) automatically on Cloud Functions
        this.jwtClient = new googleapis_1.google.auth.GoogleAuth({
            scopes: SCOPES
        });
    }
    /**
     * Notify Google about a new or updated URL
     */
    async requestIndexing(url, type = 'URL_UPDATED') {
        try {
            const authClient = await this.jwtClient.getClient();
            const indexing = googleapis_1.google.indexing({ version: 'v3', auth: authClient });
            const result = await indexing.urlNotifications.publish({
                requestBody: {
                    url: url,
                    type: type,
                },
            });
            logger.info(`🚀 SEO Rocket: Google notified about ${url} [${type}]`, result.status);
            return { success: true, status: result.status };
        }
        catch (error) {
            logger.error('❌ SEO Error:', error);
            throw error;
        }
    }
}
exports.GoogleIndexingService = GoogleIndexingService;
exports.indexingService = new GoogleIndexingService();
// Callable Function to be triggered from Client
exports.requestIndexing = functions
    .https.onCall(async (data, context) => {
    // SECURITY: Require authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { url, type } = data;
    if (!url || typeof url !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'URL is required');
    }
    // SECURITY: Only allow indexing of our own domain URLs
    const allowedDomains = [
        'https://fire-new-globul.web.app',
        'https://koli.one',
        'https://www.koli.one'
    ];
    const isAllowed = allowedDomains.some(domain => url.startsWith(domain));
    if (!isAllowed) {
        throw new functions.https.HttpsError('permission-denied', 'Only site URLs can be indexed');
    }
    return await exports.indexingService.requestIndexing(url, type || 'URL_UPDATED');
});
//# sourceMappingURL=indexing-service.js.map