import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Database,
  Download,
  Upload,
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Archive,
  FileJson,
  Calendar,
  Loader
} from 'lucide-react';

const Container = styled.div`
  background: #0f1419;
  border-radius: 12px;
  border: 1px solid #1e2432;
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #8B5CF6;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ActionCard = styled.div<{ $variant?: 'primary' | 'success' | 'warning' }>`
  background: #1a1f2e;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid ${props => {
    if (props.$variant === 'success') return '#065f46';
    if (props.$variant === 'warning') return '#92400e';
    return '#374151';
  }};
  transition: all 0.2s;

  &:hover {
    border-color: ${props => {
      if (props.$variant === 'success') return '#10b981';
      if (props.$variant === 'warning') return '#f59e0b';
      return '#8B5CF6';
    }};
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div<{ $variant?: 'primary' | 'success' | 'warning' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: ${props => {
    if (props.$variant === 'success') return '#064e3b';
    if (props.$variant === 'warning') return '#78350f';
    return '#374151';
  }};
  color: ${props => {
    if (props.$variant === 'success') return '#6ee7b7';
    if (props.$variant === 'warning') return '#fcd34d';
    return '#8B5CF6';
  }};
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 8px 0;
`;

const CardDescription = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #7f1d1d;
        color: #fca5a5;
        &:hover {
          background: #991b1b;
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return `
        background: #374151;
        color: #e5e7eb;
        &:hover {
          background: #4b5563;
        }
      `;
    }
    return `
      background: #8B5CF6;
      color: #0f1419;
      &:hover {
        background: #ff7a47;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BackupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BackupItem = styled.div`
  background: #1a1f2e;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackupInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BackupName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BackupMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
`;

const BackupActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ $variant?: 'danger' }>`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  
  ${props => props.$variant === 'danger' ? `
    background: #7f1d1d;
    color: #fca5a5;
    &:hover {
      background: #991b1b;
    }
  ` : `
    background: #374151;
    color: #e5e7eb;
    &:hover {
      background: #4b5563;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    if (props.$type === 'success') {
      return `
        background: #064e3b;
        color: #6ee7b7;
        border: 1px solid #047857;
      `;
    }
    if (props.$type === 'error') {
      return `
        background: #7f1d1d;
        color: #fca5a5;
        border: 1px solid #b91c1c;
      `;
    }
    return `
      background: #1e3a8a;
      color: #93c5fd;
      border: 1px solid #2563eb;
    `;
  }}
`;

const StatCard = styled.div`
  background: #1a1f2e;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #374151;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B5CF6;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #e5e7eb;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

interface Backup {
  id: string;
  name: string;
  date: string;
  size: string;
  collections: number;
  status: 'completed' | 'failed' | 'in-progress';
}

const BackupRestoreManager: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      name: 'backup_2026-02-07_14-30',
      date: '2026-02-07 14:30',
      size: '45.2 MB',
      collections: 12,
      status: 'completed'
    },
    {
      id: '2',
      name: 'backup_2026-02-06_10-15',
      date: '2026-02-06 10:15',
      size: '42.8 MB',
      collections: 12,
      status: 'completed'
    },
    {
      id: '3',
      name: 'backup_2026-02-05_18-00',
      date: '2026-02-05 18:00',
      size: '40.1 MB',
      collections: 12,
      status: 'completed'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    showMessage('info', '⏳ Creating backup...');

    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newBackup: Backup = {
      id: Date.now().toString(),
      name: `backup_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}`,
      date: new Date().toLocaleString('ar-SA'),
      size: '46.5 MB',
      collections: 12,
      status: 'completed'
    };

    setBackups(prev => [newBackup, ...prev]);
    setLoading(false);
    showMessage('success', '✅ Backup created successfully');
  };

  const handleRestoreBackup = async (backup: Backup) => {
    if (!window.confirm(`⚠️ Are you sure you want to restore backup: ${backup.name}?\n\nAll current data will be replaced!`)) {
      return;
    }

    setLoading(true);
    showMessage('info', '⏳ Restoring data...');

    // Simulate restore
    await new Promise(resolve => setTimeout(resolve, 4000));

    setLoading(false);
    showMessage('success', '✅ Data restored successfully');
  };

  const handleDownloadBackup = (backup: Backup) => {
    showMessage('info', `📥 Downloading: ${backup.name}`);
    // Simulate download
    setTimeout(() => {
      showMessage('success', '✅ Downloaded successfully');
    }, 1500);
  };

  const handleDeleteBackup = (id: string) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this backup?')) {
      return;
    }

    setBackups(prev => prev.filter(b => b.id !== id));
    showMessage('success', '✅ Backup deleted');
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.zip';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setLoading(true);
        showMessage('info', `⏳ Importing: ${file.name}`);
        
        // Simulate import
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setLoading(false);
        showMessage('success', '✅ Imported successfully');
      }
    };
    input.click();
  };

  const handleScheduleBackup = () => {
    showMessage('info', '⏰ Enabling automatic backup...');
    setTimeout(() => {
      showMessage('success', '✅ Daily backup enabled - at 2:00 AM');
    }, 1500);
  };

  return (
    <Container>
      <Header>
        <Title>
          <Database size={24} />
          Backup & Restore Management
        </Title>
        <Subtitle>
          Create, restore, and manage data backups
        </Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' && <CheckCircle size={16} />}
          {message.type === 'error' && <AlertCircle size={16} />}
          {message.type === 'info' && <Loader size={16} className="spin" />}
          {message.text}
        </Message>
      )}

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <Archive size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{backups.length}</StatValue>
            <StatLabel>Backups</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon>
            <HardDrive size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>128.1 MB</StatValue>
            <StatLabel>Used Space</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon>
            <Clock size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>Last Backup</StatValue>
            <StatLabel>2 days ago</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ActionGrid>
        <ActionCard $variant="primary">
          <CardIcon $variant="primary">
            <Download size={24} />
          </CardIcon>
          <CardTitle>Create New Backup</CardTitle>
          <CardDescription>
            Save all current platform data in a secure backup file
          </CardDescription>
          <Button onClick={handleCreateBackup} disabled={loading}>
            <Download size={16} />
            Create Backup
          </Button>
        </ActionCard>

        <ActionCard $variant="success">
          <CardIcon $variant="success">
            <Upload size={24} />
          </CardIcon>
          <CardTitle>Import Backup</CardTitle>
          <CardDescription>
            Import a backup from an external file
          </CardDescription>
          <Button onClick={handleImportBackup} disabled={loading}>
            <Upload size={16} />
            Import File
          </Button>
        </ActionCard>

        <ActionCard $variant="warning">
          <CardIcon $variant="warning">
            <Clock size={24} />
          </CardIcon>
          <CardTitle>Automatic Backup</CardTitle>
          <CardDescription>
            Schedule automatic daily backup
          </CardDescription>
          <Button $variant="secondary" onClick={handleScheduleBackup} disabled={loading}>
            <RefreshCw size={16} />
            Auto Schedule
          </Button>
        </ActionCard>
      </ActionGrid>

      <Section>
        <SectionTitle>
          <Archive size={20} />
          Saved Backups
        </SectionTitle>
        <BackupList>
          {backups.map(backup => (
            <BackupItem key={backup.id}>
              <BackupInfo>
                <BackupName>
                  <FileJson size={16} color="#6ee7b7" />
                  {backup.name}
                </BackupName>
                <BackupMeta>
                  <span>
                    <Calendar size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                    {backup.date}
                  </span>
                  <span>
                    <HardDrive size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                    {backup.size}
                  </span>
                  <span>
                    <Database size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                    {backup.collections} collections
                  </span>
                </BackupMeta>
              </BackupInfo>
              <BackupActions>
                <IconButton onClick={() => handleRestoreBackup(backup)} disabled={loading}>
                  <RefreshCw size={14} />
                  Restore
                </IconButton>
                <IconButton onClick={() => handleDownloadBackup(backup)} disabled={loading}>
                  <Download size={14} />
                  Download
                </IconButton>
                <IconButton $variant="danger" onClick={() => handleDeleteBackup(backup.id)} disabled={loading}>
                  <Trash2 size={14} />
                </IconButton>
              </BackupActions>
            </BackupItem>
          ))}
        </BackupList>
      </Section>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

export default BackupRestoreManager;

