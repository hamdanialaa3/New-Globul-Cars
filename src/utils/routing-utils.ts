// Routing Utilities - Unified URL Generation
// Routing Utilities - Generate Unified Links
//
// PROJECT CONSTITUTION COMPLIANCE:
// - Car URLs: /car/{userId}/{carLocalId}
// - Profile URLs: /profile/{userId}
// - Messages URLs: /messages/{senderNumericId}/{recipientNumericId}

import { UnifiedCar } from '../services/car/unified-car-types';

/**
 * Get car details URL according to project constitution
 * 
 * Constitution Rule: /car/{userId}/{carLocalId}
 * 
 * @param car - Car object with seller and car IDs
 * @returns URL string following constitution format
 * 
 * @example
 * const url = getCarDetailsUrl({ sellerNumericId: 1, carNumericId: 5 });
 * // Returns: "/car/1/5"
 */
export const getCarDetailsUrl = (car: {
  sellerNumericId?: number;
  carNumericId?: number;
  sellerId?: string;
  id?: string;
}): string => {
  // ✅ Constitution-compliant Priority: /car/{sellerNum}/{carNum}
  if (car.sellerNumericId && car.carNumericId) {
    return `/car/${car.sellerNumericId}/${car.carNumericId}`;
  }

  // Fallback for cases where only numeric car ID is available (should be редко)
  if (car.carNumericId && !car.sellerNumericId && car.sellerId) {
    // We can't build the full numeric URL without seller numeric ID
    // but we should avoid legacy if possible. 
    // For now, if we have the UUID, we use it as fallback 
    return `/car-details/${car.id || car.carNumericId}`;
  }

  // Final fallback to the basic cars list if we can't even get a UUID
  return car.id ? `/car-details/${car.id}` : '/cars';
};

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
export const getProfileUrl = (user: {
  numericId?: number;
  uid?: string;
}): string => {
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
export const getMessagesUrl = (
  sender: { numericId?: number; uid?: string },
  recipient: { numericId?: number; uid?: string }
): string => {
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
  const sellerNumericId = (car as any).sellerNumericId;
  const carNumericId = (car as any).carNumericId;

  return getCarDetailsUrl({
    sellerNumericId,
    carNumericId,
    sellerId: car.sellerId,
    id: car.id
  });
};

