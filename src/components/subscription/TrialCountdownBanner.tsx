/**
 * Trial Countdown Banner Component
 * Urgency-driven conversion banner for trial users
 * 
 * File: src/components/subscription/TrialCountdownBanner.tsx
 * Created: January 8, 2026
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Clock, Zap, Crown, Gift, ArrowRight, X, AlertTriangle,
  Sparkles, Star, Check, Timer
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ==================== ANIMATIONS ====================

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const countdown = keyframes`
  0% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
`;

// ==================== STYLED COMPONENTS ====================

const BannerContainer = styled.div<{ $urgency: 'low' | 'medium' | 'high' | 'critical' }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  
  ${p => {
    switch (p.$urgency) {
      case 'critical':
        return css`
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          animation: ${glow} 2s infinite;
        `;
      case 'high':
        return css`
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        `;
      case 'medium':
        return css`
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        `;
      default:
        return css`
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        `;
    }
  }}
  
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }
`;

const TimerSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TimerIcon = styled.div<{ $critical: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
    ${p => p.$critical && css`
      animation: ${shake} 0.5s ease-in-out infinite;
    `}
  }
`;

const CountdownDisplay = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TimeValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  min-width: 56px;
  text-align: center;
  animation: ${countdown} 1s ease-out;
`;

const TimeLabel = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 0.25rem;
`;

const TimeSeparator = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  align-self: flex-start;
  padding-top: 0.5rem;
`;

const MessageSection = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    order: -1;
  }
`;

const MessageTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MessageText = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
`;

const OfferSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const OfferBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CTAButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: white;
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// Alternative: Floating Banner
const FloatingBanner = styled.div<{ $urgency: 'low' | 'medium' | 'high' | 'critical' }>`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  max-width: 380px;
  padding: 1.25rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  ${p => {
    switch (p.$urgency) {
      case 'critical':
        return css`
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          animation: ${glow} 2s infinite;
        `;
      case 'high':
        return css`
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        `;
      default:
        return css`
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        `;
    }
  }}
  
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 640px) {
    right: 16px;
    left: 16px;
    max-width: none;
  }
`;

const FloatingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FloatingTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: white;
  flex: 1;
`;

const FloatingCountdown = styled.div`
  display: flex;
  gap: 0.35rem;
`;

const FloatingTimeBox = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
  min-width: 36px;
  text-align: center;
`;

const FloatingMessage = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
`;

const FloatingCTA = styled.button`
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 12px;
  background: white;
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
`;

// ==================== TYPES ====================

interface TrialCountdownBannerProps {
  trialEndDate: Date;
  discountPercent?: number;
  variant?: 'bar' | 'floating';
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

// ==================== COMPONENT ====================

export const TrialCountdownBanner: React.FC<TrialCountdownBannerProps> = ({
  trialEndDate,
  discountPercent = 20,
  variant = 'bar',
  onUpgrade,
  onDismiss
}) => {
  const { language } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const t = {
    bg: {
      days: 'ДНИ',
      hours: 'ЧАСА',
      minutes: 'МИН',
      seconds: 'СЕК',
      trialEnding: 'Пробният период изтича!',
      trialEndingSoon: 'Остават само няколко дни!',
      upgradeNow: 'Надгради Сега',
      save: 'Спести',
      messages: {
        critical: 'Часове до края! Не губи достъпа до всичките си обяви.',
        high: 'Пробният ти период изтича скоро. Надгради сега с отстъпка!',
        medium: 'Остават ти няколко дни безплатен достъп. Готов ли си да продължиш?',
        low: 'Добре дошъл! Наслаждавай се на безплатния пробен период.'
      },
      specialOffer: 'Специална оферта',
      lastChance: 'Последен шанс!'
    },
    en: {
      days: 'DAYS',
      hours: 'HOURS',
      minutes: 'MIN',
      seconds: 'SEC',
      trialEnding: 'Trial Period Ending!',
      trialEndingSoon: 'Only a few days left!',
      upgradeNow: 'Upgrade Now',
      save: 'Save',
      messages: {
        critical: "Hours left! Don't lose access to all your listings.",
        high: 'Your trial is ending soon. Upgrade now with a discount!',
        medium: 'You have a few days of free access left. Ready to continue?',
        low: 'Welcome! Enjoy your free trial period.'
      },
      specialOffer: 'Special Offer',
      lastChance: 'Last Chance!'
    }
  };

  const text = t[language] || t.en;

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = trialEndDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [trialEndDate]);

  // Determine urgency level
  const urgency = useMemo((): 'low' | 'medium' | 'high' | 'critical' => {
    const totalHours = timeLeft.days * 24 + timeLeft.hours;
    if (totalHours <= 24) return 'critical';
    if (totalHours <= 72) return 'high';
    if (totalHours <= 168) return 'medium';
    return 'low';
  }, [timeLeft]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    onUpgrade?.();
  };

  if (dismissed) return null;

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  // Floating variant
  if (variant === 'floating') {
    return (
      <FloatingBanner $urgency={urgency}>
        <CloseButton onClick={handleDismiss}>
          <X />
        </CloseButton>
        
        <FloatingHeader>
          <TimerIcon $critical={urgency === 'critical'}>
            {urgency === 'critical' ? <AlertTriangle /> : <Clock />}
          </TimerIcon>
          <FloatingTitle>
            {urgency === 'critical' ? text.lastChance : text.trialEnding}
          </FloatingTitle>
        </FloatingHeader>

        <FloatingCountdown>
          <FloatingTimeBox>{formatNumber(timeLeft.days)}</FloatingTimeBox>
          <FloatingTimeBox>{formatNumber(timeLeft.hours)}</FloatingTimeBox>
          <FloatingTimeBox>{formatNumber(timeLeft.minutes)}</FloatingTimeBox>
          <FloatingTimeBox>{formatNumber(timeLeft.seconds)}</FloatingTimeBox>
        </FloatingCountdown>

        <FloatingMessage>{text.messages[urgency]}</FloatingMessage>

        <FloatingCTA onClick={handleUpgrade}>
          <Crown size={18} />
          {text.upgradeNow}
          {discountPercent > 0 && ` - ${text.save} ${discountPercent}%`}
        </FloatingCTA>
      </FloatingBanner>
    );
  }

  // Bar variant (default)
  return (
    <BannerContainer $urgency={urgency}>
      <CloseButton onClick={handleDismiss}>
        <X />
      </CloseButton>

      <TimerSection>
        <TimerIcon $critical={urgency === 'critical'}>
          {urgency === 'critical' ? <AlertTriangle /> : <Timer />}
        </TimerIcon>
        <CountdownDisplay>
          <TimeUnit>
            <TimeValue key={`d-${timeLeft.days}`}>{formatNumber(timeLeft.days)}</TimeValue>
            <TimeLabel>{text.days}</TimeLabel>
          </TimeUnit>
          <TimeSeparator>:</TimeSeparator>
          <TimeUnit>
            <TimeValue key={`h-${timeLeft.hours}`}>{formatNumber(timeLeft.hours)}</TimeValue>
            <TimeLabel>{text.hours}</TimeLabel>
          </TimeUnit>
          <TimeSeparator>:</TimeSeparator>
          <TimeUnit>
            <TimeValue key={`m-${timeLeft.minutes}`}>{formatNumber(timeLeft.minutes)}</TimeValue>
            <TimeLabel>{text.minutes}</TimeLabel>
          </TimeUnit>
          <TimeSeparator>:</TimeSeparator>
          <TimeUnit>
            <TimeValue key={`s-${timeLeft.seconds}`}>{formatNumber(timeLeft.seconds)}</TimeValue>
            <TimeLabel>{text.seconds}</TimeLabel>
          </TimeUnit>
        </CountdownDisplay>
      </TimerSection>

      <MessageSection>
        <MessageTitle>
          {urgency === 'critical' && <AlertTriangle />}
          {urgency === 'critical' ? text.lastChance : text.trialEnding}
        </MessageTitle>
        <MessageText>{text.messages[urgency]}</MessageText>
      </MessageSection>

      <OfferSection>
        {discountPercent > 0 && (
          <OfferBadge>
            <Gift />
            {text.save} {discountPercent}%
          </OfferBadge>
        )}
        <CTAButton onClick={handleUpgrade}>
          <Crown />
          {text.upgradeNow}
          <ArrowRight />
        </CTAButton>
      </OfferSection>
    </BannerContainer>
  );
};

export default TrialCountdownBanner;
