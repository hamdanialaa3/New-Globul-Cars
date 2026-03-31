/**
 * Subscription Dashboard Component
 * Shows current plan, usage, renewal date, payment history, and actions
 * 
 * File: src/components/subscription/SubscriptionDashboard.tsx
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Crown, Zap, Building2, Check, ArrowRight, Calendar,
  CreditCard, TrendingUp, AlertTriangle, Shield, ChevronRight,
  BarChart3, Bot, Upload, Users, Star, Package
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import { logger } from '@/services/logger-service';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';
import { db } from '@/firebase/firebase-config';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==================== STYLED COMPONENTS ====================

const DashboardContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const DashboardTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PlanCard = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, ${p => p.$color} 0%, ${p => p.$color}dd 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const PlanInfo = styled.div``;

const PlanTierName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlanPrice = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const PlanBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
`;

const UsageSection = styled.div`
  position: relative;
  z-index: 1;
`;

const UsageLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  opacity: 0.9;
`;

const UsageBarTrack = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  height: 10px;
  overflow: hidden;
`;

const UsageBarFill = styled.div<{ $pct: number; $warning: boolean }>`
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s ease;
  width: ${p => Math.min(p.$pct, 100)}%;
  background: ${p => p.$warning 
    ? 'linear-gradient(90deg, #fbbf24, #ef4444)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
`;

const UsageWarning = styled.p`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const Section = styled.div`
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RenewalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-secondary);

  &:last-child { border-bottom: none; }
`;

const RenewalLabel = styled.span`
  font-size: 0.95rem;
  color: var(--text-secondary);
`;

const RenewalValue = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const FeatureItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${p => p.$active ? 'var(--text-primary)' : 'var(--text-muted)'};
  opacity: ${p => p.$active ? 1 : 0.5};

  svg {
    flex-shrink: 0;
    color: ${p => p.$active ? '#10b981' : 'var(--text-muted)'};
  }
`;

const PaymentRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-secondary);

  &:last-child { border-bottom: none; }
`;

const PaymentDate = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const PaymentAmount = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const PaymentStatus = styled.span<{ $status: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: ${p => {
    if (p.$status === 'succeeded') return 'rgba(16, 185, 129, 0.1)';
    if (p.$status === 'pending') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  }};
  color: ${p => {
    if (p.$status === 'succeeded') return '#10b981';
    if (p.$status === 'pending') return '#f59e0b';
    return '#ef4444';
  }};
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px solid transparent;

  ${p => p.$variant === 'primary' && css`
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    color: white;
    &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3); }
  `}

  ${p => p.$variant === 'secondary' && css`
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--border-primary);
    &:hover { border-color: var(--accent-primary); }
  `}

  ${p => p.$variant === 'danger' && css`
    background: transparent;
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
    &:hover { background: rgba(239, 68, 68, 0.05); border-color: #ef4444; }
  `}
`;

const EmptyState = styled.p`
  text-align: center;
  color: var(--text-muted);
  padding: 1rem;
  font-size: 0.9rem;
`;

// ==================== TYPES ====================

interface PaymentEvent {
  date: string;
  amount: string;
  status: string;
}

// ==================== COMPONENT ====================

interface SubscriptionDashboardProps {
  onUpgrade?: () => void;
  onCancel?: () => void;
  onManagePayment?: () => void;
}

export const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = ({
  onUpgrade,
  onCancel,
  onManagePayment
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { planTier, permissions } = useProfileType();

  const [subscriptionData, setSubscriptionData] = useState<{
    status: string;
    renewalDate: string | null;
    startDate: string | null;
    cancelAtPeriodEnd: boolean;
  }>({ status: 'active', renewalDate: null, startDate: null, cancelAtPeriodEnd: false });

  const [payments, setPayments] = useState<PaymentEvent[]>([]);
  const [activeListings, setActiveListings] = useState(0);

  useEffect(() => {
    if (currentUser?.uid) {
      loadSubscriptionData();
      loadPaymentHistory();
      loadListingsCount();
    }
  }, [currentUser?.uid]);

  const loadSubscriptionData = async () => {
    if (!currentUser?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const data = userDoc.data();
      if (data?.subscription) {
        setSubscriptionData({
          status: data.subscription.status || 'active',
          renewalDate: data.subscription.currentPeriodEnd
            ? new Date(data.subscription.currentPeriodEnd.seconds * 1000).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')
            : null,
          startDate: data.subscription.startedAt
            ? new Date(data.subscription.startedAt.seconds * 1000).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')
            : null,
          cancelAtPeriodEnd: data.subscription.cancelAtPeriodEnd || false,
        });
      }
    } catch (err) {
      logger.error('Error loading subscription data', err as Error);
    }
  };

  const loadPaymentHistory = async () => {
    if (!currentUser?.uid) return;
    try {
      const eventsRef = collection(db, 'users', currentUser.uid, 'subscription_events');
      const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(10));
      const snap = await getDocs(q);
      const items: PaymentEvent[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.type === 'payment_succeeded' || d.type === 'payment_failed' || d.type === 'created') {
          items.push({
            date: d.timestamp?.toDate
              ? d.timestamp.toDate().toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')
              : '—',
            amount: d.metadata?.amount ? `€${d.metadata.amount}` : '—',
            status: d.type === 'payment_succeeded' ? 'succeeded' : d.type === 'payment_failed' ? 'failed' : 'succeeded',
          });
        }
      });
      setPayments(items);
    } catch (err) {
      logger.error('Error loading payment history', err as Error);
    }
  };

  const loadListingsCount = async () => {
    if (!currentUser?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const data = userDoc.data();
      setActiveListings(data?.activeListingsCount || 0);
    } catch (err) {
      logger.error('Error loading listings count', err as Error);
    }
  };

  const plan = SUBSCRIPTION_PLANS[planTier] || SUBSCRIPTION_PLANS.free;
  const maxListings = plan.features.maxListings;
  const usagePct = maxListings === -1 ? 0 : (activeListings / maxListings) * 100;
  const isNearLimit = maxListings !== -1 && usagePct >= 80;

  const planColor = planTier === 'company' ? '#8b5cf6' : planTier === 'dealer' ? '#0066cc' : '#6b7280';
  const PlanIconComponent = planTier === 'company' ? Building2 : planTier === 'dealer' ? Crown : Zap;

  const t = language === 'bg' ? {
    title: 'Управление на абонамента',
    currentPlan: 'Текущ план',
    status: 'Статус',
    renewalDate: 'Дата на подновяване',
    startDate: 'Начало на абонамента',
    usage: 'Използване на обяви',
    ofListings: 'обяви',
    unlimited: 'Неограничено',
    nearLimit: 'Приближавате лимита! Помислете за ъпгрейд.',
    myFeatures: 'Функции на моя план',
    paymentHistory: 'История на плащанията',
    noPayments: 'Няма записани плащания.',
    actions: 'Действия',
    upgrade: 'Надградете плана',
    managePayment: 'Управление на плащанията',
    cancel: 'Отмяна на абонамента',
    active: 'Активен',
    trialing: 'Пробен период',
    pastDue: 'Просрочен',
    canceled: 'Отменен',
    cancelPending: 'Ще бъде отменен в края на периода',
    perMonth: '/месец',
    features: {
      listings: 'Обяви',
      vipBadge: 'VIP значка',
      aiAnalysis: 'AI анализ',
      chatbot: 'AI чатбот',
      editMakeModel: 'Редакция марка/модел',
      bulkUpload: 'Масово качване',
      prioritySupport: 'Приоритетна поддръжка',
      analytics: 'Разширена аналитика',
      apiAccess: 'API достъп',
      customBranding: 'Персонализирано брандиране',
      accountManager: 'Персонален мениджър',
      csvExport: 'CSV експорт',
    }
  } : {
    title: 'Subscription Management',
    currentPlan: 'Current Plan',
    status: 'Status',
    renewalDate: 'Renewal Date',
    startDate: 'Subscription Start',
    usage: 'Listing Usage',
    ofListings: 'listings',
    unlimited: 'Unlimited',
    nearLimit: 'Approaching limit! Consider upgrading.',
    myFeatures: 'My Plan Features',
    paymentHistory: 'Payment History',
    noPayments: 'No payments recorded.',
    actions: 'Actions',
    upgrade: 'Upgrade Plan',
    managePayment: 'Manage Payments',
    cancel: 'Cancel Subscription',
    active: 'Active',
    trialing: 'Trial',
    pastDue: 'Past Due',
    canceled: 'Canceled',
    cancelPending: 'Will cancel at end of period',
    perMonth: '/month',
    features: {
      listings: 'Listings',
      vipBadge: 'VIP Badge',
      aiAnalysis: 'AI Analysis',
      chatbot: 'AI Chatbot',
      editMakeModel: 'Edit Make/Model',
      bulkUpload: 'Bulk Upload',
      prioritySupport: 'Priority Support',
      analytics: 'Advanced Analytics',
      apiAccess: 'API Access',
      customBranding: 'Custom Branding',
      accountManager: 'Account Manager',
      csvExport: 'CSV Export',
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: t.active,
      trialing: t.trialing,
      past_due: t.pastDue,
      canceled: t.canceled,
    };
    return labels[status] || status;
  };

  const featureChecks = [
    { label: t.features.listings, active: true, detail: maxListings === -1 ? t.unlimited : `${maxListings}` },
    { label: t.features.vipBadge, active: planTier !== 'free' },
    { label: t.features.aiAnalysis, active: permissions.canUseAI },
    { label: t.features.chatbot, active: permissions.canUseChatbot },
    { label: t.features.editMakeModel, active: permissions.canEditMakeModel },
    { label: t.features.bulkUpload, active: planTier === 'company' },
    { label: t.features.prioritySupport, active: planTier !== 'free' },
    { label: t.features.analytics, active: planTier !== 'free' },
    { label: t.features.apiAccess, active: planTier === 'company' },
    { label: t.features.customBranding, active: planTier === 'company' },
    { label: t.features.accountManager, active: planTier === 'company' },
    { label: t.features.csvExport, active: planTier === 'company' },
  ];

  return (
    <DashboardContainer>
      <DashboardTitle>
        <Package size={24} />
        {t.title}
      </DashboardTitle>

      {/* Plan Card */}
      <PlanCard $color={planColor}>
        <PlanHeader>
          <PlanInfo>
            <PlanTierName>
              <PlanIconComponent size={24} />
              {plan.name[language] || plan.name.en}
            </PlanTierName>
            <PlanPrice>
              €{plan.price.monthly}{t.perMonth}
            </PlanPrice>
          </PlanInfo>
          <PlanBadge>{getStatusLabel(subscriptionData.status)}</PlanBadge>
        </PlanHeader>

        {/* Usage bar */}
        {maxListings !== -1 ? (
          <UsageSection>
            <UsageLabel>
              <span>{t.usage}</span>
              <span>{activeListings} / {maxListings} {t.ofListings}</span>
            </UsageLabel>
            <UsageBarTrack>
              <UsageBarFill $pct={usagePct} $warning={isNearLimit} />
            </UsageBarTrack>
            {isNearLimit && (
              <UsageWarning>
                <AlertTriangle size={14} />
                {t.nearLimit}
              </UsageWarning>
            )}
          </UsageSection>
        ) : (
          <UsageSection>
            <UsageLabel>
              <span>{t.usage}</span>
              <span>{t.unlimited}</span>
            </UsageLabel>
          </UsageSection>
        )}
      </PlanCard>

      {/* Renewal Info */}
      <Section>
        <SectionTitle>
          <Calendar size={18} />
          {t.currentPlan}
        </SectionTitle>
        <RenewalRow>
          <RenewalLabel>{t.status}</RenewalLabel>
          <RenewalValue>{getStatusLabel(subscriptionData.status)}</RenewalValue>
        </RenewalRow>
        {subscriptionData.startDate && (
          <RenewalRow>
            <RenewalLabel>{t.startDate}</RenewalLabel>
            <RenewalValue>{subscriptionData.startDate}</RenewalValue>
          </RenewalRow>
        )}
        {subscriptionData.renewalDate && (
          <RenewalRow>
            <RenewalLabel>{t.renewalDate}</RenewalLabel>
            <RenewalValue>{subscriptionData.renewalDate}</RenewalValue>
          </RenewalRow>
        )}
        {subscriptionData.cancelAtPeriodEnd && (
          <RenewalRow>
            <RenewalLabel />
            <RenewalValue style={{ color: '#ef4444' }}>{t.cancelPending}</RenewalValue>
          </RenewalRow>
        )}
      </Section>

      {/* My Plan Features */}
      <Section>
        <SectionTitle>
          <Star size={18} />
          {t.myFeatures}
        </SectionTitle>
        <FeaturesGrid>
          {featureChecks.map((f, i) => (
            <FeatureItem key={i} $active={f.active}>
              <Check size={16} />
              {f.label}
              {f.detail && ` (${f.detail})`}
            </FeatureItem>
          ))}
        </FeaturesGrid>
      </Section>

      {/* Payment History */}
      <Section>
        <SectionTitle>
          <CreditCard size={18} />
          {t.paymentHistory}
        </SectionTitle>
        {payments.length > 0 ? payments.map((p, i) => (
          <PaymentRow key={i}>
            <PaymentDate>{p.date}</PaymentDate>
            <PaymentAmount>{p.amount}</PaymentAmount>
            <PaymentStatus $status={p.status}>{p.status}</PaymentStatus>
          </PaymentRow>
        )) : (
          <EmptyState>{t.noPayments}</EmptyState>
        )}
      </Section>

      {/* Actions */}
      <Section>
        <SectionTitle>
          <ChevronRight size={18} />
          {t.actions}
        </SectionTitle>
        <ActionsGrid>
          {planTier !== 'company' && (
            <ActionButton $variant="primary" onClick={onUpgrade}>
              <TrendingUp size={18} />
              {t.upgrade}
            </ActionButton>
          )}
          <ActionButton $variant="secondary" onClick={onManagePayment}>
            <CreditCard size={18} />
            {t.managePayment}
          </ActionButton>
          {planTier !== 'free' && (
            <ActionButton $variant="danger" onClick={onCancel}>
              {t.cancel}
            </ActionButton>
          )}
        </ActionsGrid>
      </Section>
    </DashboardContainer>
  );
};

export default SubscriptionDashboard;
