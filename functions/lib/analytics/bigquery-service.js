"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSearchEvent = exports.streamSearchEventToBigQuery = void 0;
// functions/src/analytics/bigquery-service.ts
const functions = require("firebase-functions");
const bigquery_1 = require("@google-cloud/bigquery");
const logger = functions.logger;
const bigquery = new bigquery_1.BigQuery(); // Uses ADC automatically
const streamSearchEventToBigQuery = async (searchParams, userId) => {
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
    }
    catch (error) {
        logger.error('❌ BigQuery Error:', error);
        // Silent fail to not disrupt user experience
    }
};
exports.streamSearchEventToBigQuery = streamSearchEventToBigQuery;
// Cloud Function Trigger
exports.logSearchEvent = functions.https.onCall(async (data, context) => {
    // Allow anonymous logging
    const userId = context.auth ? context.auth.uid : 'anonymous';
    await (0, exports.streamSearchEventToBigQuery)(data, userId);
    return { success: true };
});
//# sourceMappingURL=bigquery-service.js.map