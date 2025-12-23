"use strict";
// Routing Utilities - Unified URL Generation
// Routing Utilities - Generate Unified Links
//
// PROJECT CONSTITUTION COMPLIANCE:
// - Car URLs: /car/{userId}/{carLocalId}
// - Profile URLs: /profile/{userId}
// - Messages URLs: /messages/{senderNumericId}/{recipientNumericId}
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCarUrlFromUnifiedCar = exports.getMessagesUrl = exports.getProfileUrl = exports.getCarDetailsUrl = void 0;
/**
 * Get car details URL according to project constitution
 *
 * Constitution Rule: /car/{sellerNumericId}/{carNumericId}
 *
 * ✅ STRICT ENFORCEMENT: This function ensures all car URLs use numeric IDs only
 * ⚠️ WARNING: Legacy UUID fallbacks are logged and should be migrated
 *
 * @param car - Car object with seller and car IDs
 * @returns URL string following constitution format
 *
 * @example
 * const url = getCarDetailsUrl({ sellerNumericId: 1, carNumericId: 5 });
 * // Returns: "/car/1/5"
 */
const getCarDetailsUrl = (car) => {
    // ✅ PRIORITY #1: Constitution-compliant numeric URL
    // Supports both standard field names and Project Constitution aliases
    const userId = car.ownerNumericId || car.sellerNumericId;
    const carId = car.userCarSequenceId || car.carNumericId;
    if (userId && carId) {
        return `/car/${userId}/${carId}`;
    }
    // ⚠️ FALLBACK: Legacy UUID support (temporary until migration)
    // This logs a warning so we can track and fix these cases
    if (car.id) {
        console.warn(`[ROUTING VIOLATION] Car ${car.id} is missing numeric IDs.`, 'This should be migrated. Run: npm run migrate:legacy-cars');
        return `/car-details/${car.id}`;
    }
    // ❌ LAST RESORT: No valid ID found
    console.error('[ROUTING ERROR] Car object has no valid ID', car);
    return '/cars';
};
exports.getCarDetailsUrl = getCarDetailsUrl;
/**
 * Get profile URL according to project constitution
 *
 * Constitution Rule: /profile/{userId}
 *
 * @param user - User object with numeric ID or Firebase UID
 * @returns URL string following constitution format
 *
 * @example
 * const url = getProfileUrl({ numericId: 18 });
 * // Returns: "/profile/18"
 */
const getProfileUrl = (user) => {
    // ✅ Constitution-compliant: /profile/{userId}
    if (user.numericId) {
        return `/profile/${user.numericId}`;
    }
    // Fallback: NumericProfileRouter will handle Firebase UID conversion
    if (user.uid) {
        return `/profile/${user.uid}`;
    }
    // Default to current user's profile
    return '/profile';
};
exports.getProfileUrl = getProfileUrl;
/**
 * Get messages URL according to project constitution
 *
 * Constitution Rule: /messages/{senderNumericId}/{recipientNumericId}
 *
 * @param sender - Sender user object
 * @param recipient - Recipient user object
 * @returns URL string following constitution format
 *
 * @example
 * const url = getMessagesUrl(
 *   { numericId: 1 },
 *   { numericId: 2 }
 * );
 * // Returns: "/messages/1/2"
 */
const getMessagesUrl = (sender, recipient) => {
    // ✅ Constitution-compliant: /messages/{senderNumericId}/{recipientNumericId}
    if (sender.numericId && recipient.numericId) {
        return `/messages/${sender.numericId}/${recipient.numericId}`;
    }
    // Fallback for legacy messaging (query params)
    // NumericMessagingPage should handle this gracefully
    if (recipient.uid) {
        return `/messages?userId=${recipient.uid}`;
    }
    // Default to messages list
    return '/messages';
};
exports.getMessagesUrl = getMessagesUrl;
/**
 * Get car details URL from UnifiedCar object
 *
 * Helper function specifically for UnifiedCar type
 *
 * @param car - UnifiedCar object
 * @returns URL string following constitution format
 */
const getCarUrlFromUnifiedCar = (car) => {
    // Extract numeric IDs from car object
    // Supports both standard fields and aliases if they exist on the object
    const sellerNumericId = car.sellerNumericId || car.ownerNumericId;
    const carNumericId = car.carNumericId || car.userCarSequenceId;
    return (0, exports.getCarDetailsUrl)({
        sellerNumericId,
        carNumericId,
        sellerId: car.sellerId,
        id: car.id
    });
};
exports.getCarUrlFromUnifiedCar = getCarUrlFromUnifiedCar;
//# sourceMappingURL=routing-utils.js.map