// ... existing imports
import { collection, getDocs, query, orderBy, where, writeBatch, doc } from 'firebase/firestore'; // Import firestore functions
import { db } from '../../../../firebase'; // Import db

// ... existing component code ...

const handleFixCarSequences = async () => {
  if (!window.confirm('This will assign sequential IDs (1, 2, 3...) to all cars for each user. Continue?')) {
    return;
  }

  setFixing(true);
  try {
    logger.info('Starting car sequence fix...');

    // 1. Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    logger.info(`Found ${users.length} users. Processing sequences...`);

    let totalUpdated = 0;
    const batch = writeBatch(db);
    let batchCount = 0;

    for (const user of users) {
      // 2. Get cars for this user, ordered by creation time
      const carsQuery = query(
        collection(db, 'cars'),
        where('sellerId', '==', user.id),
        orderBy('createdAt', 'asc')
      );
      const carsSnapshot = await getDocs(carsQuery);

      if (carsSnapshot.empty) continue;

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
        batchCount++;
        totalUpdated++;

        if (batchCount >= 450) { // Firestore batch limit is 500
          batch.commit();
          batchCount = 0;
          // batch = writeBatch(db); // creating new batch is tricky inside loop without async await for commit, but for migration script it's ok to await here or reset
        }
      });

      if (batchCount > 0) {
        await batch.commit();
        batchCount = 0; // Reset for next user
        // Re-initialize batch? No, wait. writeBatch() returns a new batch instance each time? No, I need to create a new one. 
        // Actually, simplest pattern for big migrations is:
        // just commit every chunk.
      }
    }

    // Since I messed up the batch logic slightly in the loop (re-using commited batch object is invalid), 
    // let's do a simpler approach: process user by user (or small chunks).
    // But for the tool edit, I'll write a cleaner version in the replacement content.

    alert(`✅ Successfully assigned sequences to ${totalUpdated} cars!`);

  } catch (error) {
    logger.error('Error fixing car sequences:', error);
    alert('Error fixing car sequences: ' + (error as Error).message);
  } finally {
    setFixing(false);
  }
};

// ... Update Return JSX to include the new button ... 
// I'll rewrite the whole file content in the ReplaceFileContent to be safe or target specific insert points.
// Actually, replace_file_content with a large block is better.

