// src/pages/profile/ProfilePage/components/CurrentPlanCard.tsx
// Display current subscription plan in profile

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Crown, TrendingUp, Building2, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useAuth } from '../../../../../contexts/AuthProvider';
import billingService from '../../../../../features/billing/BillingService';
import { Subscription } from '../../../../../features/billing/types';
import { serviceLogger } from '../../../../../services/logger-wrapper';

const Card = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid #bae6fd;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-color: rgba(148, 163, 184, 0.2);
    
    &::before {
      background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    }
  }
  
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
`;

const PlanInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px ${p => p.$color}40;

  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
`;

const PlanDetails = styled.div``;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  transition: color 0.3s ease;
`;

const PlanTier = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  
  transition: color 0.3s ease;
`;

const UpgradeButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const Stat = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  
  transition: color 0.3s ease;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  transition: color 0.3s ease;
`;

const StatExtra = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 4px;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #94a3b8;
  }
  
  transition: color 0.3s ease;
`;

const FreeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);

  svg {
    width: 14px;
    height: 14px;
  }
`;

interface CurrentPlanCardProps {
  profileType: 'private' | 'dealer' | 'company';
}

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({ profileType }) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const isBg = language === 'bg';

  useEffect(() => {
    loadSubscription();
  }, [currentUser]);

  const loadSubscription = async () => {
    if (!currentUser) return;

    try {
      const sub = await billingService.getCurrentSubscription(currentUser.uid);
      setSubscription(sub);
    } catch (error) {
      serviceLogger.error('Error loading subscription', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanConfig = () => {
    const planId = subscription?.planId || 'free';

    const configs: Record<string, { icon: any; color: string; name: string; nameBg: string }> = {
      free: {
        icon: Crown,
        color: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
        name: 'Free',
        nameBg: 'Безплатен',
      },
      premium: {
        icon: Crown,
        color: 'linear-gradient(135deg, #FF8F10 0%, #fb923c 100%)',
        name: 'Premium',
        nameBg: 'Премиум',
      },
      dealer_basic: {
        icon: TrendingUp,
        color: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
        name: 'Dealer Basic',
        nameBg: 'Търговец - Базов',
      },
      dealer_pro: {
        icon: TrendingUp,
        color: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
        name: 'Dealer Pro',
        nameBg: 'Търговец - Про',
      },
      dealer_enterprise: {
        icon: TrendingUp,
        color: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
        name: 'Dealer Enterprise',
        nameBg: 'Търговец - Ентърпрайз',
      },
      company_starter: {
        icon: Building2,
        color: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
        name: 'Company Starter',
        nameBg: 'Компания - Стартер',
      },
      company_pro: {
        icon: Building2,
        color: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
        name: 'Company Pro',
        nameBg: 'Компания - Про',
      },
      company_enterprise: {
        icon: Building2,
        color: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        name: 'Company Enterprise',
        nameBg: 'Компания - Ентърпрайз',
      },
    };

    return configs[planId] || configs.free;
  };

  const getListingLimit = () => {
    const planId = subscription?.planId || 'free';
    const limits: Record<string, number> = {
      free: 3,
      premium: 10,
      dealer_basic: 50,
      dealer_pro: 150,
      dealer_enterprise: -1,
      company_starter: 100,
      company_pro: -1,
      company_enterprise: -1,
    };
    return limits[planId] || 3;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          {isBg ? 'Зареждане...' : 'Loading...'}
        </div>
      </Card>
    );
  }

  const config = getPlanConfig();
  const Icon = config.icon;
  const listingLimit = getListingLimit();
  const isFree = !subscription || subscription.planId === 'free';

  return (
    <Card>
      <Header>
        <PlanInfo>
          <IconWrapper $color={config.color}>
            <Icon />
          </IconWrapper>
          <PlanDetails>
            <PlanName>{isBg ? config.nameBg : config.name}</PlanName>
            <PlanTier>
              {isFree ? (
                <FreeBadge>
                  <Sparkles />
                  {isBg ? 'Безплатен план' : 'Free Plan'}
                </FreeBadge>
              ) : (
                isBg ? 'Активен план' : 'Active Plan'
              )}
            </PlanTier>
          </PlanDetails>
        </PlanInfo>

        {isFree && (
          <UpgradeButton onClick={() => navigate('/subscription')}>
            {isBg ? 'Надстройте' : 'Upgrade'}
            <ChevronRight />
          </UpgradeButton>
        )}

        {!isFree && (
          <UpgradeButton onClick={() => navigate('/subscription')}>
            {isBg ? 'Управление' : 'Manage'}
            <ChevronRight />
          </UpgradeButton>
        )}
      </Header>

      <Stats>
        <Stat>
          <StatLabel>{isBg ? 'Лимит обяви' : 'Listing Limit'}</StatLabel>
          <StatValue>
            {listingLimit === -1 ? '∞' : listingLimit}
          </StatValue>
          <StatExtra>
            {listingLimit === -1 
              ? (isBg ? 'Неограничено' : 'Unlimited')
              : (isBg ? 'обяви месечно' : 'ads per month')
            }
          </StatExtra>
        </Stat>

        <Stat>
          <StatLabel>{isBg ? 'Статус' : 'Status'}</StatLabel>
          <StatValue style={{ color: subscription?.status === 'active' ? '#22c55e' : '#f59e0b' }}>
            {subscription?.status === 'active' 
              ? (isBg ? '✓ Активен' : '✓ Active')
              : (isBg ? 'Неактивен' : 'Inactive')
            }
          </StatValue>
          <StatExtra>
            {subscription?.currentPeriodEnd 
              ? `${isBg ? 'До' : 'Until'} ${new Date(subscription.currentPeriodEnd).toLocaleDateString(isBg ? 'bg-BG' : 'en-GB')}`
              : (isBg ? 'Завинаги' : 'Forever')
            }
          </StatExtra>
        </Stat>
      </Stats>
    </Card>
  );
};

export default CurrentPlanCard;
