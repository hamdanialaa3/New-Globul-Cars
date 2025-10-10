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
exports.translateText = void 0;
// functions/src/translation.ts
const functions = __importStar(require("firebase-functions"));
const translate_1 = require("@google-cloud/translate");
const translateClient = new translate_1.v2.Translate();
/**
 * A callable function to translate a given text to a target language.
 */
exports.translateText = functions.region('europe-west1').https.onCall(async (data, context) => {
    // 1. Authentication Check: Make sure the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { text, targetLanguage } = data;
    // 2. Validation: Check if the required parameters are provided.
    if (!text || !targetLanguage) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "text" and "targetLanguage" arguments.');
    }
    try {
        console.log(`Translating text to ${targetLanguage}: "${text.substring(0, 40)}..."`);
        // 3. Translation: Use the Google Cloud Translate API.
        const [translation] = await translateClient.translate(text, targetLanguage);
        console.log(`Translation successful: "${translation.substring(0, 40)}..."`);
        // 4. Return Result: Send the translated text back to the client.
        return { translatedText: translation };
    }
    catch (error) {
        console.error('Error during translation:', error);
        throw new functions.https.HttpsError('internal', 'An error occurred while translating the text.');
    }
});
//# sourceMappingURL=translation.js.map