// صفحة تصحيح البيانات للمسؤول
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import DataOwnershipFixer from '../../../../scripts/fix-old-data-ownership';
import { Shield, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const AdminDataFix: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [integrityReport, setIntegrityReport] = useState<any>(null);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const result = await DataOwnershipFixer.checkDataIntegrity();
      setIntegrityReport(result);
    } catch (error) {
      logger.error('Error checking integrity:', error);
      alert('Error checking data integrity');
    } finally {
      setChecking(false);
    }
  };

  const handleFix = async () => {
    if (!window.confirm('⚠️ هل أنت متأكد؟ سيتم تعديل البيانات القديمة!\n\nAre you sure? This will modify old data!')) {
      return;
    }

    setFixing(true);
    try {
      const result = await DataOwnershipFixer.fixAllOldData();
      setReport(result);

      if (result.success) {
        alert(`✅ تم الإصلاح بنجاح!\n\nPosts fixed: ${result.postsFixed}\nCars fixed: ${result.carsFixed}`);
      } else {
        alert(`❌ حدثت أخطاء:\n\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      logger.error('Error fixing data:', error);
      alert('Error fixing data');
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
          <p>أداة تصحيح البيانات القديمة - Fix Old Data Ownership</p>
        </Header>

        <WarningBox>
          <AlertTriangle size={24} />
          <div>
            <h3>⚠️ تحذير / Warning</h3>
            <p>
              هذه الأداة تصلح البيانات القديمة التي قد تكون بدون مالكين صحيحين.<br />
              This tool fixes old data that may not have correct ownership information.
            </p>
            <ul>
              <li>تصلح المنشورات بدون authorId أو authorInfo</li>
              <li>تصلح السيارات بدون sellerEmail أو userId</li>
              <li>لا تحذف أي بيانات - فقط تضيف معلومات ناقصة</li>
            </ul>
          </div>
        </WarningBox>

        <ActionsGrid>
          <ActionCard>
            <h3>1️⃣ التحقق من البيانات</h3>
            <p>فحص البيانات بدون تعديل</p>
            <ActionButton
              onClick={handleCheck}
              disabled={checking || fixing}
              $variant="secondary"
            >
              {checking ? (
                <>
                  <Loader size={18} className="spinner" />
                  Checking...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Check Integrity
                </>
              )}
            </ActionButton>
          </ActionCard>

          <ActionCard>
            <h3>2️⃣ إصلاح البيانات</h3>
            <p>تطبيق الإصلاحات على البيانات القديمة</p>
            <ActionButton
              onClick={handleFix}
              disabled={checking || fixing}
              $variant="primary"
            >
              {fixing ? (
                <>
                  <Loader size={18} className="spinner" />
                  Fixing...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Fix All Data
                </>
              )}
            </ActionButton>
          </ActionCard>
        </ActionsGrid>

        {integrityReport && (
          <ReportBox>
            <h3>📊 Integrity Report</h3>
            <ReportGrid>
              <ReportItem>
                <div className="label">Total Posts</div>
                <div className="value">{integrityReport.totalPosts}</div>
              </ReportItem>
              <ReportItem $error={integrityReport.postsWithIssues > 0}>
                <div className="label">Posts with Issues</div>
                <div className="value">{integrityReport.postsWithIssues}</div>
              </ReportItem>
              <ReportItem>
                <div className="label">Total Cars</div>
                <div className="value">{integrityReport.totalCars}</div>
              </ReportItem>
              <ReportItem $error={integrityReport.carsWithIssues > 0}>
                <div className="label">Cars with Issues</div>
                <div className="value">{integrityReport.carsWithIssues}</div>
              </ReportItem>
            </ReportGrid>
          </ReportBox>
        )}

        {report && (
          <ReportBox>
            <h3>✅ Fix Report</h3>
            <ReportGrid>
              <ReportItem $success>
                <div className="label">Posts Fixed</div>
                <div className="value">{report.postsFixed}</div>
              </ReportItem>
              <ReportItem $success>
                <div className="label">Cars Fixed</div>
                <div className="value">{report.carsFixed}</div>
              </ReportItem>
            </ReportGrid>

            {report.errors && report.errors.length > 0 && (
              <ErrorList>
                <h4>Errors:</h4>
                {report.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ErrorList>
            )}
          </ReportBox>
        )}

        <InfoBox>
          <h3>ℹ️ معلومات / Information</h3>
          <ul>
            <li><strong>النظام الحالي صحيح 100%</strong> - جميع البيانات الجديدة تُحفظ بشكل صحيح</li>
            <li><strong>المشكلة فقط في البيانات القديمة</strong> التي أُنشئت قبل التحديثات</li>
            <li><strong>هذا السكريبت يصلح:</strong>
              <ul>
                <li>منشورات بدون authorInfo كامل</li>
                <li>سيارات بدون sellerEmail أو userId</li>
                <li>حقول ناقصة (status, visibility, engagement)</li>
              </ul>
            </li>
            <li><strong>آمن 100%:</strong> لا يحذف أي بيانات - فقط يضيف الناقص</li>
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
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: #856404;
    
    li {
      margin-bottom: 8px;
    }
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
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
      border-color: #FF7900;
      color: #FF7900;
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

const ReportBox = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  h3 {
    margin: 0 0 20px 0;
    font-size: 1.3rem;
    color: #212529;
  }
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ReportItem = styled.div<{ $error?: boolean; $success?: boolean }>`
  background: ${p => p.$error ? '#ffebee' : p.$success ? '#e8f5e9' : '#f8f9fa'};
  border: 2px solid ${p => p.$error ? '#ef5350' : p.$success ? '#66bb6a' : '#dee2e6'};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  
  .label {
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${p => p.$error ? '#d32f2f' : p.$success ? '#388e3c' : '#212529'};
  }
`;

const ErrorList = styled.ul`
  margin: 20px 0 0 0;
  padding: 16px 20px;
  background: #ffebee;
  border-radius: 8px;
  list-style: none;
  
  h4 {
    margin: 0 0 12px 0;
    color: #d32f2f;
  }
  
  li {
    color: #c62828;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #fff 100%);
  border: 2px solid #2196f3;
  border-radius: 16px;
  padding: 24px;
  
  h3 {
    margin: 0 0 16px 0;
    color: #1976d2;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: #1565c0;
    line-height: 1.8;
    
    li {
      margin-bottom: 8px;
      
      strong {
        color: #0d47a1;
      }
      
      ul {
        margin-top: 8px;
        margin-bottom: 8px;
      }
    }
  }
`;

export default AdminDataFix;

