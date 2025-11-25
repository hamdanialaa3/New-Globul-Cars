/**
 * Transaction History Section
 * Displays user's transaction history and statistics
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Receipt, TrendingUp, Calendar, Euro } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { transactionsService } from '@/services/profile/transactions.service';
import type { Transaction, TransactionStats } from '@/types/profile-enhancements.types';

const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 24px;
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  margin-bottom: 24px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  text-align: center;
`;

const StatValue = styled.div<{ $isDark: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TransactionCard = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionTitle = styled.div<{ $isDark: boolean }>`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 4px;
`;

const TransactionDate = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TransactionPrice = styled.div<{ $isDark: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#22c55e' : '#16a34a'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

interface TransactionsSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isOwnProfile) {
      setLoading(false);
      return;
    }

    const loadTransactions = async () => {
      try {
        const [txns, statistics] = await Promise.all([
          transactionsService.getUserTransactions(userId, { limitCount: 10 }),
          transactionsService.getTransactionStats(userId)
        ]);
        setTransactions(txns);
        setStats(statistics);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [userId, isOwnProfile]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat(
      language === 'bg' ? 'bg-BG' : 'en-US',
      { month: 'short', day: 'numeric', year: 'numeric' }
    ).format(date);
  };

  if (loading) {
    return null;
  }

  if (!isOwnProfile) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Receipt size={20} />
          {language === 'bg' ? 'История на транзакциите' : 'Transaction History'}
        </SectionTitle>
      </SectionHeader>

      {stats && (
        <StatsGrid>
          <StatCard $isDark={isDark}>
            <StatValue $isDark={isDark}>{stats.totalSales}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Общо продажби' : 'Total Sales'}
            </StatLabel>
          </StatCard>
          <StatCard $isDark={isDark}>
            <StatValue $isDark={isDark}>
              {stats.totalRevenue.toLocaleString()} €
            </StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Общ приход' : 'Total Revenue'}
            </StatLabel>
          </StatCard>
          <StatCard $isDark={isDark}>
            <StatValue $isDark={isDark}>
              {stats.averagePrice.toLocaleString()} €
            </StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Средна цена' : 'Average Price'}
            </StatLabel>
          </StatCard>
          <StatCard $isDark={isDark}>
            <StatValue $isDark={isDark}>{stats.thisMonthSales}</StatValue>
            <StatLabel $isDark={isDark}>
              {language === 'bg' ? 'Този месец' : 'This Month'}
            </StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      {transactions.length === 0 ? (
        <EmptyState $isDark={isDark}>
          <Receipt size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p style={{ fontSize: '0.875rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
            {language === 'bg' 
              ? 'Все още няма транзакции'
              : 'No transactions yet'}
          </p>
        </EmptyState>
      ) : (
        <TransactionsList>
          {transactions.map(transaction => (
            <TransactionCard key={transaction.id} $isDark={isDark}>
              <TransactionInfo>
                <TransactionTitle $isDark={isDark}>
                  {transaction.carYear} {transaction.carMake} {transaction.carModel}
                </TransactionTitle>
                <TransactionDate $isDark={isDark}>
                  <Calendar size={12} />
                  {formatDate(transaction.saleDate)}
                </TransactionDate>
              </TransactionInfo>
              <TransactionPrice $isDark={isDark}>
                <Euro size={16} />
                {transaction.salePrice.toLocaleString()}
              </TransactionPrice>
            </TransactionCard>
          ))}
        </TransactionsList>
      )}
    </SectionContainer>
  );
};

export default TransactionsSection;

