import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { aiQuotaService } from '@/services/ai/ai-quota.service';
import { AI_TIER_CONFIGS } from '@/config/ai-tiers.config';

const AIQuotaManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeQuota = async (userId: string) => {
    try {
      await aiQuotaService.getUserQuota(userId);
      alert('تم إنشاء حصة AI للمستخدم بنجاح');
      loadUsers();
    } catch (error) {
      alert('فشل إنشاء الحصة');
    }
  };

  const upgradeTier = async (userId: string, tier: string) => {
    try {
      await aiQuotaService.upgradeTier(userId, tier as any);
      alert(`تم ترقية المستخدم إلى ${tier}`);
    } catch (error) {
      alert('فشلت الترقية');
    }
  };

  if (loading) {
    return <Container><Loading>جاري التحميل...</Loading></Container>;
  }

  return (
    <Container>
      <Header>
        <Title>🤖 إدارة حصص الذكاء الاصطناعي</Title>
        <Subtitle>إنشاء وإدارة حصص AI للمستخدمين</Subtitle>
      </Header>

      <InfoBox>
        <InfoTitle>📋 الباقات المتاحة:</InfoTitle>
        <TiersList>
          {Object.entries(AI_TIER_CONFIGS).map(([key, config]) => (
            <TierItem key={key}>
              <TierName>{config.name.ar}</TierName>
              <TierPrice>€{config.price.monthly}/شهر</TierPrice>
              <TierLimits>
                <Limit>📸 {config.limits.dailyImageAnalysis === -1 ? '∞' : config.limits.dailyImageAnalysis} صورة</Limit>
                <Limit>💰 {config.limits.dailyPriceSuggestions === -1 ? '∞' : config.limits.dailyPriceSuggestions} سعر</Limit>
                <Limit>💬 {config.limits.dailyChatMessages === -1 ? '∞' : config.limits.dailyChatMessages} رسالة</Limit>
              </TierLimits>
            </TierItem>
          ))}
        </TiersList>
      </InfoBox>

      <UsersTable>
        <TableHeader>
          <HeaderCell>المستخدم</HeaderCell>
          <HeaderCell>البريد الإلكتروني</HeaderCell>
          <HeaderCell>الإجراءات</HeaderCell>
        </TableHeader>
        {users.map(user => (
          <TableRow key={user.id}>
            <Cell>{user.displayName || 'غير محدد'}</Cell>
            <Cell>{user.email}</Cell>
            <Cell>
              <ActionButtons>
                <InitBtn onClick={() => initializeQuota(user.id)}>
                  إنشاء حصة
                </InitBtn>
                <TierSelect onChange={(e) => upgradeTier(user.id, e.target.value)}>
                  <option value="">ترقية...</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </TierSelect>
              </ActionButtons>
            </Cell>
          </TableRow>
        ))}
      </UsersTable>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #ffd700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #aaa;
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.3rem;
  color: #667eea;
  margin-bottom: 1rem;
`;

const TiersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const TierItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
`;

const TierName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const TierPrice = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.75rem;
`;

const TierLimits = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Limit = styled.div`
  font-size: 0.85rem;
  color: #aaa;
`;

const UsersTable = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  gap: 1rem;
`;

const HeaderCell = styled.div`
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  padding: 1rem;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
  }
`;

const Cell = styled.div`
  color: #1a1a1a;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const InitBtn = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const TierSelect = styled.select`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;

  option {
    background: #1a1a1a;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: #aaa;
`;

export default AIQuotaManager;
