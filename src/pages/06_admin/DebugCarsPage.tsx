// Debug Page - Check Cars in Firestore
// Debug Page - Check Cars in Firestore Database
// SECURED: Only available in development environment

import { Navigate } from 'react-router-dom';

const IS_DEV = process.env.NODE_ENV === 'development';


import React, { useState, useEffect } from 'react';
import { logger } from '../../services/logger-service';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { collection, getDocs, query, limit, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { CarListing } from '../../types/CarListing';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const ContentCard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin: 1rem 0.5rem 1rem 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CarsList = styled.div`
  margin-top: 2rem;
  max-height: 600px;
  overflow-y: auto;
`;

const CarItem = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
`;

const CodeBlock = styled.pre`
  background: #2d3748;
  color: #a0aec0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;

  h3 {
    font-size: 2rem;
    margin: 0;
  }

  p {
    margin: 0.5rem 0 0 0;
    opacity: 0.9;
  }
`;

interface CarDebugData extends CarListing {
  id: string;
  location?: string;
  city?: string;
  locationData?: { cityNameId?: string; cityId?: string };
}

interface DebugStats {
  total: number;
  withUnifiedLocation: number;
  withOldCity: number;
  withoutCity: number;
  cityBreakdown: Record<string, number>;
}

const DebugCarsPage: React.FC = () => {
  // Security check: If in production, redirect to home
  if (!IS_DEV) {
    return <Navigate to="/" replace />;
  }

  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<CarDebugData[]>([]);
  const [stats, setStats] = useState<DebugStats | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const carsRef = collection(db, 'cars');
      const q = query(carsRef, limit(20));
      const snapshot = await getDocs(q);

      const carsData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as CarDebugData[];

      setCars(carsData);

      // Calculate stats
      const cityStats: Record<string, number> = {};
      const withLocation = carsData.filter((car) => car.location && car.locationData?.cityNameId);
      const withOldCity = carsData.filter((car) => car.city && !car.location?.cityId);
      const withoutCity = carsData.filter((car) => !car.city && !car.location?.cityId);

      carsData.forEach((car) => {
        const city = car.location?.cityId || car.city || 'Unknown';
        cityStats[city] = (cityStats[city] || 0) + 1;
      });

      setStats({
        total: carsData.length,
        withUnifiedLocation: withLocation.length,
        withOldCity: withOldCity.length,
        withoutCity: withoutCity.length,
        cityBreakdown: cityStats
      });

    } catch (error) {
      logger.error('Error fetching cars (debug page)', error as Error);
      toast.error('Error fetching cars! Check console.');
    } finally {
      setLoading(false);
    }
  };

  const VEHICLE_COLLECTIONS = [
    'cars', // Backward compatibility
    'passenger_cars',
    'suvs',
    'vans',
    'motorcycles',
    'trucks',
    'buses'
  ];

  const deleteLegacyCars = async () => {
    if (!window.confirm('Are you sure you want to delete ALL cars without numeric IDs from ALL collections? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      let totalDeleted = 0;
      const { deleteDoc, doc } = await import('firebase/firestore');

      for (const collectionName of VEHICLE_COLLECTIONS) {
        const carsRef = collection(db, collectionName);
        const snapshot = await getDocs(carsRef);

        const legacyCars = snapshot.docs.filter((doc: any) => {
          const data = doc.data();
          return !data.carNumericId || !data.sellerNumericId;
        });

        if (legacyCars.length > 0) {
          logger.info(`Found ${legacyCars.length} legacy cars in ${collectionName}`);

          for (const carDoc of legacyCars) {
            await deleteDoc(doc(db, collectionName, carDoc.id));
            totalDeleted++;
          }
        }
      }

      if (totalDeleted === 0) {
        toast.info('No legacy cars found to delete in any collection.');
      } else {
        toast.success(`Successfully deleted ${totalDeleted} legacy cars across all collections.`);
        fetchAllCars(); // Refresh list
      }

    } catch (error) {
      logger.error('Error deleting legacy cars', error as Error);
      toast.error('Error deleting legacy cars! Check console.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCars = async () => {
    try {
      setLoading(true);
      let allCars: CarDebugData[] = [];

      for (const collectionName of VEHICLE_COLLECTIONS) {
        const carsRef = collection(db, collectionName);
        const snapshot = await getDocs(carsRef);
        const carsData = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          _sourceCollection: collectionName
        })) as CarDebugData[];
        allCars = [...allCars, ...carsData];
      }

      setCars(allCars);

      // Calculate stats
      const cityStats: Record<string, number> = {};
      const withLocation = allCars.filter((car) => car.location && car.locationData?.cityNameId);
      const withOldCity = allCars.filter((car) => car.city && !car.location?.cityId);
      const withoutCity = allCars.filter((car) => !car.city && !car.location?.cityId);

      allCars.forEach((car) => {
        const city = car.location?.cityId || car.city || 'Unknown';
        cityStats[city] = (cityStats[city] || 0) + 1;
      });

      setStats({
        total: allCars.length,
        withUnifiedLocation: withLocation.length,
        withOldCity: withOldCity.length,
        withoutCity: withoutCity.length,
        cityBreakdown: cityStats
      });

    } catch (error) {
      logger.error('Error fetching all cars (debug page)', error as Error);
      toast.error('Error fetching all cars! Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentCard>
        <Title>🔍 Debug Cars in Database</Title>
        <p>Debug: Check Cars in Firestore</p>

        <Button onClick={fetchCars} disabled={loading}>
          {loading ? 'Loading...' : 'Show 20 Cars'}
        </Button>

        <Button onClick={fetchAllCars} disabled={loading}>
          {loading ? 'Loading...' : 'Show All Cars'}
        </Button>

        <Button
          onClick={deleteLegacyCars}
          disabled={loading}
          style={{ background: '#e53e3e' }}
        >
          {loading ? 'Deleting...' : 'Delete Legacy Cars (Non-Numeric)'}
        </Button>

        {stats && (
          <Stats>
            <StatCard>
              <h3>{stats.total}</h3>
              <p>Total Cars</p>
            </StatCard>
            <StatCard>
              <h3>{stats.withUnifiedLocation}</h3>
              <p>Unified Structure ✅</p>
            </StatCard>
            <StatCard>
              <h3>{stats.withOldCity}</h3>
              <p>Old Structure ⚠️</p>
            </StatCard>
            <StatCard>
              <h3>{stats.withoutCity}</h3>
              <p>No City ❌</p>
            </StatCard>
          </Stats>
        )}

        {stats && stats.cityBreakdown && (
          <div style={{ marginTop: '2rem' }}>
            <h2>Cars Distribution by City:</h2>
            <CodeBlock>
              {JSON.stringify(stats.cityBreakdown, null, 2)}
            </CodeBlock>
          </div>
        )}

        {cars.length > 0 && (
          <CarsList>
            <h2>Cars ({cars.length}):</h2>
            {cars.map((car: any) => (
              <CarItem key={car.id}>
                <h3>{car.make} {car.model} ({car.year || 'N/A'})</h3>
                <p><strong>ID:</strong> {car.id}</p>

                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    📍 Location Data (click to view)
                  </summary>
                  <CodeBlock>
                    {JSON.stringify({
                      'location (unified)': car.location || null,
                      'city (old)': car.city || null,
                      'region (old)': car.region || null
                    }, null, 2)}
                  </CodeBlock>
                </details>

                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    📄 Full Data
                  </summary>
                  <CodeBlock>
                    {JSON.stringify(car, null, 2)}
                  </CodeBlock>
                </details>
              </CarItem>
            ))}
          </CarsList>
        )}
      </ContentCard>
    </PageContainer>
  );
};

export default DebugCarsPage;

