// src/components/BusinessPromoBanner.tsx
// Business Promotion Banner - Premium Professional Design
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR
// Special Offer: 200 EUR → FREE! 🎉

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Sparkles,
  Star,
  Award,
  Target,
  Gift
} from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import BusinessIcon from '../../../../bulgarian-car-marketplace/src/assets/icons/business-card.svg';
import styled, { keyframes } from 'styled-components';

// ==================== ANIMATIONS ====================

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const neonGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 10px #0f0, 0 0 20px #0f0, 0 0 30px #0f0;
  }
  50% { 
    box-shadow: 0 0 20px #0f0, 0 0 30px #0f0, 0 0 40px #0f0, 0 0 50px #0f0;
  }
`;

const neonOff = keyframes`
  0%, 100% { 
    box-shadow: 0 0 10px #ff8c00, 0 0 20px #ff8c00;
  }
  50% { 
    box-shadow: 0 0 15px #ff8c00, 0 0 25px #ff8c00, 0 0 35px #ff8c00;
  }
`;

// ==================== STYLED COMPONENTS ====================

const BannerContainer = styled.div`
  width: 100%;
  background: linear-gradient(135deg, 
    #FF8F10 0%,
    #FF6B00 50%,
    #FF8F10 100%
  );
  padding: 0;
  margin: 0;
  box-shadow: 
    0 8px 32px rgba(255, 143, 16, 0.4),
    0 2px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;
  
  /* Decorative gradient overlays */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.6) 50%,
      transparent 100%
    );
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(0, 0, 0, 0.2) 50%,
      transparent 100%
    );
  }
`;

const BannerInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 32px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
  position: relative;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 18px 20px;
    gap: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 16px 16px;
    gap: 16px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  
  @media (max-width: 1200px) {
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const IconCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.85) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.25),
    inset 0 1px 4px rgba(255, 255, 255, 0.8),
    0 0 0 3px rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  position: relative;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.3),
      transparent
    );
    opacity: 0.8;
  }
  
  svg {
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 2px 4px rgba(255, 143, 16, 0.3));
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 600px;
  
  @media (max-width: 1200px) {
    align-items: center;
    max-width: none;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 1200px) {
    justify-content: center;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.3px;
  text-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.3),
    0 3px 12px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const PremiumBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  font-size: 0.65rem;
  font-weight: 800;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 
    0 3px 10px rgba(255, 215, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
  
  @media (max-width: 1200px) {
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const OldPrice = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: #ff4444;
  position: relative;
  white-space: nowrap;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -3px;
    right: -3px;
    height: 2px;
    background: #ff4444;
    transform: translateY(-50%) rotate(-5deg);
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const NewPrice = styled.span`
  font-size: 1.8rem;
  font-weight: 900;
  color: white;
  text-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.4),
    0 0 16px rgba(255, 255, 255, 0.5);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Description = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const CenterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const BenefitsRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: stretch;
`;

const CTAButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    
    button {
      width: 100%;
    }
  }
`;

const BenefitCard = styled.div`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 110px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      transparent 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.28) 0%,
      rgba(255, 255, 255, 0.18) 100%
    );
    transform: translateY(-4px) scale(1.03);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    
    &::before {
      opacity: 1;
    }
  }
`;

const BenefitIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 16px rgba(255, 215, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.7);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: radial-gradient(circle, 
      rgba(255, 215, 0, 0.3) 0%,
      transparent 70%
    );
  }
  
  svg {
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
`;

const BenefitText = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.3;
`;

const RightSection = styled.div`
  display: none;
  
  @media (max-width: 1200px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
`;

const PrimaryCTA = styled.button`
  padding: 8px 18px;
  background: #3e3e3e;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  white-space: nowrap;
  
  /* Neumorphism outer shadow */
  box-shadow: 
    10px 10px 20px rgba(0, 0, 0, 0.4), 
    -10px -10px 20px rgba(255, 255, 255, 0.1);
  
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Inner container effect */
  &::before {
    content: '';
    position: absolute;
    inset: 3px;
    background: #3e3e3e;
    border-radius: 22px;
    box-shadow: 
      inset 5px 5px 10px rgba(0, 0, 0, 0.4), 
      inset -5px -5px 10px rgba(255, 255, 255, 0.1);
    z-index: -1;
  }
  
  /* Neon knob effect */
  &::after {
    content: '';
    position: absolute;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: #3e3e3e;
    box-shadow: 
      5px 5px 10px rgba(0, 0, 0, 0.5), 
      -5px -5px 10px rgba(255, 255, 255, 0.1),
      0 0 10px #ff8c00, 
      0 0 20px #ff8c00;
    transition: all 0.4s ease;
    z-index: 1;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      12px 12px 24px rgba(0, 0, 0, 0.5), 
      -12px -12px 24px rgba(255, 255, 255, 0.15);
    
    &::after {
      left: calc(100% - 33px);
      box-shadow: 
        5px 5px 10px rgba(0, 0, 0, 0.5), 
        -5px -5px 10px rgba(255, 255, 255, 0.1),
        0 0 10px #0f0, 
        0 0 20px #0f0, 
        0 0 30px #0f0;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  /* Text styles */
  span {
    position: relative;
    z-index: 2;
  }
  
  @media (max-width: 768px) {
    padding: 9px 16px;
    font-size: 0.75rem;
    justify-content: center;
    
    &::after {
      width: 20px;
      height: 20px;
      left: 6px;
    }
    
    &:hover::after {
      left: calc(100% - 26px);
    }
  }
`;

const SecondaryCTA = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 0.7rem;
  }
