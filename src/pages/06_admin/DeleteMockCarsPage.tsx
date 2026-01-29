/**
 * Delete Mock Cars Admin Page
 * صفحة إدارة حذف السيارات الوهمية
 * 
 * Purpose: Delete all mock/fake cars and keep only real user-added cars
 * 
 * @see PROJECT_CONSTITUTION.md - Section 4.2 Multi-collection Pattern
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { db } from '@/firebase/firebase-config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { logger } from '@/services/logger-service';
import { VEHICLE_COLLECTIONS } from '@/services/search/multi-collection-helper';
import { Trash2, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 160px);
  position: relative;
  z-index: 1;
  width: 100%;
  overflow: visible;
  background: transparent;
  
  /* Spinner animation */
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    min-height: calc(100vh - 120px);
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const WarningBox = styled.div`
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const WarningIcon = styled(AlertTriangle)`
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 0.25rem;
`;

const WarningText = styled.div`
  flex: 1;
`;

const WarningTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 0.5rem;
`;

const WarningDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary'; $loading?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$loading ? 0.6 : 1};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }
      `;
    }
    if (props.$variant === 'primary') {
      return `
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
      `;
    }
    return `
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      
      &:hover:not(:disabled) {
        background: var(--bg-tertiary);
      }
    `;
  }}

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const ResultsContainer = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const ResultsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ResultItem = styled.li`
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const ResultCollection = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const ResultCount = styled.span`
  color: var(--text-secondary);
`;

/**
 * Determine if a car is mock/fake
 */
function isMockCar(carData: any, carId: string): boolean {
  // Pattern 1: Check if sellerId is missing or invalid
  if (!carData.sellerId || typeof carData.sellerId !== 'string' || carData.sellerId.trim() === '') {
    return true;
  }

  // Pattern 2: Check for mock/test patterns in ID
  const mockPatterns = [
    /^car_real_\d+$/,           // car_real_001, car_real_002, etc.
    /^mock_/,                    // mock_*
    /^test_/,                    // test_*
    /^fake_/,                    // fake_*
    /^seed_/,                    // seed_*
    /^sample_/,                  // sample_*
    /^demo_/,                    // demo_*
    /_mock$/i,                   // *_mock
    /_test$/i,                   // *_test
    /_fake$/i,                   // *_fake
  ];

  if (mockPatterns.some(pattern => pattern.test(carId))) {
    return true;
  }

  // Pattern 3: Check for mock/test patterns in sellerId
  if (mockPatterns.some(pattern => pattern.test(carData.sellerId))) {
    return true;
  }

  // Pattern 4: Check if sellerId starts with 'user_real_' (from real-data-initializer)
  if (carData.sellerId.startsWith('user_real_')) {
    return true;
  }

  // Pattern 5: Check if missing numeric IDs (might be old mock data)
  // But keep if sellerId looks like a real Firebase UID (long random string)
  const firebaseUidPattern = /^[a-zA-Z0-9]{28}$/; // Firebase UIDs are typically 28 characters
  if (!carData.sellerNumericId && !firebaseUidPattern.test(carData.sellerId)) {
    return true;
  }

  // Pattern 6: Check if sellerId is from known test users
  const testUserIds = [
    'test-user',
    'test-user-123',
    'mock-user',
    'fake-user',
  ];

  if (testUserIds.includes(carData.sellerId)) {
    return true;
  }

  // If none of the patterns match, assume it's a real car
  return false;
}

const DeleteMockCarsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState<{
    totalCars: number;
    realCars: number;
    mockCars: number;
    byCollection: Record<string, { total: number; real: number; mock: number }>;
  } | null>(null);
  const [results, setResults] = useState<{
    deleted: number;
    kept: number;
    byCollection: Record<string, number>;
  } | null>(null);

  // Analyze cars
  const analyzeCars = async () => {
    setAnalyzing(true);
    setStats(null);
    setResults(null);

    try {
      logger.info('🔍 Analyzing cars...');

      const statsData: typeof stats = {
        totalCars: 0,
        realCars: 0,
        mockCars: 0,
        byCollection: {}
      };

      for (const collectionName of VEHICLE_COLLECTIONS) {
        statsData.byCollection[collectionName] = { total: 0, real: 0, mock: 0 };

        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);

          statsData.byCollection[collectionName].total = snapshot.size;
          statsData.totalCars += snapshot.size;

          snapshot.docs.forEach((carDoc) => {
            const carData = carDoc.data();
            const carId = carDoc.id;

            if (isMockCar(carData, carId)) {
              statsData.byCollection[collectionName].mock++;
              statsData.mockCars++;
            } else {
              statsData.byCollection[collectionName].real++;
              statsData.realCars++;
            }
          });

          logger.info(`📋 ${collectionName}: ${snapshot.size} total, ${statsData.byCollection[collectionName].real} real, ${statsData.byCollection[collectionName].mock} mock`);
        } catch (error) {
          logger.error(`Error analyzing ${collectionName}`, error as Error);
        }
      }

      setStats(statsData);
      logger.info(`✅ Analysis complete: ${statsData.totalCars} total, ${statsData.realCars} real, ${statsData.mockCars} mock`);
    } catch (error) {
      logger.error('Error analyzing cars', error as Error);
      alert('Error analyzing cars. Check console.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Delete mock cars
  const deleteMockCars = async () => {
    if (!stats || stats.mockCars === 0) {
      alert('No mock cars to delete. Please analyze first.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete ${stats.mockCars} mock cars!\n\n` +
      `Real cars to keep: ${stats.realCars}\n` +
      `Mock cars to delete: ${stats.mockCars}\n\n` +
      `This action cannot be undone. Are you sure?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      logger.info('🗑️ Starting deletion of mock cars...');

      const resultsData: typeof results = {
        deleted: 0,
        kept: 0,
        byCollection: {}
      };

      for (const collectionName of VEHICLE_COLLECTIONS) {
        resultsData.byCollection[collectionName] = 0;

        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);

          const deletePromises: Promise<void>[] = [];

          snapshot.docs.forEach((carDoc) => {
            const carData = carDoc.data();
            const carId = carDoc.id;

            if (isMockCar(carData, carId)) {
              const deletePromise = deleteDoc(doc(db, collectionName, carId))
                .then(() => {
                  resultsData.byCollection[collectionName]++;
                  resultsData.deleted++;
                  logger.debug(`🗑️  Deleted mock car: ${carId} from ${collectionName}`);
                })
                .catch((error) => {
                  logger.error(`Error deleting car ${carId} from ${collectionName}`, error as Error);
                });

              deletePromises.push(deletePromise);
            } else {
              resultsData.kept++;
            }
          });

          await Promise.all(deletePromises);
          logger.info(`✅ Deleted ${resultsData.byCollection[collectionName]} mock cars from ${collectionName}`);
        } catch (error) {
          logger.error(`Error processing ${collectionName}`, error as Error);
        }
      }

      setResults(resultsData);
      logger.info(`✅ Deletion complete: ${resultsData.deleted} deleted, ${resultsData.kept} kept`);

      // Refresh stats
      await analyzeCars();
    } catch (error) {
      logger.error('Error deleting mock cars', error as Error);
      alert('Error deleting mock cars. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Delete Mock Cars</Title>
        <Subtitle>Delete all mock/fake cars and keep only real user-added cars</Subtitle>
      </Header>

      <WarningBox>
        <WarningIcon size={24} />
        <WarningText>
          <WarningTitle>⚠️ Warning: Irreversible Action</WarningTitle>
          <WarningDescription>
            This operation will permanently delete all mock/test cars from all vehicle collections.
            Only real user-added cars will be kept. This action cannot be undone. Please analyze first to see what will be deleted.
          </WarningDescription>
        </WarningText>
      </WarningBox>

      <ButtonGroup>
        <Button
          $variant="primary"
          onClick={analyzeCars}
          disabled={analyzing || loading}
          $loading={analyzing}
        >
          {analyzing ? <Loader size={16} className="spinner" /> : <CheckCircle size={16} />}
          {analyzing ? 'Analyzing...' : 'Analyze Cars'}
        </Button>

        <Button
          $variant="danger"
          onClick={deleteMockCars}
          disabled={!stats || stats.mockCars === 0 || loading}
          $loading={loading}
        >
          {loading ? <Loader size={16} className="spinner" /> : <Trash2 size={16} />}
          {loading ? 'Deleting...' : `Delete ${stats?.mockCars || 0} Mock Cars`}
        </Button>
      </ButtonGroup>

      {stats && (
        <StatsContainer>
          <StatCard>
            <StatValue>{stats.totalCars}</StatValue>
            <StatLabel>Total Cars</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue style={{ color: '#10b981' }}>{stats.realCars}</StatValue>
            <StatLabel>Real Cars (to keep)</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue style={{ color: '#ef4444' }}>{stats.mockCars}</StatValue>
            <StatLabel>Mock Cars (to delete)</StatLabel>
          </StatCard>
        </StatsContainer>
      )}

      {stats && (
        <ResultsContainer>
          <ResultsTitle>Analysis Results by Collection</ResultsTitle>
          <ResultsList>
            {Object.entries(stats.byCollection).map(([collectionName, data]) => (
              <ResultItem key={collectionName}>
                <ResultCollection>{collectionName}</ResultCollection>
                <ResultCount>
                  Total: {data.total} | Real: <span style={{ color: '#10b981' }}>{data.real}</span> | 
                  Mock: <span style={{ color: '#ef4444' }}>{data.mock}</span>
                </ResultCount>
              </ResultItem>
            ))}
          </ResultsList>
        </ResultsContainer>
      )}

      {results && (
        <ResultsContainer>
          <ResultsTitle>
            <CheckCircle size={20} style={{ color: '#10b981' }} />
            Deletion Complete
          </ResultsTitle>
          <ResultsList>
            <ResultItem>
              <ResultCollection>Total Deleted</ResultCollection>
              <ResultCount style={{ color: '#ef4444', fontWeight: 600 }}>{results.deleted}</ResultCount>
            </ResultItem>
            <ResultItem>
              <ResultCollection>Total Kept</ResultCollection>
              <ResultCount style={{ color: '#10b981', fontWeight: 600 }}>{results.kept}</ResultCount>
            </ResultItem>
            {Object.entries(results.byCollection).map(([collectionName, count]) => (
              count > 0 && (
                <ResultItem key={collectionName}>
                  <ResultCollection>{collectionName}</ResultCollection>
                  <ResultCount>{count} deleted</ResultCount>
                </ResultItem>
              )
            ))}
          </ResultsList>
        </ResultsContainer>
      )}
    </PageContainer>
  );
};

export default DeleteMockCarsPage;
