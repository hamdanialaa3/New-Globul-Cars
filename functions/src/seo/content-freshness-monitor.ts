/**
 * Content Freshness Monitor — SEO Automation
 * 
 * Cloud Function that checks for stale content and sends alerts
 * when blog articles haven't been updated in 90+ days.
 * 
 * Helps maintain Google's "Helpful Content" freshness signals.
 * 
 * @schedule Every Monday at 9:00 AM Sofia time
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const logger = functions.logger;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Blog articles to monitor for freshness
const MONITORED_CONTENT = [
    { slug: 'ai-valuation-deep-dive', title: 'AI Valuation Deep Dive' },
    { slug: 'hybrid-search-deep-dive', title: 'Hybrid Search Deep Dive' },
    { slug: 'neural-pricing-deep-dive', title: 'Neural Pricing Deep Dive' },
    { slug: 'constitutional-coding-deep-dive', title: 'Constitutional Coding Deep Dive' },
    { slug: 'bulgarian-car-market-2026', title: 'Bulgarian Car Market 2026' },
    { slug: 'marketplace-comparison-2026', title: 'Marketplace Comparison 2026' },
];

const FRESHNESS_THRESHOLD_DAYS = 90;

/**
 * Check content freshness and create alerts for stale content
 */
export const contentFreshnessMonitor = functions.pubsub
    .schedule('every monday 09:00')
    .timeZone('Europe/Sofia')
    .onRun(async () => {
        try {
            logger.info('📋 Starting content freshness check...');

            const now = new Date();
            const staleArticles: Array<{ slug: string; title: string; daysSinceUpdate: number }> = [];

            // Check each monitored article
            for (const article of MONITORED_CONTENT) {
                try {
                    const doc = await db.collection('content_metadata').doc(article.slug).get();

                    if (!doc.exists) {
                        // No metadata = never tracked, create initial record
                        await db.collection('content_metadata').doc(article.slug).set({
                            slug: article.slug,
                            title: article.title,
                            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        logger.info(`Created metadata for: ${article.title}`);
                        continue;
                    }

                    const data = doc.data();
                    const lastUpdated = data?.lastUpdated?.toDate?.() || new Date();
                    const daysSinceUpdate = Math.floor(
                        (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (daysSinceUpdate >= FRESHNESS_THRESHOLD_DAYS) {
                        staleArticles.push({
                            slug: article.slug,
                            title: article.title,
                            daysSinceUpdate,
                        });
                    }
                } catch (error) {
                    logger.warn(`Error checking ${article.slug}:`, error);
                }
            }

            // Store alert in Firestore for admin dashboard
            if (staleArticles.length > 0) {
                await db.collection('system_alerts').add({
                    type: 'content_freshness',
                    severity: 'warning',
                    title: `${staleArticles.length} article(s) need updating`,
                    message: `The following articles haven't been updated in ${FRESHNESS_THRESHOLD_DAYS}+ days and may lose SEO ranking: ${staleArticles.map(a => a.title).join(', ')}`,
                    staleArticles,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isRead: false,
                });

                logger.warn(`⚠️ ${staleArticles.length} stale articles detected:`, staleArticles);
            } else {
                logger.info('✅ All content is fresh — no updates needed.');
            }

            // Update the last check timestamp
            await db.collection('system').doc('content_freshness').set({
                lastChecked: admin.firestore.FieldValue.serverTimestamp(),
                totalArticles: MONITORED_CONTENT.length,
                staleCount: staleArticles.length,
                allFresh: staleArticles.length === 0,
            }, { merge: true });

            return null;
        } catch (error) {
            logger.error('❌ Content freshness check failed:', error);
            throw error;
        }
    });
