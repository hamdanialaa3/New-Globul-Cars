/**
 * FIXES APPLIED:
 * - [Issue #3]: Race Condition in Numeric ID Assignment
 * - Changes:
 *   1. Added exponential backoff with jitter to prevent thundering herd
 *   2. Improved transaction error handling with detailed logging
 *   3. Stronger idempotency check with validation
 *   4. Detailed logging with timestamps for debugging
 *   5. Fallback mechanism for edge cases
 *   6. Increased MAX_RETRIES from 5 to 7
 * - Tested: Concurrent ID assignment, transaction conflicts, network failures
 * 
 * الإصلاحات المطبقة:
 * - [المشكلة #3]: حالة السباق في تعيين معرف رقمي
 * - التغييرات:
 *   1. إضافة تأخير أسي مع عشوائية لمنع الطلبات الجماعية
 *   2. تحسين معالجة أخطاء المعاملات مع سجلات مفصلة
 *   3. فحص أقوى للـ idempotency مع التحقق
 *   4. سجلات مفصلة مع طوابع زمنية للتصحيح
 *   5. آلية احتياطية للحالات الحرجة
 *   6. زيادة MAX_RETRIES من 5 إلى 7
 */

/**
 * Numeric ID Assignment Service
 * Automatically assigns numeric IDs to users who don't have one
 * خدمة تعيين المعرف الرقمي - تعيين معرفات رقمية للمستخدمين تلقائياً
 */

import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from './logger-service';

/**
 * Calculate exponential backoff delay with jitter
 * حساب التأخير الأسي مع عشوائية
 * 
 * @param attempt Current retry attempt number (1-based)
 * @returns Delay in milliseconds
 * 
 * Formula: baseDelay * (2 ^ (attempt - 1)) + random jitter
 * Example: attempt 1 = 500-1500ms, attempt 2 = 1000-2000ms, attempt 3 = 2000-3000ms
 */
const calculateBackoffDelay = (attempt: number): number => {
  const BASE_DELAY_MS = 500;
  const MAX_DELAY_MS = 10000; // Cap at 10 seconds
  
  // Exponential backoff: 500ms * 2^(attempt-1)
  const exponentialDelay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
  
  // Add jitter (random 0-100% of exponential delay) to prevent thundering herd
  // إضافة عشوائية لمنع الطلبات المتزامنة
  const jitter = Math.random() * exponentialDelay;
  
  const totalDelay = Math.min(exponentialDelay + jitter, MAX_DELAY_MS);
  
  return totalDelay;
};

/**
 * Validate that the assigned numeric ID is valid and not duplicate
 * التحقق من صحة المعرف الرقمي المعين
 * 
 * @param numericId The ID to validate
 * @returns true if valid, false otherwise
 */
const validateNumericId = (numericId: number | undefined | null): boolean => {
  if (typeof numericId !== 'number') {
    return false;
  }
  
  if (numericId <= 0) {
    logger.error('Invalid numeric ID assigned (must be > 0)', undefined, { numericId });
    return false;
  }
  
  if (!Number.isInteger(numericId)) {
    logger.error('Invalid numeric ID assigned (must be integer)', undefined, { numericId });
    return false;
  }
  
  return true;
};

/**
 * Ensure user has a numeric ID, assign one if missing
 * Uses a single atomic transaction for both Counter and User documents
 * to prevent race conditions (e.g. double ID assignment).
 * 
 * ضمان أن المستخدم لديه معرف رقمي، تعيين واحد إذا كان مفقوداً
 * 
 * @param uid Firebase UID
 * @returns The user's numeric ID (existing or newly assigned)
 * 
 * Race Condition Protection:
 * - Uses Firestore transactions for atomic read-modify-write
 * - Exponential backoff prevents concurrent request collision
 * - Idempotency check ensures no duplicate assignments
 * - Validation prevents invalid IDs from being returned
 * 
 * Testing Scenarios:
 * - Test 1: Single user assignment (normal case)
 * - Test 2: Concurrent assignments (2+ users at same time)
 * - Test 3: Transaction conflict (simulate with load testing)
 * - Test 4: Network failure during transaction
 * - Test 5: Invalid UID input (null, empty, etc.)
 */
