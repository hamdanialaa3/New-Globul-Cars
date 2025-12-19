import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Shield,
  DollarSign,
  BarChart3,
  Database,
  MessageSquare,
  Users,
  Zap,
  FileText,
  CreditCard,
  Brain,
  Inbox,
  UserCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const Container = styled.div<{ $isDark?: boolean }>`
  min-height: 100vh;
  padding: 120px 20px 40px;
  background: ${({ $isDark }) => $isDark ? '#0f172a' : '#f8fafc'};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div<{ $isDark?: boolean }>`
  text-align: center;
  margin-bottom: 48px;
`;

const Title = styled.h1<{ $isDark?: boolean }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 12px;
`;

const Subtitle = styled.p<{ $isDark?: boolean }>`
  font-size: 1.125rem;
  color: ${({ $isDark }) => $isDark ? '#94a3b8' : '#64748b'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const FeatureCard = styled.button<{ $isDark?: boolean; $status: 'connected' | 'disconnected' }>`
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 2px solid ${({ $isDark, $status }) =>
    $status === 'disconnected'
      ? ($isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)')
      : ($isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)')};
  background: ${({ $isDark }) => $isDark ? 'rgba(15, 23, 42, 0.5)' : 'white'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ $isDark }) =>
    $isDark
      ? '0 12px 40px rgba(255, 107, 53, 0.3)'
      : '0 12px 40px rgba(0, 0, 0, 0.15)'};
    border-color: ${({ $isDark }) => $isDark ? '#ff6b35' : '#ff6b35'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $status }) =>
    $status === 'disconnected' ? '#ef4444' : '#22c55e'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div<{ $isDark?: boolean; $status: 'connected' | 'disconnected' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isDark, $status }) =>
    $status === 'disconnected'
      ? ($isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)')
      : ($isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)')};
  color: ${({ $status }) => $status === 'disconnected' ? '#ef4444' : '#22c55e'};
  flex-shrink: 0;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3<{ $isDark?: boolean }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ $isDark }) => $isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 8px;
`;

const CardDescription = styled.p<{ $isDark?: boolean }>`
  font-size: 0.9375rem;
  color: ${({ $isDark }) => $isDark ? '#94a3b8' : '#64748b'};
  line-height: 1.6;
  margin-bottom: 16px;
`;

const StatusBadge = styled.span<{ $status: 'connected' | 'disconnected' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: ${({ $status }) =>
    $status === 'disconnected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'};
  color: ${({ $status }) => $status === 'disconnected' ? '#ef4444' : '#22c55e'};
`;

const ActionButton = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ $isDark }) =>
    $isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  color: ${({ $isDark }) => $isDark ? '#ff6b35' : '#ff6b35'};
  font-weight: 600;
  font-size: 0.9375rem;
