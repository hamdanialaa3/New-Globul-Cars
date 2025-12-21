import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import { logger } from '../services/logger-service';

const NumericCarRedirect: React.FC = () => {
    const { sellerId, carId } = useParams<{ sellerId: string; carId: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const resolveCar = async () => {
            if (!sellerId || !carId) return;

            try {
                const sellerNum = parseInt(sellerId);
                const carNum = parseInt(carId);

                if (isNaN(sellerNum) || isNaN(carNum)) {
                    setError('Invalid ID format');
                    return;
                }

                logger.debug('Looking up car', { sellerNum, carNum });

                // 1. Find the seller by numericId
                const usersRef = collection(db, 'users');
                const userQuery = query(usersRef, where('numericId', '==', sellerNum), limit(1));
                const userSnapshot = await getDocs(userQuery);

                if (userSnapshot.empty) {
                    setError('Seller not found');
                    return;
                }

                const userDoc = userSnapshot.docs[0];
                const userId = userDoc.id;

                // 2. Find the car by sellerId (uid) and numericId
                const carsRef = collection(db, 'cars');
                // Note: We search by sellerId (UID) because that's indexed with numericId usually, 
                // OR we can search by sellerNumericId if that field is reliably populated.
                // Given I'm backfilling sellerNumericId, I should try to use it if possible, 
                // BUT searching by sellerId (UID) + numericId is safer if we just resolved the UID.
                const carQuery = query(
                    carsRef,
                    where('sellerId', '==', userId),
                    where('numericId', '==', carNum),
                    limit(1)
                );

                const carSnapshot = await getDocs(carQuery);

                if (carSnapshot.empty) {
                    // Fallback: Try searching by sellerNumericId directly (in case sellerId matched but data is weird)
                    const carQueryFallback = query(
                        carsRef,
                        where('sellerNumericId', '==', sellerNum),
                        where('numericId', '==', carNum),
                        limit(1)
                    );
                    const fallbackSnapshot = await getDocs(carQueryFallback);

                    if (!fallbackSnapshot.empty) {
                        const carDoc = fallbackSnapshot.docs[0];
                        // Navigate to the standard car details page
                        // We typically use the UUID route for the actual render to reuse logic
                        navigate(`/cars/${carDoc.id}`, { replace: true });
                        return;
                    }

                    setError('Car not found');
                    return;
                }

                const carDoc = carSnapshot.docs[0];
                navigate(`/cars/${carDoc.id}`, { replace: true });

            } catch (err) {
                logger.error('Error resolving numeric car URL', err as Error);
                setError('Error loading car');
            }
        };

        resolveCar();
    }, [sellerId, carId, navigate]);

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>{error}</h2>
                <button onClick={() => navigate('/cars')}>Browse Cars</button>
            </div>
        );
    }

    return <LoadingSpinner />; // Or a custom loader text
};

export default NumericCarRedirect;
