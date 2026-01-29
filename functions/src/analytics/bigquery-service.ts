// functions/src/analytics/bigquery-service.ts
import * as functions from 'firebase-functions';
import { BigQuery } from '@google-cloud/bigquery';

const logger = functions.logger;
const bigquery = new BigQuery(); // Uses ADC automatically

export const streamSearchEventToBigQuery = async (searchParams: any, userId?: string) => {
    const datasetId = process.env.BIGQUERY_DATASET || 'car_market_analytics';
    const tableId = 'search_logs';

    const rows = [
        {
            timestamp: new Date().toISOString(),
            user_id: userId || 'anonymous',
            make: searchParams.make || null,
            model: searchParams.model || null,
            price_max: searchParams.priceMax || null,
            location: searchParams.city || null,
            platform: 'web',
            raw_params: JSON.stringify(searchParams)
        },
    ];

    try {
        await bigquery
            .dataset(datasetId)
            .table(tableId)
            .insert(rows);
        logger.info(`📊 Data streamed to BigQuery: ${rows.length} rows`);
    } catch (error) {
        logger.error('❌ BigQuery Error:', error);
        // Silent fail to not disrupt user experience
    }
};

// Cloud Function Trigger
export const logSearchEvent = functions.https.onCall(async (data, context) => {
    // Allow anonymous logging
    const userId = context.auth ? context.auth.uid : 'anonymous';
    await streamSearchEventToBigQuery(data, userId);
    return { success: true };
});
