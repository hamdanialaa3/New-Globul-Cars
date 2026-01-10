// Routing Utilities - Unified URL Generation
// Routing Utilities - Generate Unified Links
//
// PROJECT CONSTITUTION COMPLIANCE:
// - Car URLs: /car/{userId}/{carLocalId}
// - Profile URLs: /profile/{userId}
// - Messages URLs: /messages/{senderNumericId}/{recipientNumericId}
// - Edit URLs: /car/{userId}/{carLocalId}/edit
//
// ⚠️ CRITICAL: All URLs MUST use numeric IDs only (never UUID/UID)
// ⚠️ Example: User 90, Car 5 -> /car/90/5

import { UnifiedCar } from '../services/car/unified-car-types';
import { logger } from '../services/logger-service';

/**
 * Get car details URL according to project constitution
 * 
 * ✅ STRICT CONSTITUTION ENFORCEMENT
 * Pattern: /car/{sellerNumericId}/{carNumericId}
 * Example: User 90, Car 5 -> /car/90/5
 * Edit: User 90, Car 5 -> /car/90/5/edit
 * 
 * ⚠️ WARNING: Legacy UUID fallbacks are logged and should be migrated
 * ❌ NEVER return /car-details/ pattern (legacy, deprecated)
 * 
 * @param car - Car object with seller and car IDs
 * @returns URL string following constitution format
 * 
 * @example
 * const url = getCarDetailsUrl({ sellerNumericId: 90, carNumericId: 5 });
 * // Returns: "/car/90/5"
 * 
 * @example
 * const editUrl = getCarDetailsUrl({ sellerNumericId: 90, carNumericId: 5 }) + '/edit';
 * // Returns: "/car/90/5/edit"
 */
export const getCarDetailsUrl = (car: {
  sellerNumericId?: number;
  carNumericId?: number;
  ownerNumericId?: number;       // Alias for sellerNumericId
  userCarSequenceId?: number;    // Alias for carNumericId
  sellerId?: string;
  id?: string;
}): string => {
  // ✅ PRIORITY #1: Constitution-compliant numeric URL
  // Supports both standard field names and Project Constitution aliases
  const userId = car.ownerNumericId || car.sellerNumericId;
  const carId = car.userCarSequenceId || car.carNumericId;

  if (userId && carId) {
    // ✅ CONSTITUTION COMPLIANT: /car/{sellerId}/{carId}
    logger.debug('Constitution-compliant car URL generated', { userId, carId });
    return `/car/${userId}/${carId}`;
  }

  // ⚠️ CONSTITUTION VIOLATION: Missing numeric IDs
  logger.warn(
    'CONSTITUTION VIOLATION: Car missing numeric IDs',
    {
      carId: car.id,
      sellerId: car.sellerId,
      hasSellerNumericId: !!car.sellerNumericId,
      hasCarNumericId: !!car.carNumericId,
      message: 'This car should be migrated to use numeric IDs'
    }
  );

  // ❌ FALLBACK: Return to cars list to prevent broken URLs
  return '/cars';
};

/**
 * Get profile URL according to project constitution
 * 
 * ✅ STRICT CONSTITUTION ENFORCEMENT
 * Pattern: /profile/{userId}
 * Example: User 90 -> /profile/90
 * 
 * @param user - User object with numeric ID or Firebase UID
 * @returns URL string following constitution format
 * 
 * @example
 * const url = getProfileUrl({ numericId: 90 });
 * // Returns: "/profile/90"
 */
export const getProfileUrl = (user: {
  numericId?: number;
  uid?: string;
}): string => {
  // ✅ Constitution-compliant: /profile/{userId}
  if (user.numericId) {
    logger.debug('Constitution-compliant profile URL generated', { numericId: user.numericId });
    return `/profile/${user.numericId}`;
  }

  // ⚠️ Fallback: NumericProfileRouter will handle Firebase UID conversion
  if (user.uid) {
    logger.warn('Profile URL using Firebase UID (should use numericId)', { uid: user.uid });
    return `/profile/${user.uid}`;
  }

  // Default to current user's profile
  logger.warn('Profile URL called without user ID, defaulting to /profile');
  return '/profile';
};

/**
 * Get messages URL according to project constitution
 * 
 * ✅ STRICT CONSTITUTION ENFORCEMENT
 * Pattern: /messages/{senderNumericId}/{recipientNumericId}
 * Example: User 1 messaging User 90 -> /messages/1/90
 * 
 * @param sender - Sender user object
 * @param recipient - Recipient user object
 * @returns URL string following constitution format
 * 
 * @example
 * const url = getMessagesUrl(
 *   { numericId: 1 },
 *   { numericId: 90 }
 * );
 * // Returns: "/messages/1/90"
 */
export const getMessagesUrl = (
  sender: { numericId?: number; uid?: string },
  recipient: { numericId?: number; uid?: string }
): string => {
  // ✅ Constitution-compliant: /messages/{senderNumericId}/{recipientNumericId}
  if (sender.numericId && recipient.numericId) {
    logger.debug('Constitution-compliant messaging URL generated', { 
      sender: sender.numericId, 
      recipient: recipient.numericId 
    });
    return `/messages/${sender.numericId}/${recipient.numericId}`;
  }

  // 🚨 CONSTITUTION: Do NOT fallback to UID-based URLs - causes messaging to break
  // Return null or messages list and let caller handle the error
  logger.error('CONSTITUTION VIOLATION: Cannot generate messaging URL without numeric IDs', { 
    senderNumericId: sender.numericId,
    recipientNumericId: recipient.numericId,
    senderUid: sender.uid,
    recipientUid: recipient.uid
  });

  // Default to messages list - caller should check numeric IDs before calling
  return '/messages';
};

/**
 * Get car details URL from UnifiedCar object
 * 
 * Helper function specifically for UnifiedCar type
 * 
 * @param car - UnifiedCar object
 * @returns URL string following constitution format
 */
export const getCarUrlFromUnifiedCar = (car: UnifiedCar): string => {
  // Extract numeric IDs from car object
  // Supports both standard fields and aliases if they exist on the object
  const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
  const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId;

  return getCarDetailsUrl({
    sellerNumericId,
    carNumericId,
    sellerId: car.sellerId,
    id: car.id
  });
};
