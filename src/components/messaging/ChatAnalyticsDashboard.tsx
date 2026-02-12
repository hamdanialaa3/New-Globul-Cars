import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import bg from 'date-fns/locale/bg';
import { CardBase, MessagingColors, Divider } from './messaging-styles';
import { messagingAnalytics } from '@/services/messaging/core';
import { logger } from '@/services/logger-service';
import { useLanguage } from '@/contexts';

interface ChatAnalyticsDashboardProps {
  conversationId: string;
  dateRange?: {
    from: string;
    to: string;
  };
  className?: string;
}

interface ConversationSummary {
  totalMessages: number;
  totalOffers: number;
  avgResponseTime: number;
  conversionRate: number;
  leadScore: number;
}

/**
 * Chat analytics dashboard
 * 
 * Shows:
 * - Number of messages and offers
 * - Average response time
 * - Lead score
 * - Conversion rate
 * - Charts
 */
const ChatAnalyticsDashboard: React.FC<ChatAnalyticsDashboardProps> = ({
  conversationId,
  dateRange,
  className
}) => {
  const { language } = useLanguage();
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    if (!conversationId) return;

    const loadAnalytics = async () => {
      setIsLoading(true);

      try {
        // Get conversation summary
        const summaryData = await messagingAnalytics.getConversationSummary(conversationId);
        setSummary(summaryData);

        // Get daily stats for the last 7 days
        const stats = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const dayStats = await messagingAnalytics.getDailyStats(dateStr);
          stats.push({
            date: format(date, 'dd MMM', { locale: bg }),
            messages: dayStats.messagesSent || 0,
            offers: dayStats.offersSent || 0
          });
        }
        
        setDailyStats(stats);

        logger.info('Analytics loaded successfully', { conversationId });
      } catch (error) {
        logger.error('Failed to load analytics', error as Error, { conversationId });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [conversationId, dateRange]);

  // Format response time
  const formatResponseTime = (ms: number) => {
    if (ms < 60000) {
      const seconds = Math.round(ms / 1000);
      return language === 'bg' ? `${seconds} секунди` : `${seconds} seconds`;
    }
    if (ms < 3600000) {
      const minutes = Math.round(ms / 60000);
      return language === 'bg' ? `${minutes} минути` : `${minutes} minutes`;
    }
    const hours = Math.round(ms / 3600000);
    return language === 'bg' ? `${hours} часа` : `${hours} hours`;
  };

  // Lead score color
  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return MessagingColors.offerAccepted;
    if (score >= 60) return MessagingColors.offerCountered;
    if (score >= 40) return MessagingColors.offerPending;
    return MessagingColors.offerRejected;
  };

  // Pie chart data
  const messageTypesData = [
    { name: language === 'bg' ? 'Текстови съобщения' : 'Text Messages', value: summary?.totalMessages || 0, color: MessagingColors.senderBg },
    { name: language === 'bg' ? 'Оферти' : 'Offers', value: summary?.totalOffers || 0, color: MessagingColors.offerAccepted }
  ];

  if (isLoading) {
    return (
      <Container className={className}>
        <LoadingState>
          <Spinner />
          <LoadingText>{language === 'bg' ? 'Зареждане на анализи...' : 'Loading analytics...'}</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (!summary) {
    return (
      <Container className={className}>
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <EmptyText>{language === 'bg' ? 'Няма налични данни' : 'No data available'}</EmptyText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container className={className}>
      {/* Header */}
      <Header>
        <HeaderTitle>
          <HeaderIcon>📊</HeaderIcon>
          {language === 'bg' ? 'Анализи на разговор' : 'Conversation Analytics'}
        </HeaderTitle>
        <ExportButton>
          📥 {language === 'bg' ? 'Експорт PDF' : 'Export PDF'}
        </ExportButton>
      </Header>

      <Divider />

      {/* KPI Cards */}
      <KPIGrid>
        <KPICard>
          <KPIIcon>💬</KPIIcon>
          <KPIValue>{summary.totalMessages}</KPIValue>
          <KPILabel>{language === 'bg' ? 'Общо съобщения' : 'Total Messages'}</KPILabel>
        </KPICard>

        <KPICard>
          <KPIIcon>💰</KPIIcon>
          <KPIValue>{summary.totalOffers}</KPIValue>
          <KPILabel>{language === 'bg' ? 'Общо оферти' : 'Total Offers'}</KPILabel>
        </KPICard>

        <KPICard>
          <KPIIcon>⏱️</KPIIcon>
          <KPIValue>{formatResponseTime(summary.avgResponseTime)}</KPIValue>
          <KPILabel>{language === 'bg' ? 'Средно време за отговор' : 'Avg Response Time'}</KPILabel>
        </KPICard>

        <KPICard $highlight>
          <KPIIcon>🎯</KPIIcon>
          <KPIValue $color={getLeadScoreColor(summary.leadScore)}>
            {summary.leadScore}
          </KPIValue>
          <KPILabel>{language === 'bg' ? 'Точки на потенциален клиент' : 'Lead Score'}</KPILabel>
          <ScoreBar>
            <ScoreFill 
              $width={summary.leadScore} 
              $color={getLeadScoreColor(summary.leadScore)}
            />
          </ScoreBar>
        </KPICard>
      </KPIGrid>

      {/* Charts Section */}
      <ChartsSection>
        {/* Daily Activity Chart */}
        <ChartCard>
          <ChartTitle>
            <ChartIcon>📈</ChartIcon>
            Daily Activity (Last 7 days)
          </ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="messages" 
                  fill={MessagingColors.senderBg} 
                  name="Messages"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="offers" 
                  fill={MessagingColors.offerAccepted} 
                  name="Offers"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        {/* Message Types Pie Chart */}
        <ChartCard>
          <ChartTitle>
            <ChartIcon>📊</ChartIcon>
            Message Types Distribution
          </ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={messageTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {messageTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </ChartsSection>

      {/* Insights Section */}
      <InsightsSection>
        <InsightsTitle>
          <InsightsIcon>💡</InsightsIcon>
          Smart Insights
        </InsightsTitle>
        
        <InsightsList>
          {summary.leadScore >= 80 && (
            <InsightItem $type="success">
              <InsightBullet $type="success">✅</InsightBullet>
              <InsightText>
                Very strong lead! High engagement rate and quick responses.
              </InsightText>
            </InsightItem>
          )}

          {summary.avgResponseTime < 120000 && (
            <InsightItem $type="success">
              <InsightBullet $type="success">⚡</InsightBullet>
              <InsightText>
                Excellent response time! Under two minutes on average.
              </InsightText>
            </InsightItem>
          )}

          {summary.totalOffers > 0 && (
            <InsightItem $type="info">
              <InsightBullet $type="info">💰</InsightBullet>
              <InsightText>
                {summary.totalOffers} offers sent. The buyer is serious about purchasing.
              </InsightText>
            </InsightItem>
          )}

          {summary.conversionRate > 50 && (
            <InsightItem $type="success">
              <InsightBullet $type="success">🎯</InsightBullet>
              <InsightText>
                Excellent conversion rate {summary.conversionRate}%! High probability of closing the deal.
              </InsightText>
            </InsightItem>
          )}

          {summary.leadScore < 40 && (
            <InsightItem $type="warning">
              <InsightBullet $type="warning">⚠️</InsightBullet>
              <InsightText>
                Low lead score. May need more active follow-up.
              </InsightText>
            </InsightItem>
          )}
        </InsightsList>
      </InsightsSection>
    </Container>
  );
};

// Styled Components
const Container = styled(CardBase)`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #003366;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderIcon = styled.span`
  font-size: 24px;
`;

const ExportButton = styled.button`
  padding: 10px 16px;
  background-color: #F3F4F6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #E5E7EB;
    transform: translateY(-1px);
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 20px 0;
`;

const KPICard = styled.div<{ $highlight?: boolean }>`
  background: ${props => props.$highlight ? 
    'linear-gradient(135deg, #FFF8F5 0%, #FFFFFF 100%)' : 
    'white'
  };
  border: 2px solid ${props => props.$highlight ? MessagingColors.senderBg : '#E5E7EB'};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const KPIIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const KPIValue = styled.div<{ $color?: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.$color || '#003366'};
  margin-bottom: 4px;
`;

const KPILabel = styled.div`
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
`;

const ScoreBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
`;

const ScoreFill = styled.div<{ $width: number; $color: string }>`
  width: ${props => props.$width}%;
  height: 100%;
  background-color: ${props => props.$color};
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin: 24px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(CardBase)`
  padding: 20px;
`;

const ChartTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #003366;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartIcon = styled.span`
  font-size: 20px;
`;

const ChartContainer = styled.div`
  width: 100%;
`;

const InsightsSection = styled.div`
  margin-top: 24px;
`;

const InsightsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #003366;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InsightsIcon = styled.span`
  font-size: 22px;
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightItem = styled.div<{ $type: 'success' | 'warning' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: ${props => {
    switch (props.$type) {
      case 'success': return '#F0FDF4';
      case 'warning': return '#FFFBEB';
      case 'info': return '#EFF6FF';
      default: return '#F9FAFB';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return MessagingColors.offerAccepted;
      case 'warning': return MessagingColors.offerPending;
      case 'info': return MessagingColors.offerCountered;
      default: return '#E5E7EB';
    }
  }};
  border-radius: 8px;
`;

const InsightBullet = styled.span<{ $type: 'success' | 'warning' | 'info' }>`
  font-size: 20px;
  flex-shrink: 0;
`;

const InsightText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #E5E7EB;
  border-top-color: ${MessagingColors.senderBg};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 16px;
  font-size: 14px;
  color: #6B7280;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 16px;
  color: #6B7280;
`;

// Named export for barrel export
export { ChatAnalyticsDashboard };

// Default export for backward compatibility
export default ChatAnalyticsDashboard;
