/**
 * Numeric System Validation Service
 * 🔢 Client-side validation for numeric IDs before database operations
 * 
 * Services:
 * 1. Validate numeric cars
 * 2. Validate numeric messages
 * 3. Enforce car ownership
 * 4. Format numeric URLs
 * 
 * @file numeric-system-validation.service.ts
 * @since 2025-12-16
 */

import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from '@/firebase';
import { logger } from '@/services/logger-service';

/**
 * 🔢 Format Numeric Car URL
 * 
 * Example:
 * formatCarUrl(1, 1) → "/car/1/1"
 * formatCarUrl(2, 3) → "/car/2/3"
 */
export const formatCarUrl = (userNumericId: number, carNumericId: number): string => {
  if (!Number.isInteger(userNumericId) || !Number.isInteger(carNumericId)) {
    throw new Error('❌ User and car numeric IDs must be integers');
  }

  if (userNumericId <= 0 || carNumericId <= 0) {
    throw new Error('❌ User and car numeric IDs must be positive');
  }

  return `/car/${userNumericId}/${carNumericId}`;
};

/**
 * 🔢 Format Numeric Message URL
 * 
 * Example:
 * formatMessageUrl(1, 2) → "/messages/1/2"
 * formatMessageUrl(5, 3) → "/messages/5/3"
 */
export const formatMessageUrl = (senderNumericId: number, recipientNumericId: number): string => {
  if (!Number.isInteger(senderNumericId) || !Number.isInteger(recipientNumericId)) {
    throw new Error('❌ Sender and recipient numeric IDs must be integers');
  }

  if (senderNumericId <= 0 || recipientNumericId <= 0) {
    throw new Error('❌ Sender and recipient numeric IDs must be positive');
  }

  return `/messages/${senderNumericId}/${recipientNumericId}`;
};

/**
 * 🔢 Format Numeric Profile URL
 * 
 * Example:
 * formatProfileUrl(1) → "/profile/1"
 * formatProfileUrl(42) → "/profile/42"
 */
export const formatProfileUrl = (numericId: number): string => {
  if (!Number.isInteger(numericId)) {
    throw new Error('❌ Numeric ID must be an integer');
  }

  if (numericId <= 0) {
    throw new Error('❌ Numeric ID must be positive');
  }

  return `/profile/${numericId}`;
};

/**
 * ✅ VALIDATE NUMERIC CAR
 * 
 * Cloud Function call to validate car numeric IDs
 * 
 * Validates:
 * - User numeric ID exists
 * - Car numeric ID exists for user
 * - Car is not sold
 * 
 * Example:
 * const result = await validateNumericCar(1, 1);
 * // {
 * //   valid: true,
 * //   carId: "doc-id",
 * //   userNumericId: 1,
 * //   carNumericId: 1,
 * //   make: "BMW",
 * //   model: "320",
 * //   year: 2020,
 * //   price: 12000,
 * //   url: "/car/1/1"
 * // }
 */
export const validateNumericCar = async (
  userNumericId: number,
  carNumericId: number
): Promise<{
  valid: boolean;
  carId: string;
  userNumericId: number;
  carNumericId: number;
  make: string;
  model: string;
  year: number;
  price: number;
  url: string;
}> => {
  try {
    logger.info('🔢 Validating numeric car', {
      userNumericId,
      carNumericId
    });

    const validateCar = httpsCallable(functions, 'validateNumericCar');

    const result: HttpsCallableResult = await validateCar({
      userNumericId,
      carNumericId
    });

    const data = result.data as any;

    logger.info('✅ Car validated successfully', {
      url: data.url,
      make: data.make,
      model: data.model
    });

    return data;
  } catch (error: any) {
    logger.error('❌ Car validation failed', error, {
      userNumericId,
      carNumericId
    });

    throw new Error(
      error.message || `❌ Cannot validate car: /car/${userNumericId}/${carNumericId}`
    );
  }
};

/**
 * ✅ VALIDATE NUMERIC MESSAGE
 * 
 * Cloud Function call to validate message before sending
 * 
 * Validates:
 * - Sender owns numeric ID
 * - Recipient exists
 * - Message content is valid
 * - Content length < 5000 characters
 * 
 * Example:
 * const result = await validateNumericMessage({
 *   senderNumericId: 1,
 *   recipientNumericId: 2,
 *   subject: "Interested in your BMW",
 *   content: "Is this car still available?"
 * });
 */
