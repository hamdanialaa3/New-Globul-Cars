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

    useEffect(() => {
        let isMounted = true;

        const resolveCarId = async () => {
            if (!sellerNumericId || !carNumericId) {
                if (isMounted) {
                    setError('Invalid URL parameters');
                    setLoading(false);
                }
                return;
            }

            try {
                const sellerNum = parseInt(sellerNumericId, 10);
                const carNum = parseInt(carNumericId, 10);

                if (isNaN(sellerNum) || isNaN(carNum)) {
                    if (isMounted) {
                        setError('Invalid numeric IDs');
                        setLoading(false);
                    }
                    return;
                }

                // Resolve car by numeric fields across all vehicle collections
                const found = await resolveByNumeric(sellerNum, carNum);

                if (!isMounted) return;

                if (found) {
                    logger.info('Resolved numeric car URL', { sellerNum, carNum, carId: found.id, collection: found.collection });
                    setRealCarId(found.id);
                } else {
                    // Fallback: support legacy field name `numericId`
                    const legacyFound = await resolveByNumeric(sellerNum, carNum, true);
                    if (!isMounted) return;

                    if (legacyFound) {
                        logger.info('Resolved via legacy numericId', { sellerNum, carNum, carId: legacyFound.id });
                        setRealCarId(legacyFound.id);
                    } else {
                        // Last resort: find car by seller UID + carNumericId
                        const repairResult = await attemptRepair(sellerNum, carNum);
                        if (!isMounted) return;

                        if (repairResult) {
                            logger.info('Car resolved via repair', { sellerNum, carNum, carId: repairResult });
                            setRealCarId(repairResult);
                        } else {
                            logger.warn('Car not found', { sellerNum, carNum });
                            setError('Car not found');
                        }
                    }
                }
            } catch (err) {
                if (isMounted) {
                    logger.error('Error resolving numeric car ID', err as Error);
                    setError('System error resolving car');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        resolveCarId();

        return () => {
            isMounted = false;
        };
    }, [sellerNumericId, carNumericId]);

    // ✅ CONSTITUTION: Redirect to dedicated CarNotFoundPage with numeric context
    // Must be in useEffect to avoid setState-in-render on BrowserRouter
    useEffect(() => {
        if (!loading && (error || !realCarId)) {
            navigate(`/car/${sellerNumericId}/${carNumericId}/not-found`, { replace: true });
        }
    }, [loading, error, realCarId, navigate, sellerNumericId, carNumericId]);

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

    if (error || !realCarId) {
        return null;
    }

    // Render the actual Details Page, keeping the URL as /car/:sellerNumericId/:carNumericId
    return <CarDetailsPage forcedCarId={realCarId} />;
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
                        return docSnap.id;
                    }
                }
            } catch (err) {
                logger.warn(`Repair: Failed querying ${col}`, { error: err });
                continue;
            }
        }

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
        try {
            const colRef = collection(db, col);
            const numField = useLegacyNumericId ? 'numericId' : 'carNumericId';
            // Primary: numbers
            const q = query(
                colRef,
                where('sellerNumericId', '==', sellerNum),
                where(numField, '==', carNum),
                limit(1)
            );

            const snap = await Promise.race([
                getDocs(q),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${col}`)), 3000))
            ]);

            if (!snap.empty) {
                return { id: snap.docs[0].id, collection: col };
            }

            // Fallback: some legacy docs store numeric IDs as strings
            const qStr = query(
                colRef,
                where('sellerNumericId', '==', String(sellerNum)),
                where(numField, '==', String(carNum)),
                limit(1)
            );
            const snapStr = await Promise.race([
                getDocs(qStr),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout str: ${col}`)), 3000))
            ]);

            if (!snapStr.empty) {
                return { id: snapStr.docs[0].id, collection: col };
            }
        } catch (err) {
            logger.error(`Error querying collection ${col}`, err as Error);
            // Continue to next collection
            continue;
        }
    }
    return null;
}