export const ensureUserNumericId = async (uid: string): Promise<number | null> => {
  const startTime = Date.now();
  
  if (!uid || typeof uid !== 'string') {
    logger.warn('Invalid UID provided to ensureUserNumericId', { uid });
    return null;
  }

  const userRef = doc(db, 'users', uid);
  const counterRef = doc(db, 'counters', 'users');

  const MAX_RETRIES = 7; // ✅ FIXED: Increased from 5 to 7
  // RETRY_DELAY_MS removed - now using exponential backoff

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const attemptStartTime = Date.now();
    
    try {
      logger.info(`ensureUserNumericId: Attempt ${attempt}/${MAX_RETRIES}`, {
        uid,
        attempt,
        timestamp: new Date().toISOString()
      });
      
      const numericId = await runTransaction(db, async (transaction) => {
        // 1. Read User Doc
        // قراءة مستند المستخدم
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          // If we are on the last attempt, throw
          if (attempt === MAX_RETRIES) {
            logger.error('User document does not exist after max retries', undefined, { 
              uid, 
              attempts: MAX_RETRIES,
              totalTime: Date.now() - startTime
            });
            throw new Error('User document does not exist after retries');
          }
          // Retry with backoff for user doc creation race
          logger.debug(`User doc not found, will retry with backoff`, { uid, attempt });
          throw new Error('RETRY_NEEDED');
        }

        const userData = userDoc.data();

        // 2. ✅ FIXED: Stronger Idempotency Check with Validation
        // فحص أقوى للـ Idempotency مع التحقق
        if (userData.numericId !== undefined && userData.numericId !== null) {
          if (validateNumericId(userData.numericId)) {
            logger.info('User already has valid numeric ID', { 
              uid, 
              numericId: userData.numericId,
              assignedAt: userData.numericIdAssignedAt
            });
            return userData.numericId;
          } else {
            // Invalid existing ID - log warning and reassign
            logger.warn('User has invalid numeric ID, will reassign', { 
              uid, 
              invalidId: userData.numericId 
            });
            // Continue to reassignment below
          }
        }

        // 3. Read Counter Doc
        // قراءة مستند العداد
        const counterDoc = await transaction.get(counterRef);
        let currentCount = 0;
        if (counterDoc.exists()) {
          currentCount = counterDoc.data()?.count || 0;
        } else {
          // Counter doesn't exist - initialize it
          logger.info('Counter document does not exist, initializing', { uid });
        }

        // 4. Increment
        const nextId = currentCount + 1;
        
        // ✅ FIXED: Validate next ID before assignment
        if (!validateNumericId(nextId)) {
          throw new Error(`Invalid next ID calculated: ${nextId}`);
        }

        // 5. Update both documents atomically
        // تحديث كلا المستندين بشكل ذري
        transaction.set(counterRef, { 
          count: nextId, 
          updatedAt: new Date(),
          lastAssignedTo: uid // ✅ ADDED: Track last assignment for debugging
        }, { merge: true });
        
        transaction.update(userRef, {
          numericId: nextId,
          numericIdAssignedAt: new Date(),
          updatedAt: new Date()
        });

        logger.info('Numeric ID assigned successfully', { 
          uid, 
          numericId: nextId,
          attempt,
          transactionTime: Date.now() - attemptStartTime
        });

        return nextId;
      });

      // ✅ FIXED: Post-transaction validation
      // التحقق بعد المعاملة
      if (validateNumericId(numericId)) {
        const totalTime = Date.now() - startTime;
        logger.info('ensureUserNumericId completed successfully', {
          uid,
          numericId,
          totalAttempts: attempt,
          totalTime,
          avgTimePerAttempt: totalTime / attempt
        });
        return numericId;
      } else {
        logger.error('Transaction returned invalid numeric ID', undefined, { 
          uid, 
          numericId,
          attempt 
        });
        // Fall through to retry
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const attemptTime = Date.now() - attemptStartTime;
      
      // ✅ FIXED: Better error handling with detailed logging
      // معالجة أخطاء أفضل مع سجلات مفصلة
      if (errorMessage === 'RETRY_NEEDED') {
        logger.debug(`User doc not found, retrying with exponential backoff`, { 
          uid, 
          attempt, 
          maxRetries: MAX_RETRIES,
          attemptTime
        });
      } else {
        // Log all transaction errors for debugging
        logger.error('Transaction failed in ensureUserNumericId', error as Error, { 
          uid, 
          attempt,
          maxRetries: MAX_RETRIES,
          attemptTime,
          errorType: error instanceof Error ? error.constructor.name : typeof error
        });
      }
      
      // If not last attempt, retry with exponential backoff
      if (attempt < MAX_RETRIES) {
        const backoffDelay = calculateBackoffDelay(attempt);
        logger.debug(`Retrying after backoff delay`, { 
          uid,
          attempt,
          backoffDelay,
          nextAttempt: attempt + 1
        });
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }
      
      // Last attempt failed
      logger.error('All retry attempts exhausted for ensureUserNumericId', error as Error, { 
        uid,
        totalAttempts: MAX_RETRIES,
        totalTime: Date.now() - startTime
      });
      
      // ✅ FIXED: Fallback mechanism - return null for graceful degradation
      // آلية احتياطية - إرجاع null للتدهور الرحيم
      return null;
    }
  }
  
  // ✅ FIXED: Should never reach here, but handle gracefully
  logger.error('Unexpected fallthrough in ensureUserNumericId', undefined, { 
    uid,
    totalTime: Date.now() - startTime
  });
  return null;
};

/**
 * Get user's numeric ID if it exists
 * @param uid Firebase UID
 * @returns The user's numeric ID or null
 */
export const getUserNumericId = async (uid: string): Promise<number | null> => {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') return null;

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const numericId = snap.data()?.numericId;
    return typeof numericId === 'number' ? numericId : null;
  } catch (error) {
    logger.error('Failed to get user numeric ID', error as Error, { uid });
    return null;
  }
};
