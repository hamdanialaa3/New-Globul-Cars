"use strict";
// functions/src/verification/verifyEIK.ts
// Cloud Function: Verify Bulgarian company EIK/BULSTAT number
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
exports.verifyEIK = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const eikAPI_1 = require("./eikAPI");
/**
 * Verify Bulgarian company EIK/BULSTAT number
 *
 * NOW INTEGRATED WITH REAL EIK API (with fallback to mock)
 *
 * @param eik - The EIK/BULSTAT number to verify (9 or 13 digits)
 * @param businessName - Optional business name for cross-validation
 *
 * @returns EIKVerificationResult with validation status and company data
 */
exports.verifyEIK = (0, https_1.onCall)(async (request) => {
    const { eik, businessName } = request.data;
    // 1. Check authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    logger.info('EIK verification started', {
        eik: (eik === null || eik === void 0 ? void 0 : eik.substring(0, 4)) + '***',
        userId: request.auth.uid
    });
    // 2. Validate EIK format
    if (!eik || typeof eik !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'EIK number is required');
    }
    const cleanEIK = eik.replace(/\s/g, '');
    // Bulgarian EIK can be 9 digits (old format) or 13 digits (new format)
    const eikPattern = /^[0-9]{9}$|^[0-9]{13}$/;
    if (!eikPattern.test(cleanEIK)) {
        logger.warn('Invalid EIK format', { eik: cleanEIK.substring(0, 4) + '***' });
        const result = {
            valid: false,
            message: 'Invalid EIK format. Must be 9 or 13 digits',
            eik: cleanEIK,
        };
        return result;
    }
    try {
        // 3. Use NEW EIK API Integration (with cache)
        logger.info('Verifying EIK via API...');
        const apiResult = await (0, eikAPI_1.verifyEIKWithCache)(cleanEIK);
        if (apiResult.success) {
            logger.info('EIK verification successful', {
                eik: cleanEIK.substring(0, 4) + '***',
                source: apiResult.source,
            });
            // Cross-validate business name if provided
            let nameMatch = true;
            if (businessName && apiResult.companyName) {
                const providedLower = businessName.toLowerCase();
                const registeredLower = apiResult.companyName.toLowerCase();
                nameMatch = registeredLower.includes(providedLower) || providedLower.includes(registeredLower);
                if (!nameMatch) {
                    logger.warn('Business name mismatch', {
                        provided: businessName,
                        registered: apiResult.companyName,
                    });
                }
            }
            const result = {
                valid: true,
                eik: cleanEIK,
                companyName: apiResult.companyName,
                address: apiResult.address,
                status: apiResult.status,
                legalForm: apiResult.legalForm,
                registrationDate: apiResult.registrationDate,
                message: apiResult.source === 'mock'
                    ? 'EIK verified (using mock data - real API not configured)'
                    : 'EIK successfully verified via Bulgarian Registry',
            };
            return result;
        }
        else {
            logger.warn('EIK verification failed', {
                eik: cleanEIK.substring(0, 4) + '***',
                error: apiResult.error,
            });
            const result = {
                valid: false,
                eik: cleanEIK,
                message: apiResult.error || 'EIK verification failed',
            };
            return result;
        }
    }
    catch (error) {
        logger.error('EIK verification error', error);
        throw new https_1.HttpsError('internal', `Failed to verify EIK: ${error.message}`);
    }
});
//# sourceMappingURL=verifyEIK.js.map