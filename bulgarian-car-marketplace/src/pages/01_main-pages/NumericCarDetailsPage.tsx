import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';
import CarDetailsPage from './CarDetailsPage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

                // 1. Find User by numericId
                const usersRef = collection(db, 'users');
                const userQuery = query(usersRef, where('numericId', '==', sellerNum), limit(1));
                const userSnap = await getDocs(userQuery);

                if (userSnap.empty) {
                    logger.warn('NumericCarDetails: Seller not found', { sellerNum });
                    setError('Seller not found');
                    setLoading(false);
                    return;
                }

                const sellerId = userSnap.docs[0].id; // Firebase UID

                // 2. Find Car by numericId AND sellerId
                // We check all car collections or just 'cars' depending on data
                // For now, assuming most are in 'cars' or we query specifically based on strict system
                const carsRef = collection(db, 'cars');
                const carQuery = query(
                    carsRef,
                    where('sellerId', '==', sellerId),
                    where('numericId', '==', carNum),
                    limit(1)
                );

                const carSnap = await getDocs(carQuery);

                if (!carSnap.empty) {
                    const foundCarId = carSnap.docs[0].id;
                    logger.info('Resolved numeric car URL', { sellerNum, carNum, foundCarId });
                    setRealCarId(foundCarId);
                } else {
                    // Try other collections if needed (passenger_cars, etc) - existing patterns suggest 'cars' is main or we need to search others
                    // For Strict ID system, we should ensure all go to one place or we search all.
                    // Let's safe search strictly in 'cars' first as SellWorkflowService defaults there unless specific type.
                    // The query above is generic.
                    logger.warn('NumericCarDetails: Car not found', { sellerId, carNum });
                    setError('Car not found');
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
    return <CarDetailsPage forcedCarId={realCarId} />;
};

export default NumericCarDetailsPage;
