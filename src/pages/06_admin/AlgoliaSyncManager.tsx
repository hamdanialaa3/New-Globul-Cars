import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Zap, RefreshCw, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';

/**
 * Algolia Sync Manager - Admin Tool
 * Algolia Sync Manager - Admin Tool
 * 
 * Features:
 * - Bulk sync all 7 collections to Algolia
 * - Clear all Algolia indices
 * - Real-time sync status monitoring
 * - Detailed sync statistics
 */

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: #8b5cf6;
    }
  }
  
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }
        `;
      case 'secondary':
        return `
          background: #6b7280;
          color: white;
          &:hover:not(:disabled) {
            background: #4b5563;
            transform: translateY(-2px);
          }
        `;
      default: // primary
        return `
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatusCard = styled.div<{ $type: 'success' | 'error' | 'info' | 'warning' }>`
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  ${({ $type }) => {
    switch ($type) {
      case 'success':
        return `
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1));
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #16a34a;
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #d97706;
        `;
      default: // info
        return `
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #2563eb;
        `;
    }
  }}
  
  svg {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
  }
`;

const StatusContent = styled.div`
  flex: 1;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.9;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.tertiary};
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  
  h4 {
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  p {
    font-size: 1.75rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
`;

const CollectionsList = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CollectionItem = styled.div<{ $status?: 'synced' | 'pending' | 'skipped' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  
  .collection-name {
    font-weight: 600;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  .collection-stats {
    display: flex;
    gap: 1.5rem;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    
    span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }
  
  ${({ $status }) => {
    switch ($status) {
      case 'synced':
        return `border-left: 4px solid #22c55e;`;
      case 'skipped':
        return `border-left: 4px solid #f59e0b;`;
      default:
        return `border-left: 4px solid #6b7280;`;
    }
  }}
`;

interface SyncResult {
  success: boolean;
  results?: {
    [key: string]: {
      total: number;
      synced: number;
      skipped: number;
    };
  };
  summary?: {
    totalDocuments: number;
    totalSynced: number;
    coverage: string;
  };
  message?: string;
}

const AlgoliaSyncManager: React.FC = () => {
  const { language } = useLanguage();
  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const collections = [
    { id: 'cars', nameEn: 'Cars (Legacy)', nameBg: 'Автомобили (Стари)' },
    { id: 'passenger_cars', nameEn: 'Passenger Cars', nameBg: 'Леки автомобили' },
    { id: 'suvs', nameEn: 'SUVs', nameBg: 'Джипове' },
    { id: 'vans', nameEn: 'Vans', nameBg: 'Бусове' },
    { id: 'motorcycles', nameEn: 'Motorcycles', nameBg: 'Мотоциклети' },
    { id: 'trucks', nameEn: 'Trucks', nameBg: 'Камиони' },
    { id: 'buses', nameEn: 'Buses', nameBg: 'Автобуси' }
  ];

  const handleBulkSync = async () => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      logger.info('🚀 Starting bulk sync to Algolia...');
      
      const functions = getFunctions();
      const bulkSyncFunction = httpsCallable<any, SyncResult>(
        functions,
        'bulkSyncAllCollectionsToAlgolia'
      );

      const result = await bulkSyncFunction();
      
      logger.info('✅ Bulk sync completed:', result.data as Record<string, unknown>);
      setSyncResult(result.data);
    } catch (err: any) {
      logger.error('❌ Bulk sync failed:', err);
      setError(err.message || 'An error occurred during sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearIndices = async () => {
    if (!window.confirm('⚠️ Are you sure? This will delete all data from Algolia!')) {
      return;
    }

    setClearing(true);
    setError(null);
    setSyncResult(null);

    try {
      logger.info('🗑️ Clearing all Algolia indices...');
      
      const functions = getFunctions();
      const clearFunction = httpsCallable(functions, 'clearAllAlgoliaIndices');

      const result = await clearFunction();
      
      logger.info('All indices cleared:', { data: result.data as unknown });
      toast.success('All indices cleared successfully');
    } catch (err: any) {
      logger.error('❌ Clear failed:', err);
      setError(err.message || 'An error occurred during clearing');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Container>
      <Header>
        <h1>
          <Zap />
          {language === 'bg' ? 'Мениджър на Algolia' : 'Algolia Sync Manager'}
        </h1>
        <p>
          {language === 'bg'
            ? 'Синхронизирайте всичките 7 колекции с Algolia за пълно покритие на търсенето.'
            : 'Sync all 7 collections to Algolia for complete search coverage.'}
        </p>
      </Header>

      {/* Collections Overview */}
      <Card>
        <CardHeader>
          <h2>{language === 'bg' ? 'Колекции' : 'Collections'}</h2>
          <p>
            {language === 'bg'
              ? '7 колекции за синхронизиране'
              : '7 collections to synchronize'}
          </p>
        </CardHeader>
        <CollectionsList>
          {collections.map((col) => (
            <CollectionItem
              key={col.id}
              $status={syncResult?.results?.[col.id] ? 'synced' : 'pending'}
            >
              <div className="collection-name">
                {language === 'bg' ? col.nameBg : col.nameEn}
              </div>
              {syncResult?.results?.[col.id] && (
                <div className="collection-stats">
                  <span>
                    📊 Total: <strong>{syncResult.results[col.id].total}</strong>
                  </span>
                  <span>
                    ✅ Synced: <strong>{syncResult.results[col.id].synced}</strong>
                  </span>
                  <span>
                    ⏭️ Skipped: <strong>{syncResult.results[col.id].skipped}</strong>
                  </span>
                </div>
              )}
            </CollectionItem>
          ))}
        </CollectionsList>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <h2>{language === 'bg' ? 'Действия' : 'Actions'}</h2>
          <p>
            {language === 'bg'
              ? 'Управлявайте синхронизацията с Algolia'
              : 'Manage Algolia synchronization'}
          </p>
        </CardHeader>
        <ButtonGroup>
          <Button onClick={handleBulkSync} disabled={syncing || clearing}>
            {syncing ? (
              <>
                <Loader className="animate-spin" />
                {language === 'bg' ? 'Синхронизиране...' : 'Syncing...'}
              </>
            ) : (
              <>
                <RefreshCw />
                {language === 'bg' ? 'Пълна синхронизация' : 'Bulk Sync All'}
              </>
            )}
          </Button>
          <Button
            $variant="danger"
            onClick={handleClearIndices}
            disabled={syncing || clearing}
          >
            {clearing ? (
              <>
                <Loader className="animate-spin" />
                {language === 'bg' ? 'Изтриване...' : 'Clearing...'}
              </>
            ) : (
              <>
                <Trash2 />
                {language === 'bg' ? 'Изтриване на всички индекси' : 'Clear All Indices'}
              </>
            )}
          </Button>
        </ButtonGroup>
      </Card>

      {/* Results */}
      {syncResult && (
        <Card>
          <StatusCard $type="success">
            <CheckCircle />
            <StatusContent>
              <h3>{language === 'bg' ? '✅ Синхронизацията завършена!' : '✅ Sync Completed!'}</h3>
              <p>
                {language === 'bg'
                  ? `Синхронизирани ${syncResult.summary?.totalSynced} от ${syncResult.summary?.totalDocuments} документа (${syncResult.summary?.coverage})`
                  : `Synced ${syncResult.summary?.totalSynced} out of ${syncResult.summary?.totalDocuments} documents (${syncResult.summary?.coverage})`}
              </p>
            </StatusContent>
          </StatusCard>

          <StatsGrid>
            <StatCard>
              <h4>{language === 'bg' ? 'Общо документи' : 'Total Documents'}</h4>
              <p>{syncResult.summary?.totalDocuments || 0}</p>
            </StatCard>
            <StatCard>
              <h4>{language === 'bg' ? 'Синхронизирани' : 'Synced'}</h4>
              <p>{syncResult.summary?.totalSynced || 0}</p>
            </StatCard>
            <StatCard>
              <h4>{language === 'bg' ? 'Покритие' : 'Coverage'}</h4>
              <p>{syncResult.summary?.coverage || '0%'}</p>
            </StatCard>
          </StatsGrid>
        </Card>
      )}

      {/* Error */}
      {error && (
        <StatusCard $type="error">
          <AlertCircle />
          <StatusContent>
            <h3>{language === 'bg' ? '❌ Грешка' : '❌ Error'}</h3>
            <p>{error}</p>
          </StatusContent>
        </StatusCard>
      )}

      {/* Info */}
      {!syncResult && !error && (
        <StatusCard $type="info">
          <AlertCircle />
          <StatusContent>
            <h3>{language === 'bg' ? 'ℹ️ Информация' : 'ℹ️ Information'}</h3>
            <p>
              {language === 'bg'
                ? 'Пълната синхронизация може да отнеме 2-5 минути. Моля, изчакайте.'
                : 'Bulk sync may take 2-5 minutes. Please wait.'}
            </p>
          </StatusContent>
        </StatusCard>
      )}
    </Container>
  );
};

export default AlgoliaSyncManager;

