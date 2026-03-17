import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { unifiedCarService } from '@/services/car';
import { CarListing } from '@/types/CarListing';
import { logger } from '@/services/logger-service';
import { startAiTrace, endAiTrace } from '@/services/performance/ai-performance-traces';

export const useCarDetails = (carId: string | undefined) => {
  const [car, setCar] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ FIX: Force refresh function to reload data from Firestore
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const loadCar = async () => {
      if (!carId) {
        logger.info('❌ No carId provided');
        setLoading(false);
        return;
      }
      
      // ✅ FIX: Reset loading state on refresh
      setLoading(true);
      logger.info('🔍 Loading car with ID:', carId, { refreshKey });
      
      const trace = startAiTrace('car_details_load');
      const startTime = performance.now();
      
      try {
        // Try unifiedCarService first
        let carData: CarListing | null = null;
        
        try {
          const unifiedCar = await unifiedCarService.getCarById(carId);
          if (unifiedCar) {
            // Convert UnifiedCar to CarListing format
            carData = {
              ...unifiedCar,
              vehicleType: (unifiedCar as any).vehicleType || 'car',
              sellerType: unifiedCar.sellerType || 'private',
              sellerName: (unifiedCar as any).sellerName || '',
              sellerEmail: (unifiedCar as any).sellerEmail || '',
              sellerPhone: (unifiedCar as any).sellerPhone || '',
              city: (unifiedCar as any).city || '',
              region: (unifiedCar as any).region || '',
              accidentHistory: (unifiedCar as any).accidentHistory || false,
              serviceHistory: (unifiedCar as any).serviceHistory || false,
            } as CarListing;
          }
        } catch (unifiedError) {
          logger.info('⚠️ unifiedCarService failed, trying direct Firestore query...', unifiedError);
        }
        
        // Fallback: Direct Firestore query if unifiedCarService fails or returns null
        if (!carData) {
          logger.info('⚠️ Trying direct Firestore query for car:', carId);
          const carRef = doc(db, 'cars', carId);
          const carSnap = await getDoc(carRef);
          
          if (carSnap.exists()) {
            const data = carSnap.data();
            logger.info('✅ Found car in Firestore:', data);
            carData = {
              id: carSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            } as CarListing;
          } else {
            logger.info('❌ Car not found in Firestore collection "cars" with ID:', carId);
            // Try alternative collections including all vehicle type collections
            const alternativeCollections = [
              'listings', 
              'vehicles', 
              'car_listings',
              'passenger_cars',   // New: Personal cars
              'suvs',             // New: SUVs/Jeeps
              'vans',             // New: Vans/Cargo
              'motorcycles',      // New: Motorcycles
              'trucks',           // New: Trucks
              'buses'             // New: Buses
            ];
            for (const collectionName of alternativeCollections) {
              try {
                const altRef = doc(db, collectionName, carId);
                const altSnap = await getDoc(altRef);
                if (altSnap.exists()) {
                  logger.info(`✅ Found car in collection "${collectionName}"`);
                  const data = altSnap.data();
                  carData = {
                    id: altSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                  } as CarListing;
                  break;
                }
              } catch (altError) {
                logger.info(`⚠️ Error checking collection "${collectionName}":`, altError);
              }
            }
          }
        }
        
        logger.info('✅ Car data loaded:', carData);
        
        if (carData) {
          setCar(carData);
        } else {
          logger.info('⚠️ Car not found in database');
        }
        
        const duration = performance.now() - startTime;
        endAiTrace(trace, { load_duration_ms: duration, found: carData ? 1 : 0 });
      } catch (error) {
        logger.error('❌ Error loading car:', error);
        logger.error('Error loading car details', error as Error, { carId });
        endAiTrace(trace, { error: 1 });
      } finally {
        setLoading(false);
        logger.info('✅ Loading finished');
      }
    };

    loadCar();
  }, [carId, refreshKey]);

  return { car, loading, setCar, refresh };
};
