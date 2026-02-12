// src/pages/CommissionsPage.tsx
// Commissions Management Page
// Connected to Backend P2.3 Commission System

import React, { useState, useEffect } from 'react';
import { logger } from '../../services/logger-service';
import styled from 'styled-components';
import {
  getCommissionPeriods,
  getCommissionRate,
  CommissionPeriod,
  formatPeriod,
  formatCurrency,
  getCommissionStatusColor,
  getCommissionStatusText,
  formatCommissionRate,
} from '../../services/commission-service';

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
`;

const PageHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 24px;
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const RateBadge = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  text-align: center;
`;

const RateLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
`;

const RateValue = styled.div`
  font-size: 32px;
  font-weight: 700;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div<{ $color?: string }>`
  background: ${props => props.$color || 'white'};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: white;
`;

const PeriodsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
`;

const PeriodsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const PeriodCard = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #4267b2;
  }
`;

const PeriodHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PeriodTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const StatusBadge = styled.span<{ $color?: string }>`
  background: ${props => props.$color || '#e0e0e0'};
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const PeriodBody = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
`;

const Metric = styled.div``;

const MetricLabel = styled.p`
  font-size: 12px;
  color: #999;
  margin: 0 0 4px 0;
`;

const MetricValue = styled.p`
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin: 0;
`;

const PeriodFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const CommissionAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #4267b2;
`;

const TransactionsList = styled.div<{ $show?: boolean }>`
  display: ${props => props.$show ? 'block' : 'none'};
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
`;

const TransactionsTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionTitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
`;

const TransactionDate = styled.p`
  font-size: 12px;
  color: #999;
  margin: 0;
`;

const TransactionAmount = styled.div`
  text-align: right;
`;

const SaleAmount = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
`;

const CommissionAmountSmall = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #4267b2;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

// ==================== COMPONENT ====================

const CommissionsPage: React.FC = () => {
  const [periods, setPeriods] = useState<CommissionPeriod[]>([]);
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [language] = useState<'bg' | 'en'>('bg');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load commission rate
      const rateResult = await getCommissionRate();
      if (rateResult.success && rateResult.rate !== undefined) {
        setCommissionRate(rateResult.rate);
      }

      // Load periods (last 12 months)
      const periodsResult = await getCommissionPeriods();
      if (periodsResult.success && periodsResult.periods) {
        setPeriods(periodsResult.periods);
      }
    } catch (error) {
      logger.error('Error loading commission data', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const togglePeriod = (periodId: string) => {
    setExpandedPeriod(expandedPeriod === periodId ? null : periodId);
  };

  const calculateTotalCommissions = () => {
    return periods.reduce((sum, period) => sum + period.commissionAmount, 0);
  };

  const calculatePaidCommissions = () => {
    return periods
      .filter(p => p.status === 'paid')
      .reduce((sum, period) => sum + period.commissionAmount, 0);
  };

  const calculatePendingCommissions = () => {
    return periods
      .filter(p => p.status !== 'paid')
      .reduce((sum, period) => sum + period.commissionAmount, 0);
  };

  const formatTransactionDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderTop>
          <TitleSection>
            <PageTitle>{language === 'bg' ? 'Моите Комисионни' : 'My Commissions'}</PageTitle>
            <PageSubtitle>
              {language === 'bg' 
                ? 'Преглед на продажби и комисионни' 
                : 'Review of sales and commissions'}
            </PageSubtitle>
          </TitleSection>

          <RateBadge>
            <RateLabel>{language === 'bg' ? 'Вашата ставка' : 'Your Rate'}</RateLabel>
            <RateValue>{formatCommissionRate(commissionRate)}</RateValue>
          </RateBadge>
        </HeaderTop>

        <StatsGrid>
          <StatCard $color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <StatLabel>{language === 'bg' ? 'Общо комисионни' : 'Total Commissions'}</StatLabel>
            <StatValue>{formatCurrency(calculateTotalCommissions())}</StatValue>
          </StatCard>

          <StatCard $color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <StatLabel>{language === 'bg' ? 'Предстоящи' : 'Pending'}</StatLabel>
            <StatValue>{formatCurrency(calculatePendingCommissions())}</StatValue>
          </StatCard>

          <StatCard $color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <StatLabel>{language === 'bg' ? 'Получени' : 'Paid'}</StatLabel>
            <StatValue>{formatCurrency(calculatePaidCommissions())}</StatValue>
          </StatCard>
        </StatsGrid>
      </PageHeader>

      <PeriodsSection>
        <SectionTitle>
          {language === 'bg' ? 'Периоди' : 'Periods'} ({periods.length})
        </SectionTitle>

        {loading ? (
          <LoadingState>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingState>
        ) : periods.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>💰</EmptyStateIcon>
            <EmptyStateText>
              {language === 'bg' ? 'Все още няма комисионни' : 'No commissions yet'}
            </EmptyStateText>
          </EmptyState>
        ) : (
          <PeriodsGrid>
            {periods.map(period => (
              <PeriodCard key={period.id} onClick={() => togglePeriod(period.id)}>
                <PeriodHeader>
                  <PeriodTitle>{formatPeriod(period.period, language)}</PeriodTitle>
                  <StatusBadge $color={getCommissionStatusColor(period.status)}>
                    {getCommissionStatusText(period.status, language)}
                  </StatusBadge>
                </PeriodHeader>

                <PeriodBody>
                  <Metric>
                    <MetricLabel>{language === 'bg' ? 'Продажби' : 'Sales'}</MetricLabel>
                    <MetricValue>{period.transactions.length}</MetricValue>
                  </Metric>

                  <Metric>
                    <MetricLabel>{language === 'bg' ? 'Обем продажби' : 'Sales Volume'}</MetricLabel>
                    <MetricValue>{formatCurrency(period.totalSales)}</MetricValue>
                  </Metric>

                  <Metric>
                    <MetricLabel>{language === 'bg' ? 'Ставка' : 'Rate'}</MetricLabel>
                    <MetricValue>{formatCommissionRate(period.commissionRate)}</MetricValue>
                  </Metric>
                </PeriodBody>

                <PeriodFooter>
                  <CommissionAmount>{formatCurrency(period.commissionAmount)}</CommissionAmount>
                </PeriodFooter>

                <TransactionsList $show={expandedPeriod === period.id}>
                  <TransactionsTitle>
                    {language === 'bg' ? 'Транзакции' : 'Transactions'} ({period.transactions.length})
                  </TransactionsTitle>
                  
                  {period.transactions.map((transaction, index) => (
                    <TransactionItem key={index}>
                      <TransactionDetails>
                        <TransactionTitle>{transaction.listingTitle}</TransactionTitle>
                        <TransactionDate>
                          {formatTransactionDate(transaction.saleDate)}
                        </TransactionDate>
                      </TransactionDetails>
                      
                      <TransactionAmount>
                        <SaleAmount>{formatCurrency(transaction.saleAmount)}</SaleAmount>
                        <CommissionAmountSmall>
                          +{formatCurrency(transaction.commissionAmount)}
                        </CommissionAmountSmall>
                      </TransactionAmount>
                    </TransactionItem>
                  ))}
                </TransactionsList>
              </PeriodCard>
            ))}
          </PeriodsGrid>
        )}
      </PeriodsSection>
    </PageContainer>
  );
};

export default CommissionsPage;
