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
        const resolveCarId = async () => {
            if (!sellerNumericId || !carNumericId) {
                setError('Invalid URL parameters');
                setLoading(false);
                return;
            }

            try {
                const sellerNum = parseInt(sellerNumericId, 10);
                const carNum = parseInt(carNumericId, 10);

                if (isNaN(sellerNum) || isNaN(carNum)) {
                    setError('Invalid numeric IDs');
                    setLoading(false);
                    return;
                }

                // Resolve car directly by numeric fields across all vehicle collections
                const found = await resolveByNumeric(sellerNum, carNum);
                if (found) {
                    logger.info('Resolved numeric car URL', { sellerNum, carNum, foundCarId: found.id, collection: found.collection });
                    setRealCarId(found.id);
                } else {
                    // Fallback: support legacy field name `numericId`
                    const legacyFound = await resolveByNumeric(sellerNum, carNum, true);
                    if (legacyFound) {
                        logger.info('Resolved via legacy numericId', { sellerNum, carNum, foundCarId: legacyFound.id, collection: legacyFound.collection });
                        setRealCarId(legacyFound.id);
                    } else {
                        logger.warn('NumericCarDetails: Car not found', { sellerNum, carNum });
                        setError('Car not found');
                    }
                }
            } catch (err) {
                logger.error('Error resolving numeric car ID', err as Error);
                setError('System error resolving car');
            } finally {
                setLoading(false);
            }
        };

        resolveCarId();
    }, [sellerNumericId, carNumericId]);

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

    if (error || !realCarId) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Car Not Found</h2>
                <p className="text-gray-600">{error || 'The requested car could not be located.'}</p>
                <button
                    onClick={() => navigate('/cars')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Browse Cars
                </button>
            </div>
        );
    }

    // Render the actual Details Page but KEEP the URL in the browser as /car/1/1
    // We pass the resolved ID to the component
    // Check if we are in edit mode
    const isEditMode = window.location.pathname.endsWith('/edit');
    return <CarDetailsPage forcedCarId={realCarId} initialEditMode={isEditMode} />;
};

export default NumericCarDetailsPage;

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
            const snap = await getDocs(q);
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
            const snapStr = await getDocs(qStr);
            if (!snapStr.empty) {
                const doc = snapStr.docs[0];
                return { id: doc.id, collection: col };
            }
        } catch (err) {
            // Continue to next collection
            continue;
        }
    }
    return null;
}
