// Migration Page - Browser-based Location Migration
// صفحة الترحيل - ترحيل المواقع من المتصفح

import React, { useState } from 'react';
import styled from 'styled-components';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { migrateCarLocations, checkMigrationStatus } from '../utils/migrate-locations-browser';
import { logger } from '../services/logger-service';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const ContentCard = styled.div`
  max-width: 800px;
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
  text-align: center;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const StatusCard = styled.div<{ type: 'info' | 'success' | 'warning' | 'error' }>`
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'warning': return '#fff3cd';
      default: return '#d1ecf1';
    }
  }};
  border: 2px solid ${props => {
    switch (props.type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#17a2b8';
    }
  }};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: #ecf0f1;
    color: #2c3e50;
    &:hover {
      background: #bdc3c7;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsTable = styled.table`
  width: 100%;
  margin-top: 2rem;
  border-collapse: collapse;

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const MigrationPage: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCheckStatus = async () => {
    try {
      setMigrating(true);
      const statusResult = await checkMigrationStatus();
      setStatus(statusResult);
      logger.info('Migration status checked', statusResult);
    } catch (error) {
      logger.error('Error checking status', error as Error);
      alert('خطأ في التحقق من الحالة');
    } finally {
      setMigrating(false);
    }
  };

  const handleDryRun = async () => {
    try {
      setMigrating(true);
      const migrationResult = await migrateCarLocations(true);
      setResult(migrationResult);
      logger.info('Dry run complete', migrationResult);
    } catch (error) {
      logger.error('Dry run failed', error as Error);
      alert('خطأ في المحاكاة');
    } finally {
      setMigrating(false);
    }
  };

  const handleMigrate = async () => {
    if (!window.confirm('هل أنت متأكد من تشغيل الترحيل الفعلي؟ هذا سيعدّل البيانات!')) {
      return;
    }

    try {
      setMigrating(true);
      const migrationResult = await migrateCarLocations(false);
      setResult(migrationResult);
      logger.info('Migration complete', migrationResult);
      
      alert(`✅ تم بنجاح!\n\nتم الترحيل: ${migrationResult.migrated}\nمتخطى: ${migrationResult.skipped}\nأخطاء: ${migrationResult.errors}`);
      
      // Reload page to see updated counts
      setTimeout(() => window.location.href = '/', 2000);
    } catch (error) {
      logger.error('Migration failed', error as Error);
      alert('❌ فشل الترحيل! تحقق من Console');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <PageContainer>
      <ContentCard>
        <Title>🗺️ ترحيل بيانات المواقع</Title>
        <Subtitle>Location Data Migration</Subtitle>

        <StatusCard type="info">
          <h3 style={{ marginBottom: '1rem' }}>📋 ما هذا؟</h3>
          <p>
            هذه الأداة تقوم بتحديث بنية المواقع في جميع السيارات المضافة سابقاً.
            بعد التشغيل، ستظهر أرقام السيارات الصحيحة على الخريطة!
          </p>
        </StatusCard>

        {status && (
          <StatusCard type={status.withoutUnifiedLocation > 0 ? 'warning' : 'success'}>
            <h3>📊 الحالة الحالية:</h3>
            <ResultsTable>
              <tbody>
                <tr>
                  <td><strong>إجمالي السيارات:</strong></td>
                  <td>{status.total}</td>
                </tr>
                <tr>
                  <td><strong>مع بنية موحدة:</strong></td>
                  <td style={{ color: '#28a745' }}>{status.withUnifiedLocation}</td>
                </tr>
                <tr>
                  <td><strong>بحاجة للترحيل:</strong></td>
                  <td style={{ color: status.withoutUnifiedLocation > 0 ? '#dc3545' : '#28a745' }}>
                    {status.withoutUnifiedLocation}
                  </td>
                </tr>
              </tbody>
            </ResultsTable>
          </StatusCard>
        )}

        {result && (
          <StatusCard type={result.errors > 0 ? 'warning' : 'success'}>
            <h3>✅ نتيجة الترحيل:</h3>
            <ResultsTable>
              <tbody>
                <tr>
                  <td><CheckCircle color="#28a745" /> تم الترحيل:</td>
                  <td><strong>{result.migrated}</strong></td>
                </tr>
                <tr>
                  <td><AlertCircle color="#ffc107" /> متخطى:</td>
                  <td><strong>{result.skipped}</strong></td>
                </tr>
                <tr>
                  <td><XCircle color="#dc3545" /> أخطاء:</td>
                  <td><strong>{result.errors}</strong></td>
                </tr>
              </tbody>
            </ResultsTable>

            {result.errorDetails && result.errorDetails.length > 0 && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#dc3545' }}>
                  عرض الأخطاء ({result.errorDetails.length})
                </summary>
                <pre style={{ fontSize: '0.85rem', marginTop: '0.5rem', maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(result.errorDetails, null, 2)}
                </pre>
              </details>
            )}
          </StatusCard>
        )}

        <ButtonGroup>
          <Button onClick={handleCheckStatus} disabled={migrating}>
            <RefreshCw size={20} />
            التحقق من الحالة
          </Button>
          
          <Button onClick={handleDryRun} disabled={migrating} variant="secondary">
            <Play size={20} />
            تجربة (Dry Run)
          </Button>

          <Button 
            onClick={handleMigrate} 
            disabled={migrating || !status || status.withoutUnifiedLocation === 0}
            variant="primary"
          >
            <CheckCircle size={20} />
            {migrating ? 'جاري الترحيل...' : 'تشغيل الترحيل'}
          </Button>
        </ButtonGroup>

        <StatusCard type="warning">
          <h3>⚠️ ملاحظات مهمة:</h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>استخدم "التحقق من الحالة" أولاً لمعرفة عدد السيارات</li>
            <li>استخدم "تجربة" للتأكد من أن كل شيء سيعمل بشكل صحيح</li>
            <li>بعد "تشغيل الترحيل"، سيتم تحديث الصفحة تلقائياً</li>
            <li>الخريطة ستعرض الأرقام الصحيحة فوراً!</li>
          </ul>
        </StatusCard>
      </ContentCard>
    </PageContainer>
  );
};

export default MigrationPage;

