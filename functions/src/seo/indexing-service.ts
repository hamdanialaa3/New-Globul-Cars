// functions/src/seo/indexing-service.ts
import * as functions from 'firebase-functions/v1';
import { google } from 'googleapis';

const logger = functions.logger;

// Ensure you have this file deployed or use environment variables for credentials
// Using ADC (Application Default Credentials) is best for Cloud Functions
const SCOPES = ['https://www.googleapis.com/auth/indexing'];

export class GoogleIndexingService {
    private jwtClient: any;

    constructor() {
        // Uses Google Application Default Credentials (ADC) automatically on Cloud Functions
        this.jwtClient = new google.auth.GoogleAuth({
            scopes: SCOPES
        });
    }

    /**
     * Notify Google about a new or updated URL
     */
    async requestIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
        try {
            const authClient = await this.jwtClient.getClient();
            const indexing = google.indexing({ version: 'v3', auth: authClient });

            const result = await indexing.urlNotifications.publish({
                requestBody: {
                    url: url,
                    type: type,
                },
            });

            logger.info(`🚀 SEO Rocket: Google notified about ${url} [${type}]`, result.status);
            return { success: true, status: result.status };
        } catch (error) {
            logger.error('❌ SEO Error:', error);
            throw error;
        }
    }
}

export const indexingService = new GoogleIndexingService();

// Callable Function to be triggered from Client
export const requestIndexing = functions
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

        return await indexingService.requestIndexing(url, type || 'URL_UPDATED');
    });
