// AlgoliaAdminPanel.tsx
// Admin panel for Algolia operations

import React, { useState } from 'react';
import styled from 'styled-components';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../contexts/AuthProvider';
import { Database, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { serviceLogger } from '../../services/logger-wrapper';

const Panel = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #FF8F10;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const ActionCard = styled.div`
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #FF8F10;
    box-shadow: var(--shadow-md);
  }
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  svg {
    width: 24px;
    height: 24px;
    color: #FF8F10;
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
`;

const ActionDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  background: ${p => p.$variant === 'danger' 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #FF8F10 0%, #fb923c 100%)'
  };
  color: white;
  box-shadow: ${p => p.$variant === 'danger'
    ? '0 4px 15px rgba(239, 68, 68, 0.3)'
    : '0 4px 15px rgba(255, 143, 16, 0.3)'
  };

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.$variant === 'danger'
      ? '0 6px 20px rgba(239, 68, 68, 0.4)'
      : '0 6px 20px rgba(255, 143, 16, 0.4)'
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;

  background: ${p => {
    if (p.$type === 'success') return 'rgba(16, 185, 129, 0.1)';
    if (p.$type === 'error') return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(59, 130, 246, 0.1)';
  }};

  border: 2px solid ${p => {
    if (p.$type === 'success') return '#10b981';
    if (p.$type === 'error') return '#ef4444';
    return '#3b82f6';
  }};

  color: ${p => {
    if (p.$type === 'success') return '#10b981';
    if (p.$type === 'error') return '#ef4444';
    return '#3b82f6';
  }};

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
`;

const AlgoliaAdminPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const functions = getFunctions();

  const handleSyncAll = async () => {
    if (!currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in' });
      return;
    }

    if (!window.confirm('Are you sure you want to sync all cars to Algolia? This may take a few minutes.')) {
      return;
    }

    setSyncing(true);
    setMessage({ type: 'info', text: 'Syncing... This may take a few minutes.' });

    try {
      const syncAll = httpsCallable(functions, 'syncAllCarsToAlgolia');
      const result = await syncAll();
      const data = result.data as any;

      setMessage({ 
        type: 'success', 
        text: `✅ ${data.message || 'Sync completed'} (${data.count} cars)` 
      });
    } catch (error: unknown) {
      serviceLogger.error('Sync error', error as Error);
      setMessage({ 
        type: 'error', 
        text: `❌ Sync failed: ${error.message}` 
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleClearIndex = async () => {
    if (!currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in' });
      return;
    }

    if (!window.confirm('⚠️ WARNING: This will delete ALL data from Algolia index. Are you absolutely sure?')) {
      return;
    }

    setClearing(true);
    setMessage({ type: 'info', text: 'Clearing index...' });

    try {
      const clearIndex = httpsCallable(functions, 'clearAlgoliaIndex');
      const result = await clearIndex();
      const data = result.data as any;

      setMessage({ 
        type: 'success', 
        text: data.message || 'Index cleared successfully' 
      });
    } catch (error: unknown) {
      serviceLogger.error('Clear error', error as Error);
      setMessage({ 
        type: 'error', 
        text: `Failed to clear: ${error.message}` 
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Panel>
      <Title>
        <Database />
        Algolia Admin Panel
      </Title>
      <Subtitle>
        Manage Algolia search index synchronization
      </Subtitle>

      <ActionCard>
        <ActionHeader>
          <RefreshCw />
          <h3>Sync All Cars</h3>
        </ActionHeader>
        <ActionDescription>
          Synchronize all active cars from Firestore to Algolia. 
          This will update the search index with the latest data.
          Use this for initial setup or when data gets out of sync.
        </ActionDescription>
        <Button onClick={handleSyncAll} disabled={syncing}>
          <RefreshCw className={syncing ? 'spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync All Cars'}
        </Button>
      </ActionCard>

      <ActionCard>
        <ActionHeader>
          <Trash2 />
          <h3>Clear Index</h3>
        </ActionHeader>
        <ActionDescription>
          ⚠️ WARNING: This will delete ALL data from the Algolia index.
          Use this only when you need to reset the search index completely.
          You'll need to sync again after clearing.
        </ActionDescription>
        <Button $variant="danger" onClick={handleClearIndex} disabled={clearing}>
          <Trash2 />
          {clearing ? 'Clearing...' : 'Clear Index'}
        </Button>
      </ActionCard>

      {message && (
        <StatusMessage $type={message.type}>
          {message.type === 'success' && <CheckCircle />}
          {message.type === 'error' && <AlertCircle />}
          {message.type === 'info' && <RefreshCw className="spin" />}
          {message.text}
        </StatusMessage>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Panel>
  );
};

export default AlgoliaAdminPanel;

