/**
 * Grace Period Banner
 * Displays warning when user is in grace period after payment failure
 * 
 * File: src/components/billing/GracePeriodBanner.tsx
 * Created: January 8, 2026
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getGracePeriodStatus, getRetentionOffers } from '@/services/billing/churn-prevention.service';
import type { GracePeriodStatus } from '@/services/billing/churn-prevention.service';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';

export const GracePeriodBanner: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [gracePeriod, setGracePeriod] = useState<GracePeriodStatus | null>(null);
  const [showRetentionOffers, setShowRetentionOffers] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const checkGracePeriod = async () => {
      try {
        const status = await getGracePeriodStatus(currentUser.uid);
        if (status.isActive) {
          setGracePeriod(status);
          logger.info('Grace period active', { userId: currentUser.uid, remainingDays: status.remainingDays });
        }
      } catch (error) {
        logger.error('Failed to check grace period', { error });
      }
    };

    checkGracePeriod();
    
    // Check every hour
    const interval = setInterval(checkGracePeriod, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!gracePeriod || !gracePeriod.isActive) {
    return null;
  }

  const remainingDays = gracePeriod.remainingDays ?? gracePeriod.daysRemaining ?? 0;

  const isUrgent = remainingDays <= 3;
  const isCritical = remainingDays <= 1;

  const getMessage = () => {
    if (language === 'bg') {
      if (isCritical) {
        return `🚨 КРИТИЧНО: Абонаментът ви изтича след ${remainingDays} ден!`;
      }
      if (isUrgent) {
        return `⚠️ ВАЖНО: Абонаментът ви изтича след ${remainingDays} дни`;
      }
      return `ℹ️ Абонаментът ви изтича след ${remainingDays} дни`;
    } else {
      if (isCritical) {
        return `🚨 CRITICAL: Your subscription expires in ${remainingDays} day!`;
      }
      if (isUrgent) {
        return `⚠️ IMPORTANT: Your subscription expires in ${remainingDays} days`;
      }
      return `ℹ️ Your subscription expires in ${remainingDays} days`;
    }
  };

  const getDescription = () => {
    if (language === 'bg') {
      return gracePeriod.reason === 'payment_failed'
        ? 'Плащането ви не успя. Моля актуализирайте методa на плащане или вижте специалните ни оферти.'
        : 'Вашият абонамент скоро ще изтече. Вижте специалните ни оферти за продължаване.';
    } else {
      return gracePeriod.reason === 'payment_failed'
        ? 'Your payment failed. Please update your payment method or check our special offers.'
        : 'Your subscription is expiring soon. Check our special offers to continue.';
    }
  };

  return (
    <>
      <BannerContainer severity={isCritical ? 'critical' : isUrgent ? 'urgent' : 'info'}>
        <BannerIcon>
          {isCritical ? '🚨' : isUrgent ? '⚠️' : 'ℹ️'}
        </BannerIcon>
        
        <BannerContent>
          <BannerTitle>{getMessage()}</BannerTitle>
          <BannerDescription>{getDescription()}</BannerDescription>
          
          <BannerActions>
            <UpdatePaymentButton href="/settings/billing">
              {language === 'bg' ? '💳 Актуализирай Плащане' : '💳 Update Payment'}
            </UpdatePaymentButton>
            <OffersButton onClick={() => setShowRetentionOffers(true)}>
              {language === 'bg' ? '🎁 Виж Оферти' : '🎁 View Offers'}
            </OffersButton>
          </BannerActions>
        </BannerContent>

        <CountdownCircle>
          <CountdownNumber severity={isCritical ? 'critical' : isUrgent ? 'urgent' : 'info'}>
            {remainingDays}
          </CountdownNumber>
          <CountdownLabel>
            {language === 'bg' ? 'дни' : 'days'}
          </CountdownLabel>
        </CountdownCircle>
      </BannerContainer>

      {showRetentionOffers && (
        <RetentionOffersModal 
          userId={currentUser!.uid} 
          onClose={() => setShowRetentionOffers(false)} 
        />
      )}
    </>
  );
};

// Retention Offers Modal (imported component)
const RetentionOffersModal: React.FC<{ userId: string; onClose: () => void }> = ({ 
  userId, 
  onClose 
}) => {
  const { language } = useLanguage();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const fetchedOffers = await getRetentionOffers(userId);
        setOffers(fetchedOffers);
      } catch (error) {
        logger.error('Failed to fetch retention offers', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [userId]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{language === 'bg' ? '🎁 Специални Оферти Само За Вас' : '🎁 Special Offers Just For You'}</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <LoadingMessage>
              {language === 'bg' ? 'Зареждане на оферти...' : 'Loading offers...'}
            </LoadingMessage>
          ) : (
            <OffersGrid>
              {offers.map((offer, idx) => (
                <OfferCard key={idx}>
                  <OfferBadge>{offer.label}</OfferBadge>
                  <OfferTitle>{offer.title[language]}</OfferTitle>
                  <OfferDescription>{offer.description[language]}</OfferDescription>
                  <OfferPrice>
                    {offer.type === 'discount' && (
                      <>
                        <OldPrice>{offer.originalPrice}€</OldPrice>
                        <NewPrice>{offer.newPrice}€/месец</NewPrice>
                      </>
                    )}
                    {offer.type === 'pause' && (
                      <NewPrice>{language === 'bg' ? 'Безплатно' : 'Free'}</NewPrice>
                    )}
                    {offer.type === 'downgrade' && (
                      <NewPrice>{offer.newPrice}€/месец</NewPrice>
                    )}
                  </OfferPrice>
                  <AcceptOfferButton>
                    {language === 'bg' ? 'Приеми Офертата' : 'Accept Offer'}
                  </AcceptOfferButton>
                </OfferCard>
              ))}
            </OffersGrid>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const BannerContainer = styled.div<{ severity: 'info' | 'urgent' | 'critical' }>`
  background: ${(props) =>
    props.severity === 'critical'
      ? 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)'
      : props.severity === 'urgent'
      ? 'linear-gradient(135deg, #ffa502 0%, #ff7f50 100%)'
      : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'};
  color: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.5s ease-out;

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const BannerIcon = styled.div`
  font-size: 40px;
  flex-shrink: 0;
`;

const BannerContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
`;

const BannerDescription = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  opacity: 0.95;
`;

const BannerActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const UpdatePaymentButton = styled.a`
  background: white;
  color: #333;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const OffersButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: white;
    color: #333;
    transform: translateY(-2px);
  }
`;

const CountdownCircle = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CountdownNumber = styled.div<{ severity: 'info' | 'urgent' | 'critical' }>`
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
  animation: ${(props) => props.severity === 'critical' ? 'pulse 1s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;

const CountdownLabel = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;

  h2 {
    margin: 0;
    font-size: 24px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const OffersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const OfferCard = styled.div`
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  }
`;

const OfferBadge = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const OfferTitle = styled.h3`
  font-size: 20px;
  margin: 12px 0;
`;

const OfferDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 12px 0;
`;

const OfferPrice = styled.div`
  margin: 16px 0;
`;

const OldPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 18px;
  margin-right: 8px;
`;

const NewPrice = styled.span`
  color: #2ecc71;
  font-size: 28px;
  font-weight: 700;
`;

const AcceptOfferButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;
