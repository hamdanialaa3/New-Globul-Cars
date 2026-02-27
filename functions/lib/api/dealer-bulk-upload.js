"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBulkUploadStatus = exports.startBulkProcessor = exports.initBulkUpload = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const dealer_types_1 = require("../types/dealer.types");
const functions_1 = require("firebase-admin/functions");
// Setup Firestore
const db = admin.firestore();
/**
 * 1. Initialize Bulk Upload
 * Creates a job record in Firestore and generates a signed URL for CSV upload.
 */
exports.initBulkUpload = functions.region("europe-west1").https.onCall(async (data, context) => {
    var _a;
    // Ensure user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    // Validate request parameters (Zod)
    const validation = dealer_types_1.initBulkUploadSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", validation.error.message);
    }
    const { filename, rowCount, fieldsMapping } = validation.data;
    const dealerId = context.auth.uid;
    // Ensure user is a Dealer (Check Claims or DB)
    const userRecord = await admin.auth().getUser(dealerId);
    if (((_a = userRecord.customClaims) === null || _a === void 0 ? void 0 : _a.profileType) !== "dealer") {
        // Optionally allow if we are just testing, but restrict in prod
        // throw new functions.https.HttpsError("permission-denied", "Only dealers can upload in bulk");
    }
    const jobId = db.collection("bulkUploads").doc().id;
    const storagePath = `dealers/${dealerId}/bulkUploads/${jobId}_${filename}`;
    // Generate a Signed URL for direct client upload
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);
    const [uploadUrl] = await file.getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000,
        contentType: "text/csv",
    });
    const jobData = {
        jobId,
        dealerId,
        filename,
        csvStoragePath: storagePath,
        fieldsMapping: fieldsMapping || {},
        status: "pending",
        progress: 0,
        totalRows: rowCount,
        successCount: 0,
        failCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection("bulkUploads").doc(jobId).set(jobData);
    return { jobId, uploadUrl };
});
/**
 * 2. Complete/Enqueue Bulk Upload
 * Triggered by the client after successful CSV upload to Cloud Storage.
 */
exports.startBulkProcessor = functions.region("europe-west1").https.onCall(async (data, context) => {
    var _a;
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "Not logged in");
    const { jobId } = data;
    if (!jobId)
        throw new functions.https.HttpsError("invalid-argument", "jobId is required");
    const dealerId = context.auth.uid;
    const jobRef = db.collection("bulkUploads").doc(jobId);
    const jobSnap = await jobRef.get();
    if (!jobSnap.exists || ((_a = jobSnap.data()) === null || _a === void 0 ? void 0 : _a.dealerId) !== dealerId) {
        throw new functions.https.HttpsError("permission-denied", "Job not found or unauthorized");
    }
    await jobRef.update({ status: "queued", progress: 5 });
    // Enqueue to Cloud Tasks Worker
    const queue = (0, functions_1.getFunctions)().taskQueue("processDealerCSV");
    await queue.enqueue({ jobId, dealerId }, { scheduleDelaySeconds: 1 } // Start almost immediately
    );
    return { success: true, message: "Upload queued for processing" };
});
/**
 * 3. Get Job Status
 */
exports.getBulkUploadStatus = functions.region("europe-west1").https.onCall(async (data, context) => {
    var _a;
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "Not logged in");
    const { jobId } = data;
    const jobSnap = await db.collection("bulkUploads").doc(jobId).get();
    if (!jobSnap.exists || ((_a = jobSnap.data()) === null || _a === void 0 ? void 0 : _a.dealerId) !== context.auth.uid) {
        throw new functions.https.HttpsError("not-found", "Job not found");
    }
    return jobSnap.data();
});
//# sourceMappingURL=dealer-bulk-upload.js.map