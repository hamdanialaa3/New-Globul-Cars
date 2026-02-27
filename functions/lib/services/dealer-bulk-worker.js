"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDealerCSV = void 0;
const tasks_1 = require("firebase-functions/v2/tasks");
const admin = require("firebase-admin");
const dealer_types_1 = require("../types/dealer.types");
const db = admin.firestore();
// Note: Ensure `processDealerCSV` is defined in exactly this format for Cloud Tasks
exports.processDealerCSV = (0, tasks_1.onTaskDispatched)({
    retryConfig: {
        maxAttempts: 3,
        minBackoffSeconds: 60,
    },
    rateLimits: {
        maxConcurrentDispatches: 2, // Limit concurrent processing to save resources
    },
}, async (req) => {
    const { jobId, dealerId } = req.data;
    const jobRef = db.collection("bulkUploads").doc(jobId);
    const jobSnap = await jobRef.get();
    if (!jobSnap.exists) {
        console.error(`Job ${jobId} not found`);
        return;
    }
    const jobData = jobSnap.data();
    if (!jobData || !jobData.csvStoragePath)
        return;
    try {
        await jobRef.update({ status: "processing", progress: 10 });
        const bucket = admin.storage().bucket();
        const file = bucket.file(jobData.csvStoragePath);
        // Download file to memory (For larger files, use streams: `npm install csv-parse`)
        const [fileBuffer] = await file.download();
        const csvContent = fileBuffer.toString("utf-8");
        // Extremely basic Skeleton CSV Parse (Production should use csv-parse stream)
        const lines = csvContent.split("\n").map(l => l.trim()).filter(l => l);
        if (lines.length < 2) {
            await jobRef.update({ status: "failed", progress: 100, errors: "CSV is empty or missing headers" });
            return;
        }
        const headers = lines[0].split(",");
        const errorLog = ["RowPosition,Error"];
        let successCount = 0;
        let failCount = 0;
        // Batch writer for fast insertion
        let batch = db.batch();
        let operationsInBatch = 0;
        for (let i = 1; i < lines.length; i++) {
            // Parse CSV Row
            const columns = lines[i].split(",");
            const rowData = {};
            headers.forEach((h, index) => { var _a; rowData[h.trim()] = ((_a = columns[index]) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
            // Map data according to fieldsMapping (if any exists in jobData)
            // ... mapping logic
            // Validate via Zod
            const validation = dealer_types_1.dealerInventoryRowSchema.safeParse(rowData);
            if (!validation.success) {
                failCount++;
                errorLog.push(`${i},${validation.error.issues.map(iss => iss.message).join(" | ")}`);
            }
            else {
                successCount++;
                // Insert to Firestore
                const carDocRef = db.collection("cars").doc();
                batch.set(carDocRef, Object.assign(Object.assign({}, validation.data), { dealerId, status: "active", source: "bulk_upload", createdAt: admin.firestore.FieldValue.serverTimestamp() }));
                operationsInBatch++;
                // Commit batch every 400 operations
                if (operationsInBatch >= 400) {
                    await batch.commit();
                    batch = db.batch();
                    operationsInBatch = 0;
                    // Update progress
                    const currentProgress = Math.floor(10 + ((i / lines.length) * 80));
                    await jobRef.update({ progress: currentProgress });
                }
            }
        }
        // Commit remaining batch
        if (operationsInBatch > 0) {
            await batch.commit();
        }
        // Handle Errors
        let errorsUrl = "";
        if (errorLog.length > 1) {
            const errorsCsv = errorLog.join("\n");
            const errorPath = `dealers/${dealerId}/bulkUploads/${jobId}_errors.csv`;
            const errorFile = bucket.file(errorPath);
            await errorFile.save(errorsCsv, { contentType: "text/csv" });
            const [url] = await errorFile.getSignedUrl({
                version: 'v4', action: 'read', expires: Date.now() + 7 * 24 * 60 * 60 * 1000
            });
            errorsUrl = url;
        }
        // Finalize
        await jobRef.update({
            status: "completed",
            progress: 100,
            successCount,
            failCount,
            errorsUrl,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Send notification (Email / Push)
        // notifyDealer(dealerId, "Bulk upload finished", `Success: ${successCount}, Failed: ${failCount}`);
    }
    catch (e) {
        console.error("Bulk upload processing crashed:", e);
        await jobRef.update({
            status: "failed",
            progress: 100,
            internalError: e instanceof Error ? e.message : "Unknown error"
        });
    }
});
//# sourceMappingURL=dealer-bulk-worker.js.map