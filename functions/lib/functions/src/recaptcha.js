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
exports.verifyRecaptchaToken = void 0;
// functions/src/recaptcha.ts
const functions = __importStar(require("firebase-functions"));
const recaptcha_enterprise_1 = require("@google-cloud/recaptcha-enterprise");
const client = new recaptcha_enterprise_1.RecaptchaEnterpriseServiceClient();
const GCP_PROJECT_ID = functions.config().gcp.project_id;
const RECAPTCHA_SITE_KEY = functions.config().recaptcha.site_key;
if (!GCP_PROJECT_ID || !RECAPTCHA_SITE_KEY) {
    console.error("FATAL ERROR: GCP Project ID or reCAPTCHA Site Key is not configured in Firebase Functions.");
}
/**
 * A callable function to verify a reCAPTCHA token from the client.
 */
exports.verifyRecaptchaToken = functions.region('europe-west1').https.onCall(async (data, context) => {
    var _a, _b, _c;
    const { token, action } = data;
    if (!token || !action) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "token" and "action" arguments.');
    }
    const projectPath = client.projectPath(GCP_PROJECT_ID);
    const request = {
        assessment: {
            event: {
                token: token,
                siteKey: RECAPTCHA_SITE_KEY,
                expectedAction: action,
            },
        },
        parent: projectPath,
    };
    try {
        const [response] = await client.createAssessment(request);
        if (!((_a = response.tokenProperties) === null || _a === void 0 ? void 0 : _a.valid)) {
            console.error(`reCAPTCHA token is invalid: ${(_b = response.tokenProperties) === null || _b === void 0 ? void 0 : _b.invalidReason}`);
            throw new functions.https.HttpsError('unauthenticated', 'reCAPTCHA validation failed.');
        }
        if (response.tokenProperties.action !== action) {
            console.error(`reCAPTCHA action mismatch. Expected: ${action}, Got: ${response.tokenProperties.action}`);
            throw new functions.https.HttpsError('unauthenticated', 'reCAPTCHA action mismatch.');
        }
        // The reCAPTCHA score indicates the likelihood that this interaction is legitimate.
        // Score ranges from 0.0 (very likely a bot) to 1.0 (very likely a human).
        const score = (_c = response.riskAnalysis) === null || _c === void 0 ? void 0 : _c.score;
        console.log(`reCAPTCHA assessment score: ${score}`);
        // You can set a threshold for the score. For login/register, a higher threshold is recommended.
        if (score === null || score === undefined || score < 0.5) {
            throw new functions.https.HttpsError('unauthenticated', 'Low reCAPTCHA score. Please try again.');
        }
        console.log('reCAPTCHA verification successful.');
        return { success: true, score: score };
    }
    catch (error) {
        console.error('Error during reCAPTCHA verification:', error);
        throw new functions.https.HttpsError('internal', 'An error occurred while verifying reCAPTCHA.');
    }
});
//# sourceMappingURL=recaptcha.js.map