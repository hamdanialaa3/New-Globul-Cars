/**
 * Competitive Comparison Page
 * مقارنة مع المنصات الأخرى
 * 
 * Shows detailed feature comparison between:
 * - Globul Cars
 * - Competitors (OLX, Mobile.bg, etc)
 * - Highlights unique selling points
 * 
 * @since January 17, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

// ==================== STYLES ====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%);
  padding: 60px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #1f2937;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  line-height: 1.6;
`;

const ComparisonContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  min-width: 800px;

  th, td {
    padding: 18px;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  th {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    font-weight: 700;
    font-size: 15px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  td {
    font-size: 14px;
    color: #4b5563;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background: rgba(59, 130, 246, 0.02);
  }
`;

const FeatureCell = styled.td`
  font-weight: 600;
  color: #1f2937;
  min-width: 180px;
`;

const IconCell = styled.td<{ $hasFeature: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$hasFeature ? '#10b981' : '#ef4444'};
  font-weight: 600;

  svg {
    margin-right: 6px;
  }
`;

const HeaderCell = styled.th`
  text-align: center;
  font-weight: 700;
  font-size: 15px;

  &:first-child {
    text-align: left;
  }
`;

const GlobulCellHeader = styled(HeaderCell)`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 16px;
  font-weight: 800;

  &::after {
    content: ' ⭐';
  }
`;

const DetailSection = styled.section`
  margin-top: 80px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const DetailSectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 30px;
  color: #1f2937;
  text-align: center;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const DetailCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
`;

const DetailCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #10b981;
  }
`;

const DetailCardText = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
`;

const CTAContainer = styled.div`
  text-align: center;
  margin-top: 60px;
  padding: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 16px;
  color: white;
`;

const CTATitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 16px;
`;

const CTASubtitle = styled.p`
  font-size: 16px;
  opacity: 0.95;
  margin-bottom: 24px;
`;

const CTAButton = styled.button`
  padding: 14px 40px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  background: white;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

// ==================== DATA ====================

const comparisonData = {
  bg: {
    title: 'Защо Globul Cars е най-добрата избор',
    subtitle: 'Разгледайте нашите функции в сравнение с популярни конкурентни платформи',
    features: [
      { name: 'Скорост на зареждане', globul: true, competitors: false },
      { name: 'AI ценови препоръки', globul: true, competitors: false },
      { name: 'Верификация на продавача', globul: true, competitors: false },
      { name: 'AI анализ на снимки', globul: true, competitors: false },
      { name: 'Локални банкови преводи', globul: true, competitors: false },
      { name: 'Дърни чат поддръжка', globul: true, competitors: false },
      { name: '24/7 Поддръжка', globul: true, competitors: false },
      { name: 'Скрити комисионни', globul: false, competitors: true }
    ],
    details: [
      {
        title: 'Най-бързата платформа',
        text: 'Всички страници се зареждат за под 2 секунди. Конкурентите имат 5-7 секунди средно.'
      },
      {
        title: 'Интелигентна ценова система',
        text: 'AI препоръчва оптимална цена на базата на пазарния анализ. Други платформи изискват ръчно поставяне на цена.'
      },
      {
        title: 'Верифициран пазар',
        text: 'Всеки продавач преминава чрез EGN/EIK верификация. Други позволяват анонимни продажби.'
      },
      {
        title: 'Локални платежи',
        text: 'iCard и Revolut без скрити такси. Конкурентите събират комисионни от всяка транзакция.'
      }
    ],
    detailsTitle: 'Защо сме различни',
    cta: {
      title: 'Готови да почнете?',
      subtitle: 'Присъединете се към хиляди продавачи и купувачи на Globul Cars',
      button: 'Начинете сега'
    }
  },
  en: {
    title: 'Why Globul Cars is the Best Choice',
    subtitle: 'See our features compared to popular competing platforms',
    features: [
      { name: 'Page Load Speed', globul: true, competitors: false },
      { name: 'AI Price Suggestions', globul: true, competitors: false },
      { name: 'Seller Verification', globul: true, competitors: false },
      { name: 'AI Image Analysis', globul: true, competitors: false },
      { name: 'Local Bank Transfers', globul: true, competitors: false },
      { name: '24/7 Live Support', globul: true, competitors: false },
      { name: 'Arabic/Bulgarian Support', globul: true, competitors: false },
      { name: 'Hidden Fees', globul: false, competitors: true }
    ],
    details: [
      {
        title: 'Fastest Platform',
        text: 'All pages load in under 2 seconds. Competitors average 5-7 seconds.'
      },
      {
        title: 'Smart Pricing System',
        text: 'AI recommends optimal price based on market analysis. Other platforms require manual pricing.'
      },
      {
        title: 'Verified Marketplace',
        text: 'Every seller passes EGN/EIK verification. Competitors allow anonymous sales.'
      },
      {
        title: 'Local Payments',
        text: 'iCard and Revolut with no hidden fees. Competitors charge commissions on every transaction.'
      }
    ],
    detailsTitle: 'What Makes Us Different',
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of sellers and buyers on Globul Cars',
      button: 'Start Now'
    }
  }
};

// ==================== MAIN COMPONENT ====================

export const CompetitiveComparisonPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const data = language === 'bg' ? comparisonData.bg : comparisonData.en;

  return (
    <PageContainer>
      <Header>
        <Title>{data.title}</Title>
        <Subtitle>{data.subtitle}</Subtitle>
      </Header>

      {/* Comparison Table */}
      <ComparisonContainer>
        <Table>
          <thead>
            <tr>
              <HeaderCell>{language === 'bg' ? 'Функция' : 'Feature'}</HeaderCell>
              <GlobulCellHeader>Globul Cars</GlobulCellHeader>
              <HeaderCell>{language === 'bg' ? 'Конкуренти' : 'Competitors'}</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {data.features.map((feature, idx) => (
              <tr key={idx}>
                <FeatureCell>{feature.name}</FeatureCell>
                <IconCell $hasFeature={feature.globul}>
                  {feature.globul ? (
                    <>
                      <CheckCircle size={20} />
                      {language === 'bg' ? 'Да' : 'Yes'}
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      {language === 'bg' ? 'Не' : 'No'}
                    </>
                  )}
                </IconCell>
                <IconCell $hasFeature={feature.competitors}>
                  {feature.competitors ? (
                    <>
                      <CheckCircle size={20} />
                      {language === 'bg' ? 'Да' : 'Yes'}
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      {language === 'bg' ? 'Не' : 'No'}
                    </>
                  )}
                </IconCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </ComparisonContainer>

      {/* Details Section */}
      <DetailSection>
        <DetailSectionTitle>{data.detailsTitle}</DetailSectionTitle>
        <DetailGrid>
          {data.details.map((detail, idx) => (
            <DetailCard key={idx}>
              <DetailCardTitle>
                <CheckCircle size={20} />
                {detail.title}
              </DetailCardTitle>
              <DetailCardText>{detail.text}</DetailCardText>
            </DetailCard>
          ))}
        </DetailGrid>
      </DetailSection>

      {/* CTA Section */}
      <CTAContainer>
        <CTATitle>{data.cta.title}</CTATitle>
        <CTASubtitle>{data.cta.subtitle}</CTASubtitle>
        <CTAButton onClick={() => navigate('/browse')}>
          {data.cta.button}
        </CTAButton>
      </CTAContainer>
    </PageContainer>
  );
};

export default CompetitiveComparisonPage;