export const validateNumericMessage = async (messageData: {
  senderNumericId: number;
  recipientNumericId: number;
  subject: string;
  content: string;
}): Promise<{
  valid: boolean;
  senderId: string;
  senderNumericId: number;
  recipientId: string;
  recipientNumericId: number;
  subject: string;
  content: string;
}> => {
  try {
    logger.info('🔢 Validating numeric message', {
      from: messageData.senderNumericId,
      to: messageData.recipientNumericId,
      length: messageData.content.length
    });

    // Client-side pre-validation
    if (!messageData.subject || messageData.subject.trim().length === 0) {
      throw new Error('❌ Subject is required');
    }

    if (!messageData.content || messageData.content.trim().length === 0) {
      throw new Error('❌ Content is required');
    }

    if (messageData.content.length > 5000) {
      throw new Error('❌ Content too long (max 5000 characters)');
    }

    if (messageData.senderNumericId <= 0 || messageData.recipientNumericId <= 0) {
      throw new Error('❌ Invalid numeric IDs');
    }

    // Cloud Function validation
    const validateMessage = httpsCallable(functions, 'validateNumericMessage');

    const result: HttpsCallableResult = await validateMessage(messageData);

    const data = result.data as any;

    logger.info('✅ Message validated successfully', {
      from: data.senderNumericId,
      to: data.recipientNumericId
    });

    return data;
  } catch (error: any) {
    logger.error('❌ Message validation failed', error, {
      from: messageData.senderNumericId,
      to: messageData.recipientNumericId
    });

    throw new Error(
      error.message || `❌ Cannot send message to user ${messageData.recipientNumericId}`
    );
  }
};

/**
 * ✅ ENFORCE CAR OWNERSHIP
 * 
 * Cloud Function call to verify user owns car before allowing updates
 * 
 * Validates:
 * - User owns the car
 * - Car numeric IDs match
 * 
 * Example:
 * const result = await enforceCarOwnership({
 *   carId: "doc-id",
 *   userNumericId: 1,
 *   carNumericId: 1
 * });
 */
export const enforceCarOwnership = async (params: {
  carId: string;
  userNumericId: number;
  carNumericId: number;
}): Promise<{
  authorized: boolean;
  carId: string;
  userNumericId: number;
  carNumericId: number;
  make: string;
  model: string;
}> => {
  try {
    logger.info('🔢 Enforcing car ownership', {
      carId: params.carId,
      url: `/car/${params.userNumericId}/${params.carNumericId}`
    });

    const enforceOwnership = httpsCallable(functions, 'enforceCarOwnership');

    const result: HttpsCallableResult = await enforceOwnership(params);

    const data = result.data as any;

    logger.info('✅ Ownership verified', {
      make: data.make,
      model: data.model
    });

    return data;
  } catch (error: any) {
    logger.error('❌ Ownership verification failed', error, {
      carId: params.carId
    });

    throw new Error(
      error.message || `❌ You do not own this car: /car/${params.userNumericId}/${params.carNumericId}`
    );
  }
};

/**
 * 🔢 Parse Numeric Car URL
 * 
 * Extract numeric IDs from URL format
 * 
 * Example:
 * parseCarUrl("/car/1/1") → { userNumericId: 1, carNumericId: 1 }
 * parseCarUrl("/car/2/5") → { userNumericId: 2, carNumericId: 5 }
 */
export const parseCarUrl = (
  url: string
): { userNumericId: number; carNumericId: number } | null => {
  try {
    const match = url.match(/^\/car\/(\d+)\/(\d+)$/);

    if (!match) {
      return null;
    }

    const userNumericId = parseInt(match[1], 10);
    const carNumericId = parseInt(match[2], 10);

    if (userNumericId <= 0 || carNumericId <= 0) {
      return null;
    }

    return { userNumericId, carNumericId };
  } catch {
    return null;
  }
};

/**
 * 🔢 Parse Numeric Message URL
 * 
 * Extract numeric IDs from message URL
 * 
 * Example:
 * parseMessageUrl("/messages/1/2") → { senderNumericId: 1, recipientNumericId: 2 }
 */
export const parseMessageUrl = (
  url: string
): { senderNumericId: number; recipientNumericId: number } | null => {
  try {
    const match = url.match(/^\/messages\/(\d+)\/(\d+)$/);

    if (!match) {
      return null;
    }

    const senderNumericId = parseInt(match[1], 10);
    const recipientNumericId = parseInt(match[2], 10);

    if (senderNumericId <= 0 || recipientNumericId <= 0) {
      return null;
    }

    return { senderNumericId, recipientNumericId };
  } catch {
    return null;
  }
};

/**
 * 🔢 Parse Numeric Profile URL
 * 
 * Extract numeric ID from profile URL
 * 
 * Example:
 * parseProfileUrl("/profile/1") → 1
 * parseProfileUrl("/profile/42") → 42
 */
export const parseProfileUrl = (url: string): number | null => {
  try {
    const match = url.match(/^\/profile\/(\d+)$/);

    if (!match) {
      return null;
    }

    const numericId = parseInt(match[1], 10);

    if (numericId <= 0) {
      return null;
    }

    return numericId;
  } catch {
    return null;
  }
};
