import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { collection, getDocs, query, orderBy, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { logger } from '@/services/logger-service';
import { Shield, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

/**
 * Admin Data Fix Tool
 * أداة تصحيح بيانات المسؤول
 * 
 * Features:
 * - Fix car sequences (numericId) for all users
 * - (DEPRECATED) Old data ownership fixers
 */
const AdminDataFix: React.FC = () => {
  const [fixing, setFixing] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const handleFixCarSequences = async () => {
    if (!window.confirm('This will assign sequential IDs (1, 2, 3...) to all cars for each user. Continue?')) {
      return;
    }

    setFixing(true);
    setLog([]);
    try {
      addLog('Starting car sequence fix...');

      // 1. Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

      addLog(`Found ${usersData.length} users. Processing sequences...`);

      let totalUpdated = 0;

      for (const user of usersData) {
        // 2. Get cars for this user, ordered by creation time
        const carsQuery = query(
          collection(db, 'cars'),
          where('sellerId', '==', user.id),
          orderBy('createdAt', 'asc')
        );
        const carsSnapshot = await getDocs(carsQuery);

        if (carsSnapshot.empty) continue;

        addLog(`Processing ${carsSnapshot.size} cars for user ${user.id}...`);

        const batch = writeBatch(db);
        let sequence = 1;

        carsSnapshot.docs.forEach((carDoc) => {
          const carRef = doc(db, 'cars', carDoc.id);
          const updateData: any = { numericId: sequence };

          // Also Ensure sellerNumericId is present if the user has one
          if ((user as any).numericId) {
            updateData.sellerNumericId = (user as any).numericId;
          }

          batch.update(carRef, updateData);
          sequence++;
          totalUpdated++;
        });

        await batch.commit();
      }

      addLog(`Successfully assigned sequences to ${totalUpdated} cars!`);
      toast.success(`Successfully assigned sequences to ${totalUpdated} cars!`);

    } catch (error) {
      logger.error('Error fixing car sequences:', error);
      addLog(`Error: ${(error as Error).message}`);
      toast.error('Error fixing car sequences: ' + (error as Error).message);
    } finally {
      setFixing(false);
    }
  };

  return (
    <PageContainer>
      <Container>
        <Header>
          <Shield size={48} color="#FF7900" />
          <h1>Admin Data Fix Tool</h1>
          <p>أداة تصحيح بيانات النظام - System Data Fix Tool</p>
        </Header>

        <WarningBox>
          <AlertTriangle size={24} />
          <div>
            <h3>⚠️ تحذير / Warning</h3>
            <p>
              هذه الأدوات تقوم بتعديل البيانات بشكل مباشر في قاعدة البيانات.<br />
              These tools perform direct database modifications.
            </p>
          </div>
        </WarningBox>

        <ActionsGrid>
          <ActionCard>
            <h3>1️⃣ تصحيح تسلسل السيارات (Numeric ID)</h3>
            <p>Assign sequential numeric IDs to all cars per user to ensure clean URLs works for old listings.</p>
            <ActionButton
              onClick={handleFixCarSequences}
              disabled={fixing}
              $variant="primary"
            >
              {fixing ? (
                <>
                  <Loader size={18} className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Recalculate All Sequences
                </>
              )}
            </ActionButton>
          </ActionCard>

          <ActionCard>
            <h3>❌ Old Data Ownership Fixer</h3>
            <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
              Utility disabled: fix-old-data-ownership library was removed during system cleanup.
            </p>
            <ActionButton disabled $variant="secondary">
              Feature Retired
            </ActionButton>
          </ActionCard>
        </ActionsGrid>

        {log.length > 0 && (
          <LogBox>
            <h3>📋 Operation Log</h3>
            <LogContent>
              {log.map((entry, i) => (
                <div key={i}>{entry}</div>
              ))}
            </LogContent>
          </LogBox>
        )}

        <InfoBox>
          <h3>ℹ️ معلومات / Information</h3>
          <ul>
            <li><strong>Recalculate Sequences</strong>: Updates the <code>numericId</code> field for every car listing to match a sequence (1, 2, 3...) based on creation date.</li>
            <li>This ensures clean URLs like <code>/car/80/1</code> work even for cars created before the system update.</li>
          </ul>
        </InfoBox>
      </Container>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f8fb 0%, #e8ecf1 100%);
  padding: 40px 20px;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 20px 0 12px 0;
    background: linear-gradient(135deg, #FF8F10 0%, #FF7900 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0;
  }
`;

const WarningBox = styled.div`
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  display: flex;
  gap: 20px;
  
  svg {
    flex-shrink: 0;
    color: #ff9800;
  }
  
  h3 {
    margin: 0 0 12px 0;
    color: #856404;
  }
  
  p {
    margin: 0 0 12px 0;
    color: #856404;
    line-height: 1.6;
  }
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const ActionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 1.3rem;
    color: #212529;
  }
  
  p {
    margin: 0 0 20px 0;
    color: #6c757d;
    line-height: 1.6;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  
  ${p => p.$variant === 'primary' ? `
    background: linear-gradient(135deg, #FF7900, #FF8F10);
    color: white;
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.25);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 121, 0, 0.35);
    }
  ` : `
    background: white;
    color: #495057;
    border: 2px solid #dee2e6;
    
    &:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #dee2e6;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LogBox = styled.div`
  background: #212529;
  color: #00ff00;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  font-family: 'Courier New', Courier, monospace;
  
  h3 {
    margin: 0 0 16px 0;
    color: white;
    font-size: 1.1rem;
  }
`;

const LogContent = styled.div`
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.9rem;
  line-height: 1.4;
  
  & > div {
    margin-bottom: 4px;
  }
`;

const InfoBox = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 16px;
  padding: 24px;
  
  h3 {
    margin: 0 0 16px 0;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
    }
  }
`;

export default AdminDataFix;
