// src/components/subscription/SubscriptionManager.tsx
// B2B Subscription Management Component for Bulgarian Car Marketplace

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { useAuth } from '../../hooks/useAuth';
import styled from 'styled-components';
import { CheckCircle, XCircle, CreditCard, TrendingUp } from 'lucide-react';

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.type === 'success' ? '#10b981' : '#ef4444'};
  background-color: ${props => props.type === 'success' ? '#f0fdf4' : '#fef2f2'};
  color: ${props => props.type === 'success' ? '#166534' : '#dc2626'};
`;

const Card = styled.div<{ highlight?: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: ${props => props.highlight ? '2px solid #3b82f6' : '1px solid #e5e7eb'};
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const Badge = styled.span<{ variant?: 'default' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => props.variant === 'secondary' ? '#f3f4f6' : '#3b82f6'};
  color: ${props => props.variant === 'secondary' ? '#374151' : 'white'};
`;

const Button = styled.button<{ variant?: 'outline' | 'destructive' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  ${props => {
    if (props.variant === 'outline') {
      return `
        background: white;
        border-color: #d1d5db;
        color: #374151;
        &:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
      `;
    } else if (props.variant === 'destructive') {
      return `
        background: #dc2626;
        border-color: #dc2626;
        color: white;
        &:hover {
          background: #b91c1c;
          border-color: #b91c1c;
        }
      `;
    } else {
      return `
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;
        &:hover {
          background: #2563eb;
          border-color: #2563eb;
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const StatusIndicator = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.active ? '#166534' : '#dc2626'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 1rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 0.5rem;

  div {
    height: 100%;
    background: #3b82f6;
    border-radius: 9999px;
    transition: width 0.3s ease;
  }
`;

interface SubscriptionTier {
  name: string;
  price: number;
  features: string[];
  limits: {
    requests_per_month: number;
    concurrent_users: number;
  };
}

interface SubscriptionData {
  hasSubscription: boolean;
  subscriptionId?: string;
  tier?: string;
  status?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  autoRenew?: boolean;
  billingInfo?: any;
  usage?: {
    requestsThisMonth: number;
  };
  features?: string[];
  limits?: any;
}

const SUBSCRIPTION_TIERS: { [key: string]: SubscriptionTier } = {
  basic: {
    name: 'Basic Analytics',
    price: 49.99,
    features: ['basic_analytics', 'market_trends', 'price_history'],
    limits: { requests_per_month: 1000, concurrent_users: 2 }
  },
  premium: {
    name: 'Premium Analytics',
    price: 149.99,
    features: ['basic_analytics', 'advanced_analytics', 'car_valuation', 'dealer_insights', 'export_data'],
    limits: { requests_per_month: 10000, concurrent_users: 10 }
  },
  enterprise: {
    name: 'Enterprise Analytics',
    price: 499.99,
    features: ['premium_analytics', 'custom_analytics', 'api_access', 'priority_support', 'white_label'],
    limits: { requests_per_month: 100000, concurrent_users: 50 }
  }
};

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const getSubscription = httpsCallable(functions, 'getB2BSubscription');
      const result = await getSubscription();
      setSubscription(result.data as SubscriptionData);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setMessage({ type: 'error', text: 'Failed to load subscription details' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleSubscribe = async (tier: string) => {
    setActionLoading(true);
    setMessage(null);

    try {
      // Mock billing info - in real app, this would come from a form
      const billingInfo = {
        companyName: 'Test Company',
        address: 'Sofia, Bulgaria',
        contactEmail: user?.email || ''
      };

      const createSubscription = httpsCallable(functions, 'createB2BSubscription');
      await createSubscription({
        tier,
        billingInfo,
        paymentMethod: 'card',
        autoRenew: true
      });

      setMessage({ type: 'success', text: 'Subscription created successfully! Please complete payment.' });
      await loadSubscription(); // Reload subscription data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create subscription' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription?.subscriptionId) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const cancelSubscription = httpsCallable(functions, 'cancelB2BSubscription');
      await cancelSubscription();
      setMessage({ type: 'success', text: 'Subscription cancelled successfully' });
      await loadSubscription();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to cancel subscription' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgrade = async (newTier: string) => {
    setActionLoading(true);
    setMessage(null);

    try {
      const upgradeSubscription = httpsCallable(functions, 'upgradeB2BSubscription');
      await upgradeSubscription({ newTier });
      setMessage({ type: 'success', text: `Subscription upgraded to ${newTier}!` });
      await loadSubscription();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upgrade subscription' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscription details...</div>;
  }

  return (
    <Container>
      <Header>
        <Title>B2B Analytics Subscriptions</Title>
        <Subtitle>Choose the perfect analytics package for your car dealership business</Subtitle>
      </Header>

      {message && (
        <Message type={message.type}>{message.text}</Message>
      )}

      {/* Current Subscription Status */}
      {subscription?.hasSubscription && (
        <Card highlight>
          <CardHeader>
            <CardTitle>
              <CreditCard size={20} />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tier</p>
                <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
                  {subscription.tier}
                </Badge>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Status</p>
                <StatusIndicator active={subscription.isActive || false}>
                  {subscription.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>{subscription.status}</span>
                </StatusIndicator>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Monthly Usage</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {subscription.usage?.requestsThisMonth || 0} requests
                </p>
              </div>
            </div>

            {subscription.endDate && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Expires</p>
                <p>{subscription.endDate.toLocaleDateString()}</p>
              </div>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              {subscription.isActive && subscription.tier !== 'enterprise' && (
                <Button
                  variant="outline"
                  onClick={() => handleUpgrade(
                    subscription.tier === 'basic' ? 'premium' : 'enterprise'
                  )}
                  disabled={actionLoading}
                >
                  Upgrade
                </Button>
              )}
              {subscription.isActive && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Tiers */}
      <Grid>
        {Object.entries(SUBSCRIPTION_TIERS).map(([tierKey, tier]) => (
          <Card key={tierKey} highlight={subscription?.tier === tierKey}>
            <CardHeader>
              <CardTitle style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                {tier.name}
                {subscription?.tier === tierKey && <Badge>Current</Badge>}
              </CardTitle>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                €{tier.price}
                <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6b7280' }}>/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul style={{ marginBottom: '1rem' }}>
                {tier.features.map((feature, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {feature.replace('_', ' ')}
                    </span>
                  </li>
                ))}
              </ul>

              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                <p>Limits: {tier.limits.requests_per_month.toLocaleString()} requests/month</p>
                <p>Users: {tier.limits.concurrent_users}</p>
              </div>

              {!subscription?.hasSubscription && (
                <Button
                  onClick={() => handleSubscribe(tierKey)}
                  disabled={actionLoading}
                  style={{ width: '100%' }}
                >
                  Subscribe
                </Button>
              )}

              {subscription?.hasSubscription && subscription.tier !== tierKey && (
                <Button
                  onClick={() => handleUpgrade(tierKey)}
                  disabled={actionLoading}
                  variant="outline"
                  style={{ width: '100%' }}
                >
                  Upgrade
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Grid>

      {/* Usage Analytics */}
      {subscription?.hasSubscription && subscription.usage && (
        <Card>
          <CardHeader>
            <CardTitle>
              <TrendingUp size={20} />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>This Month's Requests</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {subscription.usage.requestsThisMonth}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  of {subscription.limits?.requests_per_month} allowed
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Usage Percentage</p>
                <ProgressBar>
                  <div
                    style={{
                      width: `${Math.min(
                        (subscription.usage.requestsThisMonth / (subscription.limits?.requests_per_month || 1)) * 100,
                        100
                      )}%`
                    }}
                  ></div>
                </ProgressBar>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default SubscriptionManager;