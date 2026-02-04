import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Download, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { logger } from '../../../../../services/logger-service';

// 🎨 Styling Components
const DataSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-radius: 16px;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1.5rem;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;

  svg {
    width: 32px;
    height: 32px;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.6;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 143, 16, 0.1);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-primary);
    background: rgba(255, 143, 16, 0.05);
  }

  [data-theme="dark"] & {
    background: rgba(50, 50, 60, 0.3);
    border-color: rgba(255, 143, 16, 0.2);

    &:hover {
      background: rgba(255, 143, 16, 0.08);
      border-color: var(--accent-primary);
    }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const SectionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;

const DataItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DataItem = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.15);
  }

  [data-theme="dark"] & {
    background: rgba(50, 50, 60, 0.5);
  }
`;

const DataItemName = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DataItemSize = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const DataItemDate = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.35rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  button {
    flex: 1;
    min-width: 120px;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &.primary {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white;

      &:hover {
        box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &.secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-primary);

      &:hover {
        background: var(--bg-tertiary);
        border-color: var(--accent-primary);
      }
    }

    &.danger {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);

      &:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
      }
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ConfirmationContent = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.2s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const WarningIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  margin: 0 auto 1rem;

  svg {
    width: 32px;
    height: 32px;
  }
`;

const ConfirmTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const ConfirmDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 0.75rem;

  button {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &.confirm {
      background: #ef4444;
      color: white;

      &:hover {
        background: #dc2626;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }
    }

    &.cancel {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-primary);

      &:hover {
        background: var(--bg-tertiary);
      }
    }
  }
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #22c55e;
  font-weight: 600;
  animation: slideDown 0.3s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

interface DataExportItem {
  id: string;
  name: string;
  size: number;
  format: string;
  lastGenerated?: Date;
}