`;

const DevelopmentToolsPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isDark = false; // You can get this from theme context if needed

  const features = [
    {
      id: 'insurance',
      icon: Shield,
      title: language === 'bg' ? 'Система за застраховка' : 'Insurance System',
      description: language === 'bg'
        ? 'Пълна система за застраховка с оферти, полици и претенции. Cloud Functions готови, но не са свързани с интерфейса.'
        : 'Complete insurance system with quotes, policies, and claims. Cloud Functions ready but not connected to frontend.',
      status: 'disconnected' as const,
      path: '/insurance',
      bgTitle: 'Система за застраховка',
      enTitle: 'Insurance System',
      bgDesc: 'Пълна система за застраховка с оферти, полици и претенции. Cloud Functions готови, но не са свързани с интерфейса.',
      enDesc: 'Complete insurance system with quotes, policies, and claims. Cloud Functions ready but not connected to frontend.'
    },
    {
      id: 'ai-price',
      icon: DollarSign,
      title: language === 'bg' ? 'AI Оценка на цена' : 'AI Price Valuation',
      description: language === 'bg'
        ? 'Оценка на цена с изкуствен интелект. Cloud Function getAIPriceValuation готов, но не е свързан с CarDetailsPage.'
        : 'AI-powered price valuation. Cloud Function getAIPriceValuation ready but not connected to CarDetailsPage.',
      status: 'disconnected' as const,
      path: '/car-details',
      bgTitle: 'AI Оценка на цена',
      enTitle: 'AI Price Valuation',
      bgDesc: 'Оценка на цена с изкуствен интелект. Cloud Function getAIPriceValuation готов, но не е свързан с CarDetailsPage.',
      enDesc: 'AI-powered price valuation. Cloud Function getAIPriceValuation ready but not connected to CarDetailsPage.'
    },
    {
      id: 'seller-metrics',
      icon: BarChart3,
      title: language === 'bg' ? 'Метрики на продавача' : 'Seller Metrics',
      description: language === 'bg'
        ? 'Статистики за продавачи: обяви, гледания, съобщения, конверсия. Cloud Function готов, но не е интегриран.'
        : 'Seller statistics: listings, views, messages, conversion rate. Cloud Function ready but not integrated.',
      status: 'disconnected' as const,
      path: '/dealer-dashboard',
      bgTitle: 'Метрики на продавача',
      enTitle: 'Seller Metrics',
      bgDesc: 'Статистики за продавачи: обяви, гледания, съобщения, конверсия. Cloud Function готов, но не е интегриран.',
      enDesc: 'Seller statistics: listings, views, messages, conversion rate. Cloud Function ready but not integrated.'
    },
    {
      id: 'backup',
      icon: Database,
      title: language === 'bg' ? 'Управление на резервни копия' : 'Backup Management',
      description: language === 'bg'
        ? 'Компонент BackupManagement.tsx съществува, но няма route в MainRoutes.tsx. Cloud Function manualBackup готов.'
        : 'BackupManagement.tsx component exists but no route in MainRoutes.tsx. Cloud Function manualBackup ready.',
      status: 'disconnected' as const,
      path: '/admin/backup',
      bgTitle: 'Управление на резервни копия',
      enTitle: 'Backup Management',
      bgDesc: 'Компонент BackupManagement.tsx съществува, но няма route в MainRoutes.tsx. Cloud Function manualBackup готов.',
      enDesc: 'BackupManagement.tsx component exists but no route in MainRoutes.tsx. Cloud Function manualBackup ready.'
    },
    {
      id: 'auto-responder',
      icon: MessageSquare,
      title: language === 'bg' ? 'Автоматичен отговор' : 'Auto Responder',
      description: language === 'bg'
        ? 'Cloud Functions getAutoResponderSettings и updateAutoResponderSettings готови, но не са свързани с интерфейса.'
        : 'Cloud Functions getAutoResponderSettings and updateAutoResponderSettings ready but not connected to frontend.',
      status: 'disconnected' as const,
      path: '/messages/auto-responder',
      bgTitle: 'Автоматичен отговор',
      enTitle: 'Auto Responder',
      bgDesc: 'Cloud Functions getAutoResponderSettings и updateAutoResponderSettings готови, но не са свързани с интерфейса.',
      enDesc: 'Cloud Functions getAutoResponderSettings and updateAutoResponderSettings ready but not connected to frontend.'
    },
    {
      id: 'lead-scoring',
      icon: Users,
      title: language === 'bg' ? 'Оценка на потенциални клиенти' : 'Lead Scoring',
      description: language === 'bg'
        ? 'Компонент LeadScoringDashboard.tsx съществува, но няма route. Cloud Functions calculateLeadScore, getLeads готови.'
        : 'LeadScoringDashboard.tsx component exists but no route. Cloud Functions calculateLeadScore, getLeads ready.',
      status: 'disconnected' as const,
      path: '/admin/leads',
      bgTitle: 'Оценка на потенциални клиенти',
      enTitle: 'Lead Scoring',
      bgDesc: 'Компонент LeadScoringDashboard.tsx съществува, но няма route. Cloud Functions calculateLeadScore, getLeads готови.',
      enDesc: 'LeadScoringDashboard.tsx component exists but no route. Cloud Functions calculateLeadScore, getLeads ready.'
    },
    {
      id: 'quick-replies',
      icon: Zap,
      title: language === 'bg' ? 'Бързи отговори' : 'Quick Replies',
      description: language === 'bg'
        ? 'Компонент QuickReplyManager.tsx съществува, но няма route. Cloud Functions createQuickReply, getQuickReplies готови.'
        : 'QuickReplyManager.tsx component exists but no route. Cloud Functions createQuickReply, getQuickReplies ready.',
      status: 'disconnected' as const,
      path: '/messages/quick-replies',
      bgTitle: 'Бързи отговори',
      enTitle: 'Quick Replies',
      bgDesc: 'Компонент QuickReplyManager.tsx съществува, но няма route. Cloud Functions createQuickReply, getQuickReplies готови.',
      enDesc: 'QuickReplyManager.tsx component exists but no route. Cloud Functions createQuickReply, getQuickReplies ready.'
    },
    {
      id: 'profile-metrics',
      icon: BarChart3,
      title: language === 'bg' ? 'Метрики на профила' : 'Profile Metrics',
      description: language === 'bg'
        ? 'Cloud Function triggerProfileMetricsAggregation готов, но не е свързан с интерфейса.'
        : 'Cloud Function triggerProfileMetricsAggregation ready but not connected to frontend.',
      status: 'disconnected' as const,
      path: '/profile',
      bgTitle: 'Метрики на профила',
      enTitle: 'Profile Metrics',
      bgDesc: 'Cloud Function triggerProfileMetricsAggregation готов, но не е свързан с интерфейса.',
      enDesc: 'Cloud Function triggerProfileMetricsAggregation ready but not connected to frontend.'
    },
    {
      id: 'stripe-seller',
      icon: CreditCard,
      title: language === 'bg' ? 'Stripe Сметка на продавача' : 'Stripe Seller Account',
      description: language === 'bg'
        ? 'Cloud Functions createStripeSellerAccount, getStripeAccountStatus готови, но няма страница в интерфейса.'
        : 'Cloud Functions createStripeSellerAccount, getStripeAccountStatus ready but no page in frontend.',
      status: 'disconnected' as const,
      path: '/dealer/stripe-setup',
      bgTitle: 'Stripe Сметка на продавача',
      enTitle: 'Stripe Seller Account',
      bgDesc: 'Cloud Functions createStripeSellerAccount, getStripeAccountStatus готови, но няма страница в интерфейса.',
      enDesc: 'Cloud Functions createStripeSellerAccount, getStripeAccountStatus ready but no page in frontend.'
    },
    {
      id: 'profile-analysis',
      icon: Brain,
      title: language === 'bg' ? 'AI Анализ на профил' : 'Profile Analysis AI',
      description: language === 'bg'
        ? 'Cloud Function analyzeProfileAI готов. Има икона в AIDashboardPage.tsx, но не е активиран.'
        : 'Cloud Function analyzeProfileAI ready. Icon exists in AIDashboardPage.tsx but not activated.',
      status: 'disconnected' as const,
      path: '/ai-dashboard',
      bgTitle: 'AI Анализ на профил',
      enTitle: 'Profile Analysis AI',
      bgDesc: 'Cloud Function analyzeProfileAI готов. Има икона в AIDashboardPage.tsx, но не е активиран.',
      enDesc: 'Cloud Function analyzeProfileAI ready. Icon exists in AIDashboardPage.tsx but not activated.'
    },
    {
      id: 'shared-inbox',
      icon: Inbox,
      title: language === 'bg' ? 'Споделена поща' : 'Shared Inbox',
      description: language === 'bg'
        ? 'Cloud Function assignConversation готов, но не е свързан с интерфейса.'
        : 'Cloud Function assignConversation ready but not connected to frontend.',
      status: 'disconnected' as const,
      path: '/admin/shared-inbox',
      bgTitle: 'Споделена поща',
      enTitle: 'Shared Inbox',
      bgDesc: 'Cloud Function assignConversation готов, но не е свързан с интерфейса.',
      enDesc: 'Cloud Function assignConversation ready but not connected to frontend.'
    },
    {
      id: 'auth-users',
      icon: UserCheck,
      title: language === 'bg' ? 'Управление на потребители Auth' : 'Auth Users Management',
      description: language === 'bg'
        ? 'Cloud Functions getAuthUsersCount, getActiveAuthUsers, syncAuthToFirestore готови, но не са свързани.'
        : 'Cloud Functions getAuthUsersCount, getActiveAuthUsers, syncAuthToFirestore ready but not connected.',
      status: 'disconnected' as const,
      path: '/admin/auth-users',
      bgTitle: 'Управление на потребители Auth',
      enTitle: 'Auth Users Management',
      bgDesc: 'Cloud Functions getAuthUsersCount, getActiveAuthUsers, syncAuthToFirestore готови, но не са свързани.',
      enDesc: 'Cloud Functions getAuthUsersCount, getActiveAuthUsers, syncAuthToFirestore ready but not connected.'
    }
  ];

  const handleFeatureClick = (path: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Container $isDark={isDark}>
      <Header $isDark={isDark}>
        <Title $isDark={isDark}>
          {language === 'bg' ? 'Инструменти за разработка' : 'Development Tools'}
        </Title>
        <Subtitle $isDark={isDark}>
          {language === 'bg'
            ? 'Преглед на всички функции, които са готови в Backend, но не са свързани с Frontend'
            : 'Overview of all features ready in Backend but not connected to Frontend'}
        </Subtitle>
      </Header>

      <Grid>
        {features.map((feature) => {
          const Icon = feature.icon;
          const title = language === 'bg' ? feature.bgTitle : feature.enTitle;
          const description = language === 'bg' ? feature.bgDesc : feature.enDesc;

          return (
            <FeatureCard
              key={feature.id}
              $isDark={isDark}
              $status={feature.status}
              onClick={() => handleFeatureClick(feature.path)}
            >
              <CardHeader>
                <IconWrapper $isDark={isDark} $status={feature.status}>
                  <Icon size={24} />
                </IconWrapper>
                <CardContent>
                  <CardTitle $isDark={isDark}>{title}</CardTitle>
                  <CardDescription $isDark={isDark}>{description}</CardDescription>
                </CardContent>
              </CardHeader>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <StatusBadge $status={feature.status}>
                  <AlertCircle size={14} />
                  {feature.status === 'disconnected'
                    ? (language === 'bg' ? 'Несвързано' : 'Disconnected')
                    : (language === 'bg' ? 'Свързано' : 'Connected')}
                </StatusBadge>
                <ActionButton $isDark={isDark}>
                  {language === 'bg' ? 'Отвори' : 'Open'}
                  <ArrowRight size={16} />
                </ActionButton>
              </div>
            </FeatureCard>
          );
        })}
      </Grid>
    </Container>
  );
};

export default DevelopmentToolsPage;

