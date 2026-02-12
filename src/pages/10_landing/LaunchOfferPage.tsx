/**
 * Launch Offer Page - First Listing Free Campaign
 * صفحة العرض الترويجي للإعلان الأول مجاني
 * 
 * Features:
 * - Show first listing benefits
 * - Promotional countdown timer
 * - Special seller benefits
 * - Easy signup flow
 * 
 * @since January 17, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Gift, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// ==================== STYLES ====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%);
`;

const HeroSection = styled.section`
  padding: 80px 20px;
  text-align: center;
  background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const BadgeBanner = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.95;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CountdownTimer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: 30px 0;
  flex-wrap: wrap;
`;

const CountdownItem = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 16px;
  border-radius: 12px;
  min-width: 80px;
  backdrop-filter: blur(10px);

  strong {
    display: block;
    font-size: 28px;
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
    opacity: 0.8;
    text-transform: uppercase;
  }
`;

const CTAButton = styled.button`
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  background: white;
  color: #ec4899;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const BenefitsSection = styled.section`
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 50px;
  color: #1f2937;

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 30px;
  }
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const BenefitCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
`;

const BenefitIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ec48991a;
  color: #ec4899;
  margin-bottom: 16px;

  svg {
    stroke-width: 2;
  }
`;

const BenefitTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1f2937;
`;

const BenefitDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
`;

const FeatureListSection = styled.section`
  background: linear-gradient(135deg, #f0f4f8 0%, #f5f8fc 100%);
  padding: 50px 20px;
  margin: 60px 0;
`;

const FeatureList = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid #ec4899;
`;

const FeatureItemText = styled.div`
  flex: 1;

  strong {
    display: block;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }

  span {
    font-size: 14px;
    color: #6b7280;
  }
`;

const CTASection = styled.section`
  background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
`;

const CTASectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 20px;
`;

const CTASectionSubtitle = styled.p`
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 30px;
`;

const PrimaryCTAButton = styled(CTAButton)`
  min-width: 240px;
`;

// ==================== DATA ====================

const benefits = {
  bg: [
    {
      icon: Gift,
      title: 'Първо обявление БЕЗПЛАТНО',
      description: 'Публикувайте вашата първа кола напълно безплатно - никакви скрити такси'
    },
    {
      icon: TrendingUp,
      title: 'Приоритетна поддържка',
      description: 'Персонална помощ при публикуване, фотографирането и описание'
    },
    {
      icon: CheckCircle,
      title: 'Премиум позициониране',
      description: 'Вашето обявление получава начален прилив до 1000 преглеждания'
    }
  ],
  en: [
    {
      icon: Gift,
      title: 'First Listing FREE',
      description: 'Publish your first car completely free - no hidden fees or surprises'
    },
    {
      icon: TrendingUp,
      title: 'Priority Support',
      description: 'Personal assistance with listing, photos, and description optimization'
    },
    {
      icon: CheckCircle,
      title: 'Premium Positioning',
      description: 'Your listing gets an initial boost to 1000+ views'
    }
  ]
};

const features = {
  bg: [
    { title: 'Безплатна фотография', text: 'Включена в първото обявление' },
    { title: 'AI описание', text: 'Автоматична генерация на привлекателно описание' },
    { title: 'Верификация', text: 'Бързо преминаване през проверката на платформата' },
    { title: 'Специално значка', text: 'Отметка "Първо обявление" за повече доверие' }
  ],
  en: [
    { title: 'Free Photos', text: 'Professional photo optimization included' },
    { title: 'AI Description', text: 'Automatic engaging description generation' },
    { title: 'Instant Verification', text: 'Fast-track through platform verification' },
    { title: 'Special Badge', text: '\"New Listing\" badge for more trust' }
  ]
};

// ==================== MAIN COMPONENT ====================

export const LaunchOfferPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [days, setDays] = React.useState(14);
  const [hours, setHours] = React.useState(0);

  const currentBenefits = language === 'bg' ? benefits.bg : benefits.en;
  const currentFeatures = language === 'bg' ? features.bg : features.en;

  const copy = {
    bg: {
      badge: '⏰ Limited Time Offer',
      title: 'Продайте вашия первый автомобил БЕЗПЛАТНО',
      subtitle: 'Специално предложение за новите продавачи - първото обявление е напълно безплатно',
      button: 'Начало на продажба',
      sectionTitle: 'Какво получавате'
    },
    en: {
      badge: '⏰ Limited Time Offer',
      title: 'Sell Your First Car FREE',
      subtitle: 'Special offer for new sellers - your first listing is completely free',
      button: 'Start Selling',
      sectionTitle: 'What You Get'
    }
  };

  const currentCopy = language === 'bg' ? copy.bg : copy.en;

  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <BadgeBanner>{currentCopy.badge}</BadgeBanner>
          <HeroTitle>{currentCopy.title}</HeroTitle>
          <HeroSubtitle>{currentCopy.subtitle}</HeroSubtitle>

          <CountdownTimer>
            <CountdownItem>
              <strong>{days}</strong>
              <span>{language === 'bg' ? 'дни' : 'days'}</span>
            </CountdownItem>
            <CountdownItem>
              <strong>{hours}</strong>
              <span>{language === 'bg' ? 'часа' : 'hours'}</span>
            </CountdownItem>
          </CountdownTimer>

          <PrimaryCTAButton onClick={() => {
            if (user) {
              navigate('/sell/auto');
            } else {
              navigate('/register');
            }
          }}>
            {currentCopy.button}
          </PrimaryCTAButton>
        </HeroContent>
      </HeroSection>

      {/* Benefits Section */}
      <BenefitsSection>
        <SectionTitle>{currentCopy.sectionTitle}</SectionTitle>
        <BenefitsGrid>
          {currentBenefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <BenefitCard key={idx}>
                <BenefitIcon>
                  <Icon size={28} />
                </BenefitIcon>
                <BenefitTitle>{benefit.title}</BenefitTitle>
                <BenefitDescription>{benefit.description}</BenefitDescription>
              </BenefitCard>
            );
          })}
        </BenefitsGrid>
      </BenefitsSection>

      {/* Features List */}
      <FeatureListSection>
        <FeatureList>
          {currentFeatures.map((feature, idx) => (
            <FeatureItem key={idx}>
              <CheckCircle size={24} color="#ec4899" />
              <FeatureItemText>
                <strong>{feature.title}</strong>
                <span>{feature.text}</span>
              </FeatureItemText>
            </FeatureItem>
          ))}
        </FeatureList>
      </FeatureListSection>

      {/* Final CTA */}
      <CTASection>
        <CTASectionTitle>
          {language === 'bg' ? 'Готови да начнете?' : 'Ready to Get Started?'}
        </CTASectionTitle>
        <CTASectionSubtitle>
          {language === 'bg'
            ? 'Присъединете се към хиляди продавачи за безплатно'
            : 'Join thousands of sellers selling for free'}
        </CTASectionSubtitle>
        <PrimaryCTAButton onClick={() => {
          if (user) {
            navigate('/sell/auto');
          } else {
            navigate('/register');
          }
        }}>
          {currentCopy.button}
        </PrimaryCTAButton>
      </CTASection>
    </PageContainer>
  );
};

export default LaunchOfferPage;
