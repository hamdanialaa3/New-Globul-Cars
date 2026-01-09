// src/pages/03_user-pages/billing/BillingPage.tsx
// Plans page with toast-based UX and subscription status display

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { useToast } from '../../../components/Toast';
import { subscriptionService, type BillingInterval } from '../../../services/billing/subscription-service';
import { analyticsService } from '../../../services/analytics/UnifiedAnalyticsService';
import { logger } from '../../../services/logger-service';
import type { SubscriptionInfo } from '../../../types/subscription';

const Container = styled.div`
  max-width: 960px;
  margin: 40px auto;
  padding: 16px;
`;

const StatusBanner = styled.div<{ status?: string }>`
  background: ${(p) => {
    switch (p.status) {
      case 'active': return '#dbeafe';
      case 'canceled': return '#fecaca';
      case 'past_due': return '#fed7aa';
      default: return '#f3f4f6';
    }
  }};
  border-left: 4px solid ${(p) => {
    switch (p.status) {
      case 'active': return '#3b82f6';
      case 'canceled': return '#ef4444';
      case 'past_due': return '#f97316';
      default: return '#9ca3af';
    }
  }};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const StatusText = styled.p`
  margin: 0;
  font-weight: 500;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
`;

const Price = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0 16px;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  display: inline-block;
  background: ${(p) => p.variant === 'danger' ? '#ef4444' : '#2563eb'};
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToggleGroup = styled.div`
  display: inline-flex;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ToggleBtn = styled.button<{active?: boolean}>`
  background: ${(p) => (p.active ? '#2563eb' : 'white')};
  color: ${(p) => (p.active ? 'white' : '#111827')};
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
`;

const ManageSection = styled.section`
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
`;

const BillingPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState<{dealer?: boolean; company?: boolean}>({});
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch subscription status on mount
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchStatus = async () => {
      try {
        setLoadingStatus(true);
        const status = await subscriptionService.getSubscriptionStatus(currentUser.uid);
        setSubscription(status);
      } catch (error: unknown) {
        logger.warn('Failed to fetch subscription status', error as Error);
        // Don't show error to user - just show no subscription state
      } finally {
        setLoadingStatus(false);
      }
    };
    
    fetchStatus();
  }, [currentUser]);

  const startCheckout = async (planId: 'dealer' | 'company') => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    try {
      setLoading((s) => ({ ...s, [planId]: true }));
      analyticsService.trackEvent('billing_checkout_click', { planId, interval });

      const res = await subscriptionService.createCheckoutSession({
        userId: currentUser.uid,
        planId,
        interval,
      });

      window.location.href = res.checkoutUrl;
    } catch (err: any) {
      showToast('error', err?.message || t('billing.checkoutError') || 'Failed to start checkout');
      setLoading((s) => ({ ...s, [planId]: false }));
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    const confirmed = window.confirm(
      t('billing.confirmCancel') || 'Are you sure you want to cancel your subscription at the end of the current period?'
    );
    
    if (!confirmed) return;

    try {
      setCancelLoading(true);
      analyticsService.trackEvent('billing_cancel_click', {});
      
      await subscriptionService.cancelSubscription(currentUser.uid, false);
      
      showToast('success', t('billing.cancelScheduled') || 'Cancellation scheduled at period end');
      
      // Refresh subscription status
      const updatedStatus = await subscriptionService.getSubscriptionStatus(currentUser.uid);
      setSubscription(updatedStatus);
    } catch (err: any) {
      showToast('error', err?.message || t('billing.cancelError') || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
    try {
      analyticsService.trackEvent('billing_portal_click', {});
      const url = await subscriptionService.createBillingPortalLink();
      if (url) {
        window.location.href = url;
      } else {
        showToast('error', t('billing.portalError') || 'Failed to open billing portal');
      }
    } catch (err: any) {
      showToast('error', err?.message || t('billing.portalError') || 'Failed to open billing portal');
    }
  };

  const hasActiveSubscription = subscription && ['active', 'past_due'].includes(subscription.status);

  return (
    <Container>
      <h1>{t('billing.plans') || 'Billing Plans'}</h1>

      {/* Subscription Status Banner */}
      {!loadingStatus && subscription && (
        <StatusBanner status={subscription.status}>
          <StatusText>
            {subscription.status === 'active' && (
              <>
                ✓ {t('billing.activeSubscription') || 'You have an active subscription'}
                {subscription.currentPeriodEnd && (
                  <> · {t('billing.renewsOn') || 'Renews on'} {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <> · {t('billing.willBeCanceled') || 'This subscription will be canceled at the end of the current period'}</>
                )}
              </>
            )}
            {subscription.status === 'canceled' && (
              <>{t('billing.subscriptionCanceled') || 'Your subscription has been canceled'}</>
            )}
            {subscription.status === 'past_due' && (
              <>{t('billing.paymentFailed') || 'Payment failed. Please update your payment method.'}</>
            )}
          </StatusText>
        </StatusBanner>
      )}

      {!hasActiveSubscription && (
        <>
          <h2>{t('billing.selectPlan') || 'Choose a plan'}</h2>
          
          <ToggleGroup>
            <ToggleBtn active={interval === 'monthly'} onClick={() => setInterval('monthly')}>
              {t('billing.monthly') || 'Monthly'}
            </ToggleBtn>
            <ToggleBtn active={interval === 'annual'} onClick={() => setInterval('annual')}>
              {t('billing.annual') || 'Annual'}
            </ToggleBtn>
          </ToggleGroup>

          <Row>
            <Card>
              <Title>{t('billing.dealer') || 'Dealer'}</Title>
              <Price>{interval === 'monthly' ? '€27.78/mo' : '€278/yr'}</Price>
              <Button 
                onClick={() => startCheckout('dealer')} 
                disabled={!!loading.dealer}
              >
                {loading.dealer ? t('common.loading') || 'Loading...' : t('billing.choosePlan') || 'Choose plan'}
              </Button>
            </Card>
            <Card>
              <Title>{t('billing.company') || 'Company'}</Title>
              <Price>{interval === 'monthly' ? '€137.88/mo' : '€1288/yr'}</Price>
              <Button 
                onClick={() => startCheckout('company')} 
                disabled={!!loading.company}
              >
                {loading.company ? t('common.loading') || 'Loading...' : t('billing.choosePlan') || 'Choose plan'}
              </Button>
            </Card>
          </Row>
        </>
      )}

      {/* Manage Subscription Section */}
      {hasActiveSubscription && (
        <ManageSection>
          <h3>{t('billing.manage') || 'Manage Subscription'}</h3>
          <p style={{ color: '#6b7280' }}>
            {t('billing.manageHint') || 'You can cancel your active subscription at the end of the current period.'}
          </p>
          <Button 
            variant="danger"
            onClick={handleCancelSubscription}
            disabled={cancelLoading || subscription.cancelAtPeriodEnd}
          >
            {cancelLoading && (t('common.loading') || 'Loading...')}
            {!cancelLoading && subscription.cancelAtPeriodEnd && (t('billing.cancellationPending') || 'Cancellation pending')}
            {!cancelLoading && !subscription.cancelAtPeriodEnd && (t('billing.cancelAtPeriodEnd') || 'Cancel at period end')}
          </Button>

          {subscription.status === 'past_due' && (
            <div style={{ marginTop: 12 }}>
              <Button onClick={handleOpenBillingPortal}>
                {t('billing.updatePaymentMethod') || 'Update payment method'}
              </Button>
            </div>
          )}
        </ManageSection>
      )}
    </Container>
  );
};

export default BillingPage;
