/**
 * IndexNowService.ts
 * 🚀 INSTANT INDEXING - IndexNow API Integration
 * 
 * IndexNow is supported by Bing, Yandex, Seznam, and Naver.
 * Instantly notifies search engines when content changes.
 * 
 * Benefits:
 * - Instant indexing (minutes vs days)
 * - Lower crawl load on server
 * - Better for fresh content ranking
 * 
 * @author SEO Supremacy System
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Note: Using native fetch (Node 18+) instead of node-fetch

// Initialize if needed
if (!admin.apps.length) {
    admin.initializeApp();
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'your-indexnow-key-here';
const SITE_HOST = 'mobilebg.eu';
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

// IndexNow endpoints (multiple for redundancy)
const INDEXNOW_ENDPOINTS = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
];

// ============================================================================
// TYPES
// ============================================================================

interface IndexNowRequest {
    host: string;
    key: string;
    keyLocation: string;
    urlList: string[];
}

interface IndexNowResult {
    success: boolean;
    endpoint: string;
    statusCode?: number;
    error?: string;
}

// ============================================================================
// IndexNow SERVICE
// ============================================================================

export class IndexNowService {
    /**
     * Submit URLs to IndexNow for instant indexing
     */
    static async submitUrls(urls: string[]): Promise<IndexNowResult[]> {
        if (urls.length === 0) return [];
        if (urls.length > 10000) {
            throw new Error('IndexNow supports max 10,000 URLs per request');
        }

        const request: IndexNowRequest = {
            host: SITE_HOST,
            key: INDEXNOW_KEY,
            keyLocation: KEY_LOCATION,
            urlList: urls.map(url =>
                url.startsWith('http') ? url : `https://${SITE_HOST}${url}`
            ),
        };

        const results: IndexNowResult[] = [];

        // Submit to all endpoints for maximum coverage
        for (const endpoint of INDEXNOW_ENDPOINTS) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    body: JSON.stringify(request),
                });

                results.push({
                    success: response.status === 200 || response.status === 202,
                    endpoint,
                    statusCode: response.status,
                });
            } catch (error: any) {
                results.push({
                    success: false,
                    endpoint,
                    error: error.message,
                });
            }
        }

        return results;
    }

    /**
     * Submit a single URL for instant indexing
     */
    static async submitUrl(url: string): Promise<IndexNowResult[]> {
        return this.submitUrls([url]);
    }

    /**
     * Generate the key verification file content
     */
    static getKeyFileContent(): string {
        return INDEXNOW_KEY;
    }
}

// ============================================================================
// CLOUD FUNCTION: Auto-submit new car listings
// ============================================================================

export const onCarCreated = functions.firestore
    .document('cars/{carId}')
    .onCreate(async (snap, context) => {
        const carData = snap.data();

        if (!carData.sellerNumericId || !carData.carNumericId) {
            console.log('Skipping IndexNow: Missing numeric IDs');
            return;
        }

        const carUrl = `/car/${carData.sellerNumericId}/${carData.carNumericId}`;

        try {
            const results = await IndexNowService.submitUrl(carUrl);
            console.log('IndexNow submission results:', results);
        } catch (error) {
            console.error('IndexNow submission failed:', error);
        }
    });

// ============================================================================
// CLOUD FUNCTION: Manual bulk submission
// ============================================================================

export const submitToIndexNow = functions.https.onCall(
    async (data: { urls: string[] }, context) => {
        // Check authentication
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'Must be authenticated to submit URLs'
            );
        }

        const { urls } = data;

        if (!urls || !Array.isArray(urls)) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'URLs must be an array'
            );
        }

        try {
            const results = await IndexNowService.submitUrls(urls);
            return {
                success: true,
                submitted: urls.length,
                results,
            };
        } catch (error: any) {
            throw new functions.https.HttpsError(
                'internal',
                error.message
            );
        }
    }
);

export default IndexNowService;
