import { logger } from '../../services/logger-service';
import { toast } from 'react-toastify';
import React, { useEffect, useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';

interface Backup {
  name: string;
  timestamp: string;
  path: string;
}

export const BackupManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const functions = getFunctions();
      const listBackupsFunc = httpsCallable(functions, 'listBackups');
      
      const result = await listBackupsFunc({ limit: 20 });
      const data = result.data as { backups: Backup[] };
      
      setBackups(data.backups);
      setError(null);
    } catch (err: any) {
      logger.error('Failed to load backups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (collectionIds?: string[]) => {
    if (!window.confirm('Create a new backup? This may take several minutes.')) {
      return;
    }

    try {
      setCreating(true);
      const functions = getFunctions();
      const manualBackupFunc = httpsCallable(functions, 'manualBackup');
      
      const result = await manualBackupFunc({ collectionIds });
      
      toast.success(language === 'bg'
        ? 'Бакъпът е стартиран успешно! Проверете след няколко минути.'
        : 'Backup started successfully! Check back in a few minutes.');
      
      // Reload backups after 2 minutes
      setTimeout(loadBackups, 2 * 60 * 1000);
    } catch (err: any) {
      logger.error('Failed to create backup:', err);
      toast.error(language === 'bg'
        ? 'Неуспешно създаване на бакъп: ' + err.message
        : 'Failed to create backup: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const restoreFromBackup = async (backup: Backup) => {
    const confirmationText = prompt(
      '⚠️ WARNING: This will OVERWRITE all data!\n\n' +
      'Type exactly: "I UNDERSTAND THIS WILL OVERWRITE DATA"'
    );

    if (!confirmationText) {
      return;
    }

    try {
      setRestoring(true);
      const functions = getFunctions();
      const restoreBackupFunc = httpsCallable(functions, 'restoreBackup');
      
      const result = await restoreBackupFunc({
        inputUriPrefix: backup.path,
        confirmationText,
      });
      
      toast.success(language === 'bg'
        ? 'Възстановяването е стартирано успешно! Може да отнеме 10-30 минути.'
        : 'Restore started successfully! This may take 10-30 minutes.');
    } catch (err: any) {
      logger.error('Failed to restore backup:', err);
      toast.error(language === 'bg'
        ? 'Неуспешно възстановяване на бакъп: ' + err.message
        : 'Failed to restore backup: ' + err.message);
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return <Container><LoadingMessage>Loading backups...</LoadingMessage></Container>;
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={loadBackups}>Retry</RetryButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>💾 Backup Management</Title>
        <Actions>
          <CreateButton onClick={() => createBackup()} disabled={creating}>
            {creating ? '⏳ Creating...' : '+ Create Backup'}
          </CreateButton>
          <RefreshButton onClick={loadBackups}>
            🔄 Refresh
          </RefreshButton>
        </Actions>
      </Header>

      <InfoBox>
        <InfoTitle>ℹ️ Backup Information</InfoTitle>
        <InfoText>
          • Automated daily backups at 3:00 AM<br />
          • Retention: 90 days (auto-deleted after)<br />
          • Location: Cloud Storage bucket<br />
          • Restore time: 10-30 minutes
        </InfoText>
      </InfoBox>

      <BackupsList>
        <SectionTitle>Available Backups ({backups.length})</SectionTitle>
        
        {backups.length === 0 ? (
          <NoBackups>
            No backups found. Create your first backup!
          </NoBackups>
        ) : (
          backups.map((backup, index) => (
            <BackupCard key={backup.name}>
              <BackupInfo>
                <BackupName>{backup.name}</BackupName>
                <BackupDate>
                  📅 {new Date(backup.timestamp.replace(/-/g, ':').replace('T', ' ')).toLocaleString('bg-BG')}
                </BackupDate>
                <BackupPath>📂 {backup.path}</BackupPath>
              </BackupInfo>
              <BackupActions>
                <RestoreButton
                  onClick={() => restoreFromBackup(backup)}
                  disabled={restoring}
                >
                  {restoring ? '⏳ Restoring...' : '🔄 Restore'}
                </RestoreButton>
              </BackupActions>
            </BackupCard>
          ))
        )}
      </BackupsList>

      <Warning>
        <WarningTitle>⚠️ Important Notes</WarningTitle>
        <WarningText>
          • <strong>Restore operations OVERWRITE all data</strong><br />
          • Always create a fresh backup before restoring<br />
          • Restore process takes 10-30 minutes<br />
          • Database will be READ-ONLY during restore<br />
          • Contact support if you need assistance
        </WarningText>
      </Warning>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const CreateButton = styled.button`
  padding: 10px 20px;
  background: #4CAF50;
  color: var(--admin-text-primary);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  
  &:hover:not(:disabled) {
    background: #45A049;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background: #3B82F6;
  color: var(--admin-text-primary);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #E67E00;
  }
`;

const InfoBox = styled.div`
  background: #E3F2FD;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  border-left: 4px solid #2196F3;
`;

const InfoTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #1976D2;
`;

const InfoText = styled.div`
  color: #555;
  line-height: 1.8;
`;

const BackupsList = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
`;

const NoBackups = styled.div`
  text-align: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 10px;
  color: #666;
`;

const BackupCard = styled.div`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    border-color: #3B82F6;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const BackupInfo = styled.div`
  flex: 1;
`;

const BackupName = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const BackupDate = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const BackupPath = styled.div`
  font-size: 12px;
  color: #999;
  font-family: monospace;
`;

const BackupActions = styled.div`
  display: flex;
  gap: 10px;
`;

const RestoreButton = styled.button`
  padding: 10px 20px;
  background: #8B5CF6;
  color: var(--admin-text-primary);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  
  &:hover:not(:disabled) {
    background: #E64A19;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Warning = styled.div`
  background: #FFF3E0;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #FF9800;
`;

const WarningTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #F57C00;
`;

const WarningText = styled.div`
  color: #555;
  line-height: 1.8;
  
  strong {
    color: #2563EB;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #F44336;
  padding: 20px;
  background: #FFEBEE;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: #3B82F6;
  color: var(--admin-text-primary);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  display: block;
  margin: 0 auto;
  
  &:hover {
    background: #E67E00;
  }
`;

export default BackupManagement;

