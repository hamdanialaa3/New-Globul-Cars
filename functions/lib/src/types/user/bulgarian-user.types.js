"use strict";
/**
 * CANONICAL Bulgarian User Types
 * المصدر القياسي الوحيد لتعريف المستخدم
 *
 * ⚠️ DO NOT create other BulgarianUser interfaces!
 * ⚠️ All imports MUST use this file only!
 *
 * File: src/types/user/bulgarian-user.types.ts
 * Created: November 2025
 * Phase: -1 (Code Audit - Type Unification)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBusinessProfile = exports.isPrivateProfile = exports.isCompanyProfile = exports.isDealerProfile = void 0;
// ==================== TYPE GUARDS ====================
/**
 * Type guard to check if a user is a dealer
 * Use this instead of checking isDealer (deprecated)
 */
function isDealerProfile(user) {
    return user.profileType === 'dealer';
}
exports.isDealerProfile = isDealerProfile;
/**
 * Type guard to check if a user is a company
 */
function isCompanyProfile(user) {
    return user.profileType === 'company';
}
exports.isCompanyProfile = isCompanyProfile;
/**
 * Type guard to check if a user is a private user
 */
function isPrivateProfile(user) {
    return user.profileType === 'private';
}
exports.isPrivateProfile = isPrivateProfile;
/**
 * Type guard to check if a user is a business (dealer or company)
 */
function isBusinessProfile(user) {
    return user.profileType === 'dealer' || user.profileType === 'company';
}
exports.isBusinessProfile = isBusinessProfile;
//# sourceMappingURL=bulgarian-user.types.js.map