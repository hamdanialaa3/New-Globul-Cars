/**
 * Branded Types System
 * ====================
 * Prevents type confusion between different numeric ID types
 * 
 * @gemini-suggestion This prevents bugs like passing carId as userId
 * @author Gemini + Implementation
 * @date January 14, 2026
 * 
 * @example
 * // ❌ BEFORE: Easy to mix up
 * function sendMessage(userId: number, carId: number) { ... }
 * sendMessage(carId, userId); // TypeScript doesn't catch this!
 * 
 * // ✅ AFTER: Type-safe
 * function sendMessage(userId: NumericUserId, carId: NumericCarId) { ... }
 * sendMessage(carId, userId); // ❌ Compile error!
 */

/**
 * Numeric User ID (1, 2, 3...)
 * Used in URLs: /profile/18, /messages/18/42
 */
export type NumericUserId = number & { readonly __brand: 'NumericUserId' };

/**
 * Numeric Car ID (1, 2, 3... per seller)
 * Used in URLs: /car/18/5
 */
export type NumericCarId = number & { readonly __brand: 'NumericCarId' };

/**
 * Channel ID (deterministic format: msg_5_18_car_42)
 */
export type ChannelId = string & { readonly __brand: 'ChannelId' };

/**
 * Firebase UID (abc123def456...)
 * Used internally, never in URLs
 */
export type FirebaseUid = string & { readonly __brand: 'FirebaseUid' };

/**
 * Message ID (msg_timestamp_random)
 */
export type MessageId = string & { readonly __brand: 'MessageId' };

/**
 * Firestore Car ID (internal UUID)
 */
export type FirestoreCarId = string & { readonly __brand: 'FirestoreCarId' };

/**
 * Smart constructors (type-safe factories)
 * ========================================
 */

export function createNumericUserId(id: number): NumericUserId {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid NumericUserId: ${id} (must be positive integer)`);
  }
  return id as NumericUserId;
}

export function createNumericCarId(id: number): NumericCarId {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid NumericCarId: ${id} (must be positive integer)`);
  }
  return id as NumericCarId;
}

export function createChannelId(
  userId1: NumericUserId,
  userId2: NumericUserId,
  carId?: NumericCarId
): ChannelId {
  const [min, max] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  
  if (carId && carId > 0) {
    return `msg_${min}_${max}_car_${carId}` as ChannelId;
  }
  
  return `msg_${min}_${max}` as ChannelId;
}

export function createFirebaseUid(uid: string): FirebaseUid {
  if (!uid || uid.length < 10) {
    throw new Error(`Invalid FirebaseUid: ${uid}`);
  }
  return uid as FirebaseUid;
}

export function createMessageId(prefix: string = 'msg'): MessageId {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}_${random}` as MessageId;
}

export function createFirestoreCarId(id: string): FirestoreCarId {
  if (!id || id.length < 5) {
    throw new Error(`Invalid FirestoreCarId: ${id}`);
  }
  return id as FirestoreCarId;
}

/**
 * Type guards (runtime validation)
 * ================================
 */

export function isNumericUserId(value: unknown): value is NumericUserId {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isNumericCarId(value: unknown): value is NumericCarId {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isChannelId(value: unknown): value is ChannelId {
  if (typeof value !== 'string') return false;
  
  // Validate format: msg_5_18 or msg_5_18_car_42
  const pattern = /^msg_\d+_\d+(_car_\d+)?$/;
  return pattern.test(value);
}

export function isFirebaseUid(value: unknown): value is FirebaseUid {
  return typeof value === 'string' && value.length >= 10;
}

export function isMessageId(value: unknown): value is MessageId {
  if (typeof value !== 'string') return false;
  
  // Validate format: msg_timestamp_random
  const pattern = /^msg_\d+_[a-z0-9]+$/;
  return pattern.test(value);
}

export function isFirestoreCarId(value: unknown): value is FirestoreCarId {
  return typeof value === 'string' && value.length >= 5;
}

/**
 * Parsing functions (from URL params)
 * ===================================
 */

export function parseNumericUserId(value: string | number): NumericUserId {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric user ID: ${value}`);
  }
  
  return createNumericUserId(parsed);
}

export function parseNumericCarId(value: string | number): NumericCarId {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric car ID: ${value}`);
  }
  
  return createNumericCarId(parsed);
}

export function parseChannelId(value: string): ChannelId {
  if (!isChannelId(value)) {
    throw new Error(`Invalid channel ID format: ${value}`);
  }
  return value as ChannelId;
}

/**
 * Extraction utilities
 * ====================
 */

export function extractUserIdsFromChannelId(channelId: ChannelId): {
  userId1: NumericUserId;
  userId2: NumericUserId;
  carId?: NumericCarId;
} {
  // Format: msg_5_18 or msg_5_18_car_42
  const parts = channelId.split('_');
  
  if (parts.length < 3) {
    throw new Error(`Invalid channel ID: ${channelId}`);
  }
  
  const userId1 = createNumericUserId(parseInt(parts[1], 10));
  const userId2 = createNumericUserId(parseInt(parts[2], 10));
  
  if (parts.length === 5 && parts[3] === 'car') {
    const carId = createNumericCarId(parseInt(parts[4], 10));
    return { userId1, userId2, carId };
  }
  
  return { userId1, userId2 };
}

/**
 * Comparison utilities
 * ====================
 */

export function areUserIdsEqual(id1: NumericUserId, id2: NumericUserId): boolean {
  return id1 === id2;
}

export function areCarIdsEqual(id1: NumericCarId, id2: NumericCarId): boolean {
  return id1 === id2;
}

export function areChannelIdsEqual(id1: ChannelId, id2: ChannelId): boolean {
  return id1 === id2;
}

/**
 * Unsafe casting (use ONLY when absolutely necessary)
 * ====================================================
 */

export function unsafeCastToNumericUserId(id: number): NumericUserId {
  return id as NumericUserId;
}

export function unsafeCastToNumericCarId(id: number): NumericCarId {
  return id as NumericCarId;
}

export function unsafeCastToChannelId(id: string): ChannelId {
  return id as ChannelId;
}

/**
 * Export all types
 * ================
 */

export type BrandedId =
  | NumericUserId
  | NumericCarId
  | ChannelId
  | FirebaseUid
  | MessageId
  | FirestoreCarId;

/**
 * Usage Examples
 * ==============
 * 
 * @example Basic usage
 * import { createNumericUserId, createChannelId } from '@/types/branded-types';
 * 
 * const userId = createNumericUserId(18);
 * const carId = createNumericCarId(5);
 * const channelId = createChannelId(userId, recipientId, carId);
 * 
 * @example Parsing URL params
 * import { parseNumericUserId } from '@/types/branded-types';
 * 
 * const { numericId } = useParams();
 * const userId = parseNumericUserId(numericId!);
 * 
 * @example Type guards
 * if (isNumericUserId(value)) {
 *   // TypeScript knows value is NumericUserId
 *   const userId: NumericUserId = value;
 * }
 * 
 * @example Channel ID extraction
 * const { userId1, userId2, carId } = extractUserIdsFromChannelId(channelId);
 */
