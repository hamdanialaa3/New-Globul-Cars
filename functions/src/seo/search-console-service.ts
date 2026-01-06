/**
 * SearchConsoleService.ts
 * 🔍 Google Search Console API Integration
 * 
 * Features:
 * - Submit URLs for indexing
 * - Check indexing status
 * - Get search performance data
 * - Monitor crawl errors
 * 
 * Requires:
 * - Google Cloud service account with Search Console API access
 * - Site verification in Google Search Console
 * 
 * @author SEO Supremacy System
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';

// Initialize
if (!admin.apps.length) {
    admin.initializeApp();
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SITE_URL = 'https://mobilebg.eu';

// Service account credentials (store in environment variables)
const SERVICE_ACCOUNT = {
    client_email: process.env.GSC_CLIENT_EMAIL,
    private_key: process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// ============================================================================
// TYPES
// ============================================================================

interface IndexingStatus {
    url: string;
    indexed: boolean;
    lastCrawled?: string;
    verdict?: string;
}

interface SearchPerformanceData {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

interface TopQuery {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

interface TopPage {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

// ============================================================================
// SEARCH CONSOLE SERVICE
// ============================================================================

export class SearchConsoleService {
    private static auth: any = null;
    private static searchConsole: any = null;
    private static indexing: any = null;

    /**
     * Initialize Google APIs
     */
    private static async initialize(): Promise<void> {
        if (this.auth) return;

        if (!SERVICE_ACCOUNT.client_email || !SERVICE_ACCOUNT.private_key) {
            throw new Error('Google Search Console credentials not configured');
        }

        this.auth = new google.auth.GoogleAuth({
            credentials: SERVICE_ACCOUNT,
            scopes: [
                'https://www.googleapis.com/auth/webmasters.readonly',
                'https://www.googleapis.com/auth/indexing',
            ],
        });

        const client = await this.auth.getClient();

        this.searchConsole = google.searchconsole({
            version: 'v1',
            auth: client as any,
        });

        this.indexing = google.indexing({
            version: 'v3',
            auth: client as any,
        });
    }

    /**
     * Request URL indexing
     */
    static async requestIndexing(url: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.initialize();

            const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;

            await this.indexing.urlNotifications.publish({
                requestBody: {
                    url: fullUrl,
                    type: 'URL_UPDATED',
                },
            });

            return {
                success: true,
                message: `Indexing requested for ${fullUrl}`,
            };
        } catch (error: any) {
            console.error('Indexing request failed:', error);
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Request URL removal from index
     */
    static async requestRemoval(url: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.initialize();

            const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;

            await this.indexing.urlNotifications.publish({
                requestBody: {
                    url: fullUrl,
                    type: 'URL_DELETED',
                },
            });

            return {
                success: true,
                message: `Removal requested for ${fullUrl}`,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Get search performance data
     */
    static async getSearchPerformance(
        startDate: string,
        endDate: string,
        dimensions: string[] = ['date']
    ): Promise<SearchPerformanceData[]> {
        try {
            await this.initialize();

            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: SITE_URL,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions,
                    rowLimit: 1000,
                },
            });

            return (response.data.rows || []).map((row: any) => ({
                date: row.keys[0],
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
            }));
        } catch (error: any) {
            console.error('Failed to get search performance:', error);
            return [];
        }
    }

    /**
     * Get top search queries
     */
    static async getTopQueries(
        startDate: string,
        endDate: string,
        limit: number = 100
    ): Promise<TopQuery[]> {
        try {
            await this.initialize();

            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: SITE_URL,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['query'],
                    rowLimit: limit,
                },
            });

            return (response.data.rows || []).map((row: any) => ({
                query: row.keys[0],
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
            }));
        } catch (error: any) {
            console.error('Failed to get top queries:', error);
            return [];
        }
    }

    /**
     * Get top performing pages
     */
    static async getTopPages(
        startDate: string,
        endDate: string,
        limit: number = 100
    ): Promise<TopPage[]> {
        try {
            await this.initialize();

            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: SITE_URL,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['page'],
                    rowLimit: limit,
                },
            });

            return (response.data.rows || []).map((row: any) => ({
                page: row.keys[0],
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
            }));
        } catch (error: any) {
            console.error('Failed to get top pages:', error);
            return [];
        }
    }

    /**
     * Get country-wise performance
     */
    static async getCountryPerformance(
        startDate: string,
        endDate: string
    ): Promise<any[]> {
        try {
            await this.initialize();

            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: SITE_URL,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['country'],
                    rowLimit: 50,
                },
            });

            return (response.data.rows || []).map((row: any) => ({
                country: row.keys[0],
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
            }));
        } catch (error: any) {
            console.error('Failed to get country performance:', error);
            return [];
        }
    }

    /**
     * Get device-wise performance
     */
    static async getDevicePerformance(
        startDate: string,
        endDate: string
    ): Promise<any[]> {
        try {
            await this.initialize();

            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: SITE_URL,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['device'],
                },
            });

            return (response.data.rows || []).map((row: any) => ({
                device: row.keys[0],
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
            }));
        } catch (error: any) {
            console.error('Failed to get device performance:', error);
            return [];
        }
    }
}

// ============================================================================
// CLOUD FUNCTIONS
// ============================================================================

/**
 * Request indexing for a URL
 */
export const requestIndexing = functions.https.onCall(
    async (data: { url: string }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
        }

        const { url } = data;
        if (!url) {
            throw new functions.https.HttpsError('invalid-argument', 'URL is required');
        }

        return SearchConsoleService.requestIndexing(url);
    }
);

/**
 * Get search performance dashboard data
 */
export const getSearchPerformanceDashboard = functions.https.onCall(
    async (data: { startDate: string; endDate: string }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
        }

        const { startDate, endDate } = data;

        const [performance, topQueries, topPages, devices, countries] = await Promise.all([
            SearchConsoleService.getSearchPerformance(startDate, endDate),
            SearchConsoleService.getTopQueries(startDate, endDate, 20),
            SearchConsoleService.getTopPages(startDate, endDate, 20),
            SearchConsoleService.getDevicePerformance(startDate, endDate),
            SearchConsoleService.getCountryPerformance(startDate, endDate),
        ]);

        return {
            performance,
            topQueries,
            topPages,
            devices,
            countries,
        };
    }
);

/**
 * Auto-index new car listings
 */
export const onCarCreatedIndexing = functions.firestore
    .document('cars/{carId}')
    .onCreate(async (snap) => {
        const carData = snap.data();

        if (!carData.sellerNumericId || !carData.carNumericId) {
            return;
        }

        const carUrl = `/car/${carData.sellerNumericId}/${carData.carNumericId}`;

        try {
            await SearchConsoleService.requestIndexing(carUrl);
            console.log(`Indexing requested for new car: ${carUrl}`);
        } catch (error) {
            console.error('Failed to request indexing:', error);
        }
    });

/**
 * Request removal for sold cars
 */
export const onCarSold = functions.firestore
    .document('cars/{carId}')
    .onUpdate(async (change) => {
        const before = change.before.data();
        const after = change.after.data();

        // Check if car was just marked as sold
        if (!before.isSold && after.isSold) {
            const carUrl = `/car/${after.sellerNumericId}/${after.carNumericId}`;

            try {
                // Don't remove, just update to show "sold"
                await SearchConsoleService.requestIndexing(carUrl);
                console.log(`Re-indexing requested for sold car: ${carUrl}`);
            } catch (error) {
                console.error('Failed to request re-indexing:', error);
            }
        }
    });

export default SearchConsoleService;