`;

const MobileBenefits = styled.div`
  display: none;
  
  @media (max-width: 1200px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 16px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MobileBenefitChip = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateX(3px);
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #FFD700;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4));
  }
  
  span {
    font-size: 0.8rem;
    color: white;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

// ==================== COMPONENT ====================

const BusinessPromoBanner: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Target size={18} />,
      text: language === 'bg' ? 'Повече видимост' : 'More Visibility'
    },
    {
      icon: <Star size={18} />,
      text: language === 'bg' ? 'Премиум значка' : 'Premium Badge'
    },
    {
      icon: <Award size={18} />,
      text: language === 'bg' ? 'Множество обяви' : 'Multiple Listings'
    },
    {
      icon: <Shield size={18} />,
      text: language === 'bg' ? 'Приоритетна поддръжка' : 'Priority Support'
    }
  ];

  const handleActivate = () => {
    navigate('/profile?upgrade=business');
  };

  const handleLearnMore = () => {
    navigate('/pricing');
  };

  return (
    <BannerContainer>
      <BannerInner>
        {/* LEFT SECTION - Icon, Title, and Pricing */}
        <LeftSection>
          <IconCircle>
            <img 
              src={BusinessIcon} 
              alt="Business Profile" 
              style={{ 
                width: '40px', 
                height: '40px',
                filter: 'drop-shadow(0 2px 8px rgba(255, 107, 0, 0.3))'
              }} 
            />
          </IconCircle>
          
          <TextContent>
            <TitleRow>
              <Title>
                {language === 'bg' ? 'Бизнес Профил' : 'Business Profile'}
              </Title>
              <PremiumBadge>
                <Sparkles size={12} />
                {language === 'bg' ? 'Премиум' : 'Premium'}
              </PremiumBadge>
            </TitleRow>
            
            <PriceSection>
              <OldPrice>200 EUR</OldPrice>
              <NewPrice>
                <Gift size={22} />
                {language === 'bg' ? 'БЕЗПЛАТНО!' : 'FREE!'}
              </NewPrice>
            </PriceSection>
            
            <Description>
              {language === 'bg'
                ? 'Професионален акаунт за дилъри и компании с всички функции!'
                : 'Professional account for dealers and companies with all features!'}
            </Description>
            
            {/* Mobile Benefits */}
            <MobileBenefits>
              {benefits.map((benefit, index) => (
                <MobileBenefitChip key={index}>
                  {benefit.icon}
                  <span>{benefit.text}</span>
                </MobileBenefitChip>
              ))}
            </MobileBenefits>
          </TextContent>
        </LeftSection>

        {/* CENTER SECTION - Benefits Cards (Desktop Only) */}
        <CenterSection>
          <BenefitsRow>
            {benefits.map((benefit, index) => (
              <BenefitCard key={index}>
                <BenefitIconWrapper>
                  {benefit.icon}
                </BenefitIconWrapper>
                <BenefitText>{benefit.text}</BenefitText>
              </BenefitCard>
            ))}
          </BenefitsRow>
          
          {/* Call to Action Buttons - Centered Below */}
          <CTAButtonsRow>
            <PrimaryCTA onClick={handleActivate}>
              <span>{language === 'bg' ? 'Активирай БЕЗПЛАТНО' : 'Activate FREE'}</span>
            </PrimaryCTA>
            
            <SecondaryCTA onClick={handleLearnMore}>
              {language === 'bg' ? 'Научи повече' : 'Learn More'}
            </SecondaryCTA>
          </CTAButtonsRow>
        </CenterSection>

        {/* RIGHT SECTION - Mobile Only */}
        <RightSection>
          <PrimaryCTA onClick={handleActivate}>
            <span>{language === 'bg' ? 'Активирай БЕЗПЛАТНО' : 'Activate FREE'}</span>
          </PrimaryCTA>
          
          <SecondaryCTA onClick={handleLearnMore}>
            {language === 'bg' ? 'Научи повече' : 'Learn More'}
          </SecondaryCTA>
        </RightSection>
      </BannerInner>
    </BannerContainer>
  );
};

export default memo(BusinessPromoBanner);
