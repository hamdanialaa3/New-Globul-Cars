"use strict";
// src/firebase/app-check-service.ts
// App Check Service for Koli One
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulgarianAppCheckService = void 0;
const app_check_1 = require("firebase/app-check");
const firebase_config_1 = require("./firebase-config");
const logger_service_1 = require("../services/logger-service");
class BulgarianAppCheckService {
    /**
     * Get App Check token for API requests
     */
    static async getToken() {
        try {
            if (!firebase_config_1.appCheck) {
                logger_service_1.logger.warn('App Check not initialized');
                return null;
            }
            const tokenResult = await (0, app_check_1.getToken)(firebase_config_1.appCheck, false);
            return tokenResult.token;
        }
        catch (error) {
            logger_service_1.logger.error('Error getting App Check token', error);
            return null;
        }
    }
    /**
     * Get App Check token with force refresh
     */
    static async getFreshToken() {
        try {
            if (!firebase_config_1.appCheck) {
                logger_service_1.logger.warn('App Check not initialized');
                return null;
            }
            const tokenResult = await (0, app_check_1.getToken)(firebase_config_1.appCheck, true);
            return tokenResult.token;
        }
        catch (error) {
            logger_service_1.logger.error('Error getting fresh App Check token', error);
            return null;
        }
    }
    /**
     * Check if App Check is properly configured
     */
    static isConfigured() {
        return firebase_config_1.appCheck !== null && typeof window !== 'undefined';
    }
    /**
     * Validate App Check token format
     */
    static isValidToken(token) {
        // Basic validation - Firebase App Check tokens are JWTs
        return typeof token === 'string' && token.split('.').length === 3;
    }
}
exports.BulgarianAppCheckService = BulgarianAppCheckService;
exports.default = BulgarianAppCheckService;
//# sourceMappingURL=app-check-service.js.map