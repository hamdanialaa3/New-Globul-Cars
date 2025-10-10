"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCarImage = void 0;
// functions/src/vision.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const vision = __importStar(require("@google-cloud/vision"));
// Initialize Admin SDK and Vision Client if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const visionClient = new vision.ImageAnnotatorClient();
const db = admin.firestore();
/**
 * Triggered when a new image is uploaded to the 'cars' folder in Cloud Storage.
 * Analyzes the image for safe search content and relevant labels.
 */
exports.analyzeCarImage = functions.region('europe-west1').storage
    .object()
    .onFinalize(async (object) => {
    var _a;
    const filePath = object.name; // e.g., 'cars/carId/imageName.jpg'
    const bucketName = object.bucket;
    const contentType = object.contentType;
    // Exit if this is not an image or not in the 'cars' folder.
    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.startsWith('image/')) || !(filePath === null || filePath === void 0 ? void 0 : filePath.startsWith('cars/'))) {
        console.log('This is not an image or not in the cars folder. Skipping analysis.');
        return null;
    }
    // Extract the carId from the file path.
    const parts = filePath.split('/');
    if (parts.length < 3) {
        console.log(`File path ${filePath} is not valid for car image analysis. Skipping.`);
        return null;
    }
    const carId = parts[1];
    console.log(`Analyzing image for carId: ${carId}, path: ${filePath}`);
    const gcsUri = `gs://${bucketName}/${filePath}`;
    try {
        // 1. Safe Search Analysis
        const [safeSearchResult] = await visionClient.safeSearchDetection(gcsUri);
        const safeSearch = safeSearchResult.safeSearchAnnotation;
        const isAdult = (safeSearch === null || safeSearch === void 0 ? void 0 : safeSearch.adult) === 'VERY_LIKELY' || (safeSearch === null || safeSearch === void 0 ? void 0 : safeSearch.adult) === 'LIKELY';
        const isViolent = (safeSearch === null || safeSearch === void 0 ? void 0 : safeSearch.violence) === 'VERY_LIKELY' || (safeSearch === null || safeSearch === void 0 ? void 0 : safeSearch.violence) === 'LIKELY';
        const isRacy = (safeSearch === null || safeSearch === void 0 ? void 0 : safeSearch.racy) === 'VERY_LIKELY' || (safeSearch === null || safeSearch === void 0 ? void 0 : safeSearch.racy) === 'LIKELY';
        const isSafe = !isAdult && !isViolent && !isRacy;
        console.log(`Safe Search results: isSafe=${isSafe}`);
        // 2. Label Detection
        const [labelResult] = await visionClient.labelDetection(gcsUri);
        const labels = (_a = labelResult.labelAnnotations) === null || _a === void 0 ? void 0 : _a.map(label => label.description).filter(Boolean);
        console.log(`Labels detected: ${labels.join(', ')}`);
        // 3. Update Firestore
        const carDocRef = db.collection('cars').doc(carId);
        const updateData = {
            imageAnalysis: {
                isSafe: isSafe,
                labels: admin.firestore.FieldValue.arrayUnion(...labels),
                lastAnalyzed: admin.firestore.FieldValue.serverTimestamp()
            }
        };
        // If the image is not safe, flag the car for review.
        if (!isSafe) {
            updateData['status'] = 'needs_review';
            console.warn(`Image for car ${carId} flagged as unsafe.`);
        }
        await carDocRef.set(updateData, { merge: true });
        console.log(`Successfully updated car ${carId} with image analysis results.`);
        return null;
    }
    catch (error) {
        console.error(`Failed to analyze image ${filePath}.`, error);
        return null;
    }
});
//# sourceMappingURL=vision.js.map