const DataSettingsEnhanced: React.FC = () => {
  const { language } = useLanguage();
  const [exportItems, setExportItems] = useState<DataExportItem[]>([
    {
      id: 'personal',
      name: 'بيانات شخصية',
      size: 0,
      format: 'JSON',
      lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'listings',
      name: 'الإعلانات',
      size: 0,
      format: 'JSON',
      lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'messages',
      name: 'الرسائل',
      size: 0,
      format: 'JSON',
      lastGenerated: undefined
    },
    {
      id: 'activity',
      name: 'السجل النشاط',
      size: 0,
      format: 'JSON',
      lastGenerated: new Date()
    }
  ]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const translations = {
    bg: {
      title: 'Данни и експорт',
      subtitle: 'Управляй своите лични данни, експортирай или изтрий всичко',
      exportData: 'Експортиране на данни',
      exportDescription: 'Изтегли копие на всичките си данни',
      deleteData: 'Изтриване на данни',
      deleteDescription: 'Безвъзратно изтрий своята сметка и всички данни',
      downloadBtn: 'Изтегляне',
      deleteBtn: 'Изтриване',
      refreshBtn: 'Обновяване',
      confirmDelete: 'Сигурен ли си?',
      confirmDeleteDesc: 'Това действие не може да бъде отменено. Ще се изтрият всички твои данни.',
      deleteAccount: 'Изтрий сметката',
      cancel: 'Отмяна',
      success: 'Данните са експортирани успешно!',
      lastGenerated: 'Генериран: ',
      googleAnalytics: 'Google Analytics',
      googleAnalyticsHelp: 'Прегледай и управляй данните за проследяване на посещенията и поведението',
      bigQueryExport: 'Експорт в BigQuery',
      bigQueryExportHelp: 'Експортирай разширени данни за анализ в Google BigQuery',
      connect: 'Свързване',
      configure: 'Конфигуриране',
      disconnect: 'Разединяване',
      export: 'Експортиране'
    },
    en: {
      title: 'Data & Export',
      subtitle: 'Manage your personal data, export or delete everything',
      exportData: 'Export Data',
      exportDescription: 'Download a copy of all your data',
      deleteData: 'Delete Data',
      deleteDescription: 'Permanently delete your account and all data',
      downloadBtn: 'Download',
      deleteBtn: 'Delete',
      refreshBtn: 'Refresh',
      confirmDelete: 'Are you sure?',
      confirmDeleteDesc: 'This action cannot be undone. All your data will be deleted.',
      deleteAccount: 'Delete Account',
      cancel: 'Cancel',
      success: 'Data exported successfully!',
      lastGenerated: 'Generated: ',
      googleAnalytics: 'Google Analytics',
      googleAnalyticsHelp: 'View and manage your website visit and behavior tracking data',
      bigQueryExport: 'BigQuery Export',
      bigQueryExportHelp: 'Export advanced analytics data to Google BigQuery for deeper analysis',
      connect: 'Connect',
      configure: 'Configure',
      disconnect: 'Disconnect',
      export: 'Export'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleDownload = async (itemId: string) => {
    try {
      logger.info(`Downloading ${itemId} data`);
      // TODO: Implement actual download logic
      setSuccessMessage(t.success);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      logger.error('Download failed', error);
    }
  };

  const handleDeleteConfirm = (itemId: string) => {
    setSelectedItem(itemId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      logger.info(`Deleting ${selectedItem} data`);
      // TODO: Implement actual delete logic
      setExportItems(prev => prev.filter(item => item.id !== selectedItem));
      setShowConfirm(false);
      setSelectedItem(null);
      setSuccessMessage('تم حذف البيانات بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      logger.error('Delete failed', error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return 'حساب الحجم...';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <DataSection>
      {successMessage && (
        <SuccessMessage>
          <CheckCircle2 />
          {successMessage}
        </SuccessMessage>
      )}

      <div>
        <Title>
          <Download />
          {t.title}
        </Title>
        <Subtitle>{t.subtitle}</Subtitle>
      </div>

      <Section>
        <SectionHeader>
          <SectionIcon>
            <Download />
          </SectionIcon>
          <div>
            <SectionTitle>{t.exportData}</SectionTitle>
            <SectionDescription>{t.exportDescription}</SectionDescription>
          </div>
        </SectionHeader>

        <DataItemsGrid>
          {exportItems.map(item => (
            <DataItem key={item.id}>
              <DataItemName>
                {item.name}
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>
                  {item.format}
                </span>
              </DataItemName>
              <DataItemSize>{formatSize(item.size)}</DataItemSize>
              {item.lastGenerated && (
                <DataItemDate>
                  <Clock />
                  {t.lastGenerated} {formatDate(item.lastGenerated)}
                </DataItemDate>
              )}
              <ActionButtons>
                <button className="primary" onClick={() => handleDownload(item.id)}>
                  <Download />
                  {t.downloadBtn}
                </button>
              </ActionButtons>
            </DataItem>
          ))}
        </DataItemsGrid>
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon style={{ background: 'rgba(66, 133, 244, 0.1)', color: '#4285f4' }}>
            <Download />
          </SectionIcon>
          <div>
            <SectionTitle style={{ color: '#4285f4' }}>{t.googleAnalytics}</SectionTitle>
            <SectionDescription>{t.googleAnalyticsHelp}</SectionDescription>
          </div>
        </SectionHeader>

        <ActionButtons>
          <button className="primary" style={{ background: '#4285f4' }} onClick={() => handleDownload('analytics')}>
            <Download />
            {t.configure}
          </button>
          <button className="secondary" onClick={() => handleDeleteConfirm('analytics')}>
            <Trash2 />
            {t.disconnect}
          </button>
        </ActionButtons>
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon style={{ background: 'rgba(234, 67, 53, 0.1)', color: '#ea4335' }}>
            <Download />
          </SectionIcon>
          <div>
            <SectionTitle style={{ color: '#ea4335' }}>{t.bigQueryExport}</SectionTitle>
            <SectionDescription>{t.bigQueryExportHelp}</SectionDescription>
          </div>
        </SectionHeader>

        <ActionButtons>
          <button className="primary" style={{ background: '#ea4335' }} onClick={() => handleDownload('bigquery')}>
            <Download />
            {t.connect}
          </button>
          <button className="secondary" onClick={() => handleDownload('bigquery-export')}>
            <Download />
            {t.export}
          </button>
        </ActionButtons>
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Trash2 />
          </SectionIcon>
          <div>
            <SectionTitle style={{ color: '#ef4444' }}>{t.deleteData}</SectionTitle>
            <SectionDescription>{t.deleteDescription}</SectionDescription>
          </div>
        </SectionHeader>

        <ActionButtons>
          <button className="danger" onClick={() => handleDeleteConfirm('all')}>
            <Trash2 />
            {t.deleteBtn}
          </button>
        </ActionButtons>
      </Section>

      {showConfirm && (
        <ConfirmationModal onClick={() => setShowConfirm(false)}>
          <ConfirmationContent onClick={e => e.stopPropagation()}>
            <WarningIcon>
              <AlertCircle />
            </WarningIcon>
            <ConfirmTitle>{t.confirmDelete}</ConfirmTitle>
            <ConfirmDescription>{t.confirmDeleteDesc}</ConfirmDescription>
            <ConfirmButtons>
              <button className="confirm" onClick={handleDelete}>
                {t.deleteAccount}
              </button>
              <button className="cancel" onClick={() => setShowConfirm(false)}>
                {t.cancel}
              </button>
            </ConfirmButtons>
          </ConfirmationContent>
        </ConfirmationModal>
      )}
    </DataSection>
  );
};

export default DataSettingsEnhanced;
