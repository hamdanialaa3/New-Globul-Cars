// Migration Page - Browser-based Location Migration
// Migration Page - Browser-based Location Migration

import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { migrateCarLocations, checkMigrationStatus } from '../../utils/migrate-locations-browser';
import { logger } from '../../services/logger-service';

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
      toast.error('Error checking migration status');
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
      toast.error('Dry run simulation failed');
    } finally {
      setMigrating(false);
    }
  };

  const handleMigrate = async () => {
    if (!window.confirm('Are you sure you want to run the actual migration? This will modify data!')) {
      return;
    }

    try {
      setMigrating(true);
      const migrationResult = await migrateCarLocations(false);
      setResult(migrationResult);
      logger.info('Migration complete', migrationResult);
      
      toast.success(`Migration complete! Migrated: ${migrationResult.migrated}, Skipped: ${migrationResult.skipped}, Errors: ${migrationResult.errors}`);
      
      // Reload page to see updated counts
      setTimeout(() => window.location.href = '/', 2000);
    } catch (error) {
      logger.error('Migration failed', error as Error);
      toast.error('Migration failed! Check console');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <PageContainer>
      <ContentCard>
        <Title>🗺️ Location Data Migration</Title>
        <Subtitle>Migrate location data across all vehicles</Subtitle>

        <StatusCard type="info">
          <h3 style={{ marginBottom: '1rem' }}>📋 What is this?</h3>
          <p>
            This tool updates the location structure for all previously added vehicles.
            After running, the correct vehicle numbers will appear on the map!
          </p>
        </StatusCard>

        {status && (
          <StatusCard type={status.withoutUnifiedLocation > 0 ? 'warning' : 'success'}>
            <h3>📊 Current Status:</h3>
            <ResultsTable>
              <tbody>
                <tr>
                  <td><strong>Total Vehicles:</strong></td>
                  <td>{status.total}</td>
                </tr>
                <tr>
                  <td><strong>With Unified Structure:</strong></td>
                  <td style={{ color: '#28a745' }}>{status.withUnifiedLocation}</td>
                </tr>
                <tr>
                  <td><strong>Needs Migration:</strong></td>
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
            <h3>✅ Migration Result:</h3>
            <ResultsTable>
              <tbody>
                <tr>
                  <td><CheckCircle color="#28a745" /> Migrated:</td>
                  <td><strong>{result.migrated}</strong></td>
                </tr>
                <tr>
                  <td><AlertCircle color="#ffc107" /> Skipped:</td>
                  <td><strong>{result.skipped}</strong></td>
                </tr>
                <tr>
                  <td><XCircle color="#dc3545" /> Errors:</td>
                  <td><strong>{result.errors}</strong></td>
                </tr>
              </tbody>
            </ResultsTable>

            {result.errorDetails && result.errorDetails.length > 0 && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#dc3545' }}>
                  Show Errors ({result.errorDetails.length})
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
            Check Status
          </Button>
          
          <Button onClick={handleDryRun} disabled={migrating} variant="secondary">
            <Play size={20} />
            Dry Run
          </Button>

          <Button 
            onClick={handleMigrate} 
            disabled={migrating || !status || status.withoutUnifiedLocation === 0}
            variant="primary"
          >
            <CheckCircle size={20} />
            {migrating ? 'Migrating...' : 'Run Migration'}
          </Button>
        </ButtonGroup>

        <StatusCard type="warning">
          <h3>⚠️ Important Notes:</h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Use "Check Status" first to see the number of vehicles</li>
            <li>Use "Dry Run" to make sure everything will work correctly</li>
            <li>After "Run Migration", the page will refresh automatically</li>
            <li>The map will display the correct numbers immediately!</li>
          </ul>
        </StatusCard>
      </ContentCard>
    </PageContainer>
  );
};

export default MigrationPage;

