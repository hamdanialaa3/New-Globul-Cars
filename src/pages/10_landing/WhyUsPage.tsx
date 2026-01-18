/**
 * Why Us / Value Proposition Landing Page
 * صفحة القيمة المضافة و المميزات الأساسية
 * 
 * Showcases:
 * - Speed (<2s load)
 * - AI pricing suggestions
 * - Verified sellers
 * - Manual bank payments (local)
 * - Image verification
 * - Bulgarian compliance (EGN/EIK)
 * 
 * @since January 17, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Zap, Brain, Shield, DollarSign, CheckSquare, Verified } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

// ==================== STYLES ====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%);
`;

const HeroSection = styled.section`
  padding: 60px 20px;
  text-align: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
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

const CTAButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled.button<{ $primary?: boolean }>`
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.$primary ? `
    background: white;
    color: #3b82f6;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
  ` : `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
  `}
`;

const FeaturesSection = styled.section`
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

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FeatureCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    border-color: #3b82f6;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    border-radius: 16px 16px 0 0;
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: left;
  }

  &:hover::before {
    transform: scaleX(1);
  }
`;

const FeatureIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  margin-bottom: 16px;

  svg {
    stroke-width: 2;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1f2937;
`;

const FeatureDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
`;

const StatsSection = styled.section`
  background: linear-gradient(135deg, #f0f4f8 0%, #f5f8fc 100%);
  padding: 50px 20px;
  margin: 60px 0;
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
`;

const ComparisonSection = styled.section`
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
`;

const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  th {
    background: #f9fafb;
    font-weight: 700;
    color: #1f2937;
    font-size: 14px;
  }

  tr:last-child td {
    border-bottom: none;
  }

  td {
    font-size: 14px;
    color: #6b7280;
  }
`;

const CheckIcon = styled.span`
  color: #10b981;
  font-weight: 700;
  font-size: 18px;
`;

const CrossIcon = styled.span`
  color: #ef4444;
  font-weight: 700;
  font-size: 18px;
`;

const CTASection = styled.section`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  margin-top: 60px;
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
  background: white;
  color: #3b82f6;
  padding: 16px 40px;
  font-size: 16px;
  min-width: 240px;
`;

// ==================== DATA ====================

const features = {
  bg: [
    {
      icon: Zap,
      color: '#f59e0b',
      title: 'Невероятна скорост',
      description: 'Всички страници се зареждат за под 2 секунди. Оптимизирано за всеки тип връзка.'
    },
    {
      icon: Brain,
      color: '#3b82f6',
      title: 'AI ценови препоръки',
      description: 'Интелигентна система препоръчва оптимална цена на базата на пазарния анализ.'
    },
    {
      icon: CheckSquare,
      color: '#10b981',
      title: 'Проверка на снимки',
      description: 'AI анализира всяка снимка за качество, автентичност и условие на автомобила.'
    },
    {
      icon: Shield,
      color: '#8b5cf6',
      title: 'Верифицирани продавачи',
      description: 'Всеки продавач преминава чрез EGN/EIK верификация и събира доверителни значки.'
    },
    {
      icon: DollarSign,
      color: '#ec4899',
      title: 'Локални банкови преводи',
      description: 'iCard и Revolut платежи. Никакви скрити комисионни или скъпи услуги.'
    },
    {
      icon: Verified,
      color: '#06b6d4',
      title: 'Българска съответствие',
      description: 'Пълна съответствие с местното законодателство и регулации за автомобилния пазар.'
    }
  ],
  en: [
    {
      icon: Zap,
      color: '#f59e0b',
      title: 'Lightning Fast',
      description: 'All pages load in under 2 seconds. Optimized for every connection type.'
    },
    {
      icon: Brain,
      color: '#3b82f6',
      title: 'AI Price Suggestions',
      description: 'Smart system recommends optimal price based on market analysis.'
    },
    {
      icon: CheckSquare,
      color: '#10b981',
      title: 'Image Verification',
      description: 'AI analyzes every photo for quality, authenticity, and vehicle condition.'
    },
    {
      icon: Shield,
      color: '#8b5cf6',
      title: 'Verified Sellers',
      description: 'Every seller passes EGN/EIK verification and earns trust badges.'
    },
    {
      icon: DollarSign,
      color: '#ec4899',
      title: 'Local Bank Transfers',
      description: 'iCard and Revolut payments. No hidden fees or expensive services.'
    },
    {
      icon: Verified,
      color: '#06b6d4',
      title: 'Bulgarian Compliance',
      description: 'Full compliance with local laws and regulations for the automotive market.'
    }
  ]
};

// ==================== MAIN COMPONENT ====================

export const WhyUsPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const isArabic = false; // Will implement Arabic translation later
  const currentFeatures = language === 'bg' ? features.bg : features.en;

  const comparisonLabels = {
    bg: {
      feature: 'Характеристика',
      globulCars: 'Globul Cars',
      competitors: 'Конкуренти',
      speed: 'Скорост на зареждане',
      pricing: 'AI ценови препоръки',
      verification: 'Верификация на продавача',
      images: 'AI проверка на снимки',
      payments: 'Локални платежи',
      support: '24/7 Поддръжка'
    },
    en: {
      feature: 'Feature',
      globulCars: 'Globul Cars',
      competitors: 'Competitors',
      speed: 'Page Load Speed',
      pricing: 'AI Price Suggestions',
      verification: 'Seller Verification',
      images: 'AI Image Verification',
      payments: 'Local Payments',
      support: '24/7 Support'
    }
  };

  const labels = language === 'bg' ? comparisonLabels.bg : comparisonLabels.en;

  const heroContent = {
    bg: {
      title: 'Най-бързо, най-прозрачно и най-сигурно място за покупка/продажба на автомобили в България',
      subtitle: 'Верифицирани продавачи, интелигентни цени, локални платежи и пълна прозрачност'
    },
    en: {
      title: 'The fastest, most transparent and safest place to buy/sell cars in Bulgaria',
      subtitle: 'Verified sellers, smart pricing, local payments and complete transparency'
    }
  };

  const buttonLabels = {
    bg: { browse: 'Разгледайте обяви', sell: 'Продайте вашия автомобил' },
    en: { browse: 'Browse Listings', sell: 'Sell Your Car' }
  };

  const hero = language === 'bg' ? heroContent.bg : heroContent.en;
  const buttons = language === 'bg' ? buttonLabels.bg : buttonLabels.en;

  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>{hero.title}</HeroTitle>
          <HeroSubtitle>{hero.subtitle}</HeroSubtitle>
          <CTAButtonsContainer>
            <CTAButton $primary onClick={() => navigate('/browse')}>
              {buttons.browse}
            </CTAButton>
            <CTAButton onClick={() => navigate('/sell/vehicle-type')}>
              {buttons.sell}
            </CTAButton>
          </CTAButtonsContainer>
        </HeroContent>
      </HeroSection>

      {/* Stats Section */}
      <StatsSection>
        <StatsContainer>
          <StatItem>
            <StatNumber>&lt;2s</StatNumber>
            <StatLabel>{language === 'bg' ? 'Време на зареждане' : 'Load Time'}</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>100%</StatNumber>
            <StatLabel>{language === 'bg' ? 'Верифицирани продавачи' : 'Verified Sellers'}</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>AI</StatNumber>
            <StatLabel>{language === 'bg' ? 'Препоръчаща система' : 'Smart Pricing'}</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>24/7</StatNumber>
            <StatLabel>{language === 'bg' ? 'Поддръжка' : 'Support'}</StatLabel>
          </StatItem>
        </StatsContainer>
      </StatsSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionTitle>
          {language === 'bg' ? 'Защо да изберете Globul Cars?' : 'Why Choose Globul Cars?'}
        </SectionTitle>
        <FeaturesGrid>
          {currentFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <FeatureCard key={idx}>
                <FeatureIcon $color={feature.color}>
                  <Icon size={28} />
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            );
          })}
        </FeaturesGrid>
      </FeaturesSection>

      {/* Comparison Section */}
      <ComparisonSection>
        <SectionTitle>
          {language === 'bg' ? 'Сравнение с конкурентите' : 'Comparison with Competitors'}
        </SectionTitle>
        <ComparisonTable>
          <thead>
            <tr>
              <th>{labels.feature}</th>
              <th>{labels.globulCars}</th>
              <th>{labels.competitors}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{labels.speed}</td>
              <td><CheckIcon>✓</CheckIcon> &lt;2s</td>
              <td><CrossIcon>✗</CrossIcon> 5-7s</td>
            </tr>
            <tr>
              <td>{labels.pricing}</td>
              <td><CheckIcon>✓</CheckIcon> Included</td>
              <td><CrossIcon>✗</CrossIcon> Premium</td>
            </tr>
            <tr>
              <td>{labels.verification}</td>
              <td><CheckIcon>✓</CheckIcon> 100%</td>
              <td><CrossIcon>✗</CrossIcon> Limited</td>
            </tr>
            <tr>
              <td>{labels.images}</td>
              <td><CheckIcon>✓</CheckIcon> Auto-verified</td>
              <td><CrossIcon>✗</CrossIcon> Manual</td>
            </tr>
            <tr>
              <td>{labels.payments}</td>
              <td><CheckIcon>✓</CheckIcon> Local only</td>
              <td><CrossIcon>✗</CrossIcon> International fees</td>
            </tr>
            <tr>
              <td>{labels.support}</td>
              <td><CheckIcon>✓</CheckIcon> Available</td>
              <td><CrossIcon>✗</CrossIcon> Limited</td>
            </tr>
          </tbody>
        </ComparisonTable>
      </ComparisonSection>

      {/* CTA Section */}
      <CTASection>
        <CTASectionTitle>
          {language === 'bg' ? 'Готови ли сте да намерите правилния автомобил?' : 'Ready to Find Your Car?'}
        </CTASectionTitle>
        <CTASectionSubtitle>
          {language === 'bg' 
            ? 'Присъединете се към хиляди доволни купувачи и продавачи' 
            : 'Join thousands of satisfied buyers and sellers'}
        </CTASectionSubtitle>
        <PrimaryCTAButton $primary onClick={() => navigate('/browse')}>
          {buttons.browse}
        </PrimaryCTAButton>
      </CTASection>
    </PageContainer>
  );
};

export default WhyUsPage;
