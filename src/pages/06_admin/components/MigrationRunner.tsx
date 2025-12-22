/**
 * Migration Runner - Admin Panel Integration
 * واجهة تشغيل الترحيل - للإضافة في لوحة التحكم
 * 
 * Usage: Add this button to your Admin Dashboard
 * الاستخدام: أضف هذا الزر للوحة تحكم الأدمن
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { migrateLegacyCars, verifyMigration } from '../../../scripts/migrate-legacy-cars';
import { serviceLogger } from '../../../services/logger-service';

const MigrationPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 800px;
  margin: 2rem auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const Description = styled.p`
  color: #7f8c8d;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin-right: 1rem;
  
  ${props => props.variant === 'primary' ? `
    background: #3498db;
    color: white;
    &:hover { background: #2980b9; }
  ` : `
    background: #ecf0f1;
    color: #2c3e50;
    &:hover { background: #d5dbdb; }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.div<{ type?: 'success' | 'error' | 'info' }>`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: ${props => 
    props.type === 'success' ? '#d4edda' :
    props.type === 'error' ? '#f8d7da' :
    '#d1ecf1'
  };
  color: ${props => 
    props.type === 'success' ? '#155724' :
    props.type === 'error' ? '#721c24' :
    '#0c5460'
  };
  border: 1px solid ${props => 
    props.type === 'success' ? '#c3e6cb' :
    props.type === 'error' ? '#f5c6cb' :
    '#bee5eb'
  };
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 6px;
  text-align: center;
  
  .label {
    font-size: 0.875rem;
    color: #7f8c8d;
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
  }
`;

export const MigrationRunner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      serviceLogger.info('Starting migration from Admin Panel');
      const stats = await migrateLegacyCars();
      setResult(stats);
      serviceLogger.info('Migration completed', stats);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      serviceLogger.error('Migration failed', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);

    try {
      const isValid = await verifyMigration();
      setResult({
        verified: true,
        allGood: isValid,
        message: isValid 
          ? '✅ All cars have numeric IDs' 
          : '⚠️ Some cars still need migration'
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MigrationPanel>
      <Title>🔧 Legacy Cars Migration</Title>
      <Description>
        هذا الأداة تمنح أرقام تعريفية (Numeric IDs) للسيارات القديمة التي لا تملكها.
        <br />
        <strong>تحذير:</strong> يُنفذ مرة واحدة فقط. تأكد من أخذ نسخة احتياطية قبل التشغيل.
      </Description>

      <div>
        <Button 
          variant="primary" 
          onClick={handleMigrate}
          disabled={loading}
        >
          {loading ? '⏳ جاري الترحيل...' : '🚀 Start Migration'}
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={handleVerify}
          disabled={loading}
        >
          🔍 Verify Migration
        </Button>
      </div>

      {error && (
        <ResultBox type="error">
          <strong>❌ Error:</strong>
          <p>{error}</p>
        </ResultBox>
      )}

      {result && !result.verified && (
        <ResultBox type="success">
          <strong>✅ Migration Completed!</strong>
          
          <Stats>
            <StatItem>
              <div className="label">Total Scanned</div>
              <div className="value">{result.totalScanned}</div>
            </StatItem>
            <StatItem>
              <div className="label">Needed Migration</div>
              <div className="value">{result.carsNeedingMigration}</div>
            </StatItem>
            <StatItem>
              <div className="label">Successfully Migrated</div>
              <div className="value" style={{ color: '#27ae60' }}>
                {result.carsSuccessfullyMigrated}
              </div>
            </StatItem>
            <StatItem>
              <div className="label">Failed</div>
              <div className="value" style={{ color: '#e74c3c' }}>
                {result.carsFailed}
              </div>
            </StatItem>
          </Stats>

          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong>⚠️ Errors:</strong>
              <ul>
                {result.errors.map((err: any, idx: number) => (
                  <li key={idx}>Car {err.carId}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
        </ResultBox>
      )}

      {result && result.verified && (
        <ResultBox type={result.allGood ? 'success' : 'info'}>
          <strong>{result.message}</strong>
        </ResultBox>
      )}
    </MigrationPanel>
  );
};

export default MigrationRunner;
