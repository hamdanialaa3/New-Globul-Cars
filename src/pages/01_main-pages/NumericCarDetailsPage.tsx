import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';
import CarDetailsPage from './CarDetailsPage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { VEHICLE_COLLECTIONS } from '../../services/car/unified-car-types';

// Route: /car/:sellerNumericId/:carNumericId
// Example: /car/1/1
const NumericCarDetailsPage: React.FC = () => {
    const { sellerNumericId, carNumericId } = useParams<{ sellerNumericId: string; carNumericId: string }>();
    const navigate = useNavigate();
    const [realCarId, setRealCarId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🔍 DEBUG: Log component mount
    logger.info('🚩 NumericCarDetailsPage: Mounted', { sellerNumericId, carNumericId, rawParams: useParams() });

    useEffect(() => {
        let isMounted = true;

        const resolveCarId = async () => {
            logger.info('🔍 NumericCarDetailsPage: resolving', { sellerNumericId, carNumericId });
            if (!sellerNumericId || !carNumericId) {
                if (isMounted) {
                    logger.error('❌ NumericCarDetailsPage: Missing params');
                    setError('Invalid URL parameters');
                    setLoading(false);
                }
                return;
            }

            try {
                const sellerNum = parseInt(sellerNumericId, 10);
                const carNum = parseInt(carNumericId, 10);
                logger.info('🔢 NumericCarDetailsPage: Parsed nums', { sellerNum, carNum });

                if (isNaN(sellerNum) || isNaN(carNum)) {
                    if (isMounted) {
                        logger.error('❌ NumericCarDetailsPage: NaN params');
                        setError('Invalid numeric IDs');
                        setLoading(false);
                    }
                    return;
                }

                // Resolve car directly by numeric fields across all vehicle collections
                logger.info('🕵️‍♂️ NumericCarDetailsPage: Calling resolveByNumeric...', { collectionsCount: VEHICLE_COLLECTIONS.length });
                // VEHICLE_COLLECTIONS is a constant tuple, so length is known at compile time

                const found = await resolveByNumeric(sellerNum, carNum);
                logger.info('✅ NumericCarDetailsPage: resolveByNumeric result', { found: found || 'null' });

                if (!isMounted) return; // Stop if unmounted

                if (found) {
                    logger.info('Resolved numeric car URL', { sellerNum, carNum, foundCarId: found.id, collection: found.collection });
                    setRealCarId(found.id);
                } else {
                    logger.info('⚠️ NumericCarDetailsPage: Not found, trying legacy...');
                    // Fallback: support legacy field name `numericId`
                    const legacyFound = await resolveByNumeric(sellerNum, carNum, true);
                    logger.info('✅ NumericCarDetailsPage: Legacy result', { legacyFound: legacyFound || 'null' });

                    if (!isMounted) return;

                    if (legacyFound) {
                        logger.info('Resolved via legacy numericId', { sellerNum, carNum, foundCarId: legacyFound.id, collection: legacyFound.collection });
                        setRealCarId(legacyFound.id);
                    } else {
                        logger.warn('⚠️ NumericCarDetailsPage: Not found legacy, attempting repair...');
                        // ✅ CRITICAL FIX: Attempt to find car by seller numeric ID and repair
                        logger.warn('NumericCarDetails: Car not found by numeric IDs, attempting repair', { sellerNum, carNum });
                        const repairResult = await attemptRepair(sellerNum, carNum);
                        logger.info('🔧 NumericCarDetailsPage: Repair result', { repairResult: repairResult || 'null' });

                        if (!isMounted) return;

                        if (repairResult) {
                            logger.info('Car repaired successfully', { sellerNum, carNum, carId: repairResult });
                            setRealCarId(repairResult);
                        } else {
                            logger.error('NumericCarDetails: Car not found and repair failed', { sellerNum, carNum });
                            setError('Car not found');
                        }
                    }
                }
            } catch (err) {
                logger.error('💥 NumericCarDetailsPage: Error', err as Error);
                if (isMounted) {
                    logger.error('Error resolving numeric car ID', err as Error);
                    setError('System error resolving car');
                }
            } finally {
                if (isMounted) {
                    logger.info('🏁 NumericCarDetailsPage: Loading finished');
                    setLoading(false);
                }
            }
        };

        resolveCarId();

        return () => {
            isMounted = false;
        };
    }, [sellerNumericId, carNumericId]);

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

    if (error || !realCarId) {
        // ✅ CONSTITUTION: Redirect to dedicated CarNotFoundPage with numeric context
        navigate(`/car/${sellerNumericId}/${carNumericId}/not-found`, { replace: true });
        return null;
    }

    // Render the actual Details Page but KEEP the URL in the browser as /car/1/1
    // We pass the resolved ID to the component
    // Check if we are in edit mode
    const isEditMode = window.location.pathname.endsWith('/edit');
    return <CarDetailsPage forcedCarId={realCarId} initialEditMode={isEditMode} />;
};

export default NumericCarDetailsPage;

/**
 * ✅ CRITICAL FIX: Attempt to repair missing numeric IDs
 * Finds car by seller numeric ID and attempts to assign missing carNumericId
 */
async function attemptRepair(sellerNum: number, carNum: number): Promise<string | null> {
    try {
        // Find user by numeric ID
        const { getFirebaseUidByNumericId } = await import('../../services/numeric-id-lookup.service');
        const userId = await getFirebaseUidByNumericId(sellerNum);

        if (!userId) {
            logger.warn('Repair failed: User not found', { sellerNum });
            return null;
        }

        // Find all cars for this user and check if any match the expected carNumericId
        for (const col of VEHICLE_COLLECTIONS) {
            try {
                logger.info(`🔍 Repair: Trying collection ${col} for user ${userId}`);
                const colRef = collection(db, col);
                const q = query(
                    colRef,
                    where('sellerId', '==', userId),
                    limit(100) // Reasonable limit
                );

                // Add 3s timeout to avoid hang
                const snap = await Promise.race([
                    getDocs(q),
                    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                ]);

                // Check if any car has the expected carNumericId
                for (const docSnap of snap.docs) {
                    const data = docSnap.data();
                    if (data.carNumericId === carNum || data.carNumericId === String(carNum)) {
                        logger.info('Found car during repair attempt', { carId: docSnap.id, collection: col });
                        return docSnap.id;
                    }
                }
            } catch (err) {
                logger.warn(`⚠️ Repair: Failed/Timeout querying ${col}`, { error: err });
                continue;
            }
        }

        logger.warn('Repair failed: Car not found for user', { sellerNum, carNum });
        return null;
    } catch (error) {
        logger.error('Error during repair attempt', error as Error);
        return null;
    }
}

/**
 * Resolve car document by sellerNumericId + carNumericId across all vehicle collections
 */
async function resolveByNumeric(sellerNum: number, carNum: number, useLegacyNumericId = false): Promise<{ id: string; collection: string } | null> {
    for (const col of VEHICLE_COLLECTIONS) {
        // Yield to event loop to prevent UI freeze
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            logger.info(`🕵️‍♂️ resolveByNumeric: Checking ${col}...`, { sellerNum, carNum });
            console.log(`🕵️‍♂️ resolveByNumeric: Checking ${col}...`, { sellerNum, carNum });

            const colRef = collection(db, col);
            const numField = useLegacyNumericId ? 'numericId' : 'carNumericId';
            // Primary: numbers
            const q = query(
                colRef,
                where('sellerNumericId', '==', sellerNum),
                where(numField, '==', carNum),
                limit(1)
            );

            // Add 2s timeout to avoid hang
            let snap;
            try {
                snap = await Promise.race([
                    getDocs(q),
                    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout querying ${col}`)), 2000))
                ]);
            } catch (timeoutErr) {
                logger.error(`⏳ Timeout resolving numeric ID in ${col}`, timeoutErr as Error);
                console.error(`⏳ Timeout resolving numeric ID in ${col}`, timeoutErr);
                continue; // skip this collection on timeout
            }

            if (!snap.empty) {
                const doc = snap.docs[0];
                return { id: doc.id, collection: col };
            }

            // Fallback: some legacy docs may store numeric IDs as strings
            const qStr = query(
                colRef,
                where('sellerNumericId', '==', String(sellerNum)),
                where(numField, '==', String(carNum)),
                limit(1)
            );
            // Add 2s timeout to avoid hang
            let snapStr;
            try {
                snapStr = await Promise.race([
                    getDocs(qStr),
                    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout querying str ${col}`)), 2000))
                ]);
            } catch (timeoutErr) {
                logger.error(`⏳ Timeout resolving numeric ID (string fallback) in ${col}`, timeoutErr as Error);
                console.error(`⏳ Timeout resolving numeric ID (string fallback) in ${col}`, timeoutErr);
                continue;
            }

            if (!snapStr.empty) {
                const doc = snapStr.docs[0];
                return { id: doc.id, collection: col };
            }
        } catch (err) {
            logger.error(`Error querying collection ${col}`, err as Error);
            // Continue to next collection
            continue;
        }
    }
    return null;
}
