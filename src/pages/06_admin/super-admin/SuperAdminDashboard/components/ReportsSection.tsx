/**
 * Reports Section Component
 * Split from SuperAdminDashboard for better performance
 * Handles all report generation functionality
 */

import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { Download, FileSpreadsheet, FileJson } from 'lucide-react';
import { usersReportService } from '../../../../../services/reports/users-report-service';
import { carsReportService } from '../../../../../services/reports/cars-report-service';
import { logger } from '../../../../../services/logger-service';

// Styled Components - Outside component
const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' }>`
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  background: ${props => props.$type === 'success' ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.$type === 'success' ? '#2e7d32' : '#c62828'};
`;

interface ReportsSectionProps {
  language: 'bg' | 'en';
}

const ReportsSection = memo<ReportsSectionProps>(({ language }) => {
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = async (type: 'users' | 'cars', format: 'csv' | 'excel' | 'json') => {
    try {
      setExporting(true);
      setMessage(null);

      const service = type === 'users' ? usersReportService : carsReportService;
      const entityName = type === 'users' ? 'Users' : 'Cars';

      let result;
      switch (format) {
        case 'csv':
          result = await service.exportToCSV();
          break;
        case 'excel':
          result = await service.exportToExcel();
          break;
        case 'json':
          result = await service.exportToJSON();
          break;
      }

      setMessage({
        text: language === 'bg' 
          ? `${entityName} експортирани успешно като ${format.toUpperCase()}`
          : `${entityName} exported successfully as ${format.toUpperCase()}`,
        type: 'success'
      });

      logger.info('Report exported', { type, format });
    } catch (error) {
      setMessage({
        text: language === 'bg' 
          ? 'Грешка при експортиране'
          : 'Export failed',
        type: 'error'
      });
      logger.error('Export failed', error as Error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Section>
      <SectionTitle>
        {language === 'bg' ? '📊 Експорт на данни' : '📊 Data Export'}
      </SectionTitle>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#666' }}>
          {language === 'bg' ? 'Потребители' : 'Users'}
        </h3>
        <ButtonGroup>
          <ExportButton 
            onClick={() => handleExport('users', 'csv')}
            disabled={exporting}
          >
            <FileSpreadsheet size={18} />
            CSV
          </ExportButton>
          <ExportButton 
            onClick={() => handleExport('users', 'excel')}
            disabled={exporting}
          >
            <Download size={18} />
            Excel
          </ExportButton>
          <ExportButton 
            onClick={() => handleExport('users', 'json')}
            disabled={exporting}
          >
            <FileJson size={18} />
            JSON
          </ExportButton>
        </ButtonGroup>
      </div>

      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#666' }}>
          {language === 'bg' ? 'Автомобили' : 'Cars'}
        </h3>
        <ButtonGroup>
          <ExportButton 
            onClick={() => handleExport('cars', 'csv')}
            disabled={exporting}
          >
            <FileSpreadsheet size={18} />
            CSV
          </ExportButton>
          <ExportButton 
            onClick={() => handleExport('cars', 'excel')}
            disabled={exporting}
          >
            <Download size={18} />
            Excel
          </ExportButton>
          <ExportButton 
            onClick={() => handleExport('cars', 'json')}
            disabled={exporting}
          >
            <FileJson size={18} />
            JSON
          </ExportButton>
        </ButtonGroup>
      </div>

      {message && (
        <StatusMessage $type={message.type}>
          {message.text}
        </StatusMessage>
      )}
    </Section>
  );
});

ReportsSection.displayName = 'ReportsSection';

export default ReportsSection;
