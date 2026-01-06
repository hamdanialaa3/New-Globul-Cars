import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';
import { VEHICLE_COLLECTIONS } from '../../services/car/unified-car-types';

// Legacy route handler: /car/:id (UUID-based)
// Converts old UUID URLs to new numeric format: /car/{sellerNumericId}/{carNumericId}
export function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolveAndRedirect = async () => {
      if (!id) {
        logger.warn('CarDetailsPage: No ID provided');
        navigate('/search', { replace: true });
        return;
      }

      try {
        // Try to find car by UUID in all vehicle collections
        for (const collectionName of VEHICLE_COLLECTIONS) {
          const q = query(
            collection(db, collectionName),
            where('id', '==', id)
          );
          const snapshot = await getDocs(q);

          if (!snapshot.empty && isMounted) {
            const carData = snapshot.docs[0].data();
            const sellerNumericId = carData.sellerNumericId || carData.ownerNumericId;
            const carNumericId = carData.carNumericId;

            if (sellerNumericId && carNumericId) {
              logger.info('CarDetailsPage: Redirecting UUID to numeric URL', {
                uuid: id,
                sellerNumericId,
                carNumericId
              });
              navigate(`/car/${sellerNumericId}/${carNumericId}`, { replace: true });
              return;
            }
          }
        }

        // If not found or missing numeric IDs, redirect to search
        if (isMounted) {
          logger.warn('CarDetailsPage: Car not found or missing numeric IDs', { uuid: id });
          navigate('/search', { replace: true });
        }
      } catch (error) {
        logger.error('CarDetailsPage: Error resolving UUID', error);
        if (isMounted) {
          navigate('/search', { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    resolveAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
        <p>Resolving car details...</p>
      </div>
    );
  }

  return null;
}

export default CarDetailsPage;