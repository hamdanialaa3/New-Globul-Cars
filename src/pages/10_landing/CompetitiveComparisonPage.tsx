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
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

type FeatureStatus = 'yes' | 'no' | 'partial';

interface CompetitorFeature {
  name: string;
  koli: FeatureStatus;
  mobileBg: FeatureStatus;
  carsBg: FeatureStatus;
  autoBg: FeatureStatus;
}

const comparisonData = {
  bg: {
    title: 'Koli One срещу конкуренцията',
    subtitle: 'Обективно сравнение с водещите платформи за автомобили в България — Mobile.bg, Cars.bg и Auto.bg',
    competitors: ['Koli One', 'Mobile.bg', 'Cars.bg', 'Auto.bg'],
    features: [
      { name: 'AI оценка на автомобили', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'no' },
      { name: 'AI анализ на снимки', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'no' },
      { name: 'Верификация на продавача (ЕГН/ЕИК)', koli: 'yes', mobileBg: 'no', carsBg: 'partial', autoBg: 'no' },
      { name: 'Безплатни обяви (до 10)', koli: 'yes', mobileBg: 'no', carsBg: 'partial', autoBg: 'no' },
      { name: 'Бързо зареждане (< 2 сек)', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'no' },
      { name: 'Модерен мобилен дизайн', koli: 'yes', mobileBg: 'no', carsBg: 'partial', autoBg: 'partial' },
      { name: 'Локални плащания (iCard/Revolut)', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'no' },
      { name: 'Калкулатор за банково финансиране', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'partial' },
      { name: 'Реално време съобщения', koli: 'yes', mobileBg: 'partial', carsBg: 'partial', autoBg: 'partial' },
      { name: 'Голяма база от обяви', koli: 'no', mobileBg: 'yes', carsBg: 'yes', autoBg: 'yes' },
      { name: 'Скрити комисионни', koli: 'no', mobileBg: 'yes', carsBg: 'yes', autoBg: 'yes' },
    ] as CompetitorFeature[],
    details: [
      {
        title: 'AI технология, която няма аналог',
        text: 'Единствената платформа в България с AI оценка на автомобили (Gemini + DeepSeek). Безплатно, без регистрация, с 85-95% точност. Mobile.bg и Cars.bg нямат такава функционалност.'
      },
      {
        title: 'Прозрачност без скрити такси',
        text: 'Koli One предлага до 10 безплатни обяви. На Mobile.bg всяка обява е платена (от 3 до 30 лв.). Cars.bg също събира такси за промотиране.'
      },
      {
        title: 'Модерен дизайн vs. интерфейс от 2010',
        text: 'Сайтовете на Mobile.bg и Cars.bg не са променяни значително от 2010 г. Koli One е изградена с React и зарежда под 2 секунди.'
      },
      {
        title: 'Верифицирани продавачи',
        text: 'Всеки продавач в Koli One преминава ЕГН/ЕИК верификация. Mobile.bg позволява напълно анонимни обяви, което улеснява измамите.'
      }
    ],
    detailsTitle: 'Какво прави Koli One различна',
    cta: {
      title: 'Опитайте Koli One безплатно',
      subtitle: 'Безплатна AI оценка, до 10 обяви без такси, модерна платформа.',
      button: 'Започнете сега'
    }
  },
  en: {
    title: 'Koli One vs. The Competition',
    subtitle: 'Objective comparison with Bulgaria\'s leading car platforms — Mobile.bg, Cars.bg, and Auto.bg',
    competitors: ['Koli One', 'Mobile.bg', 'Cars.bg', 'Auto.bg'],
    features: [
      { name: 'AI Car Valuation', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'no' },
      { name: 'AI Image Analysis', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'no' },
      { name: 'Seller Verification (EGN/EIK)', koli: 'yes', mobileBg: 'no', carsBg: 'partial', autoBg: 'no' },
      { name: 'Free Listings (up to 10)', koli: 'yes', mobileBg: 'no', carsBg: 'partial', autoBg: 'no' },
      { name: 'Fast Load Speed (< 2s)', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'no' },
      { name: 'Modern Mobile Design', koli: 'yes', mobileBg: 'no', carsBg: 'partial', autoBg: 'partial' },
      { name: 'Local Payments (iCard/Revolut)', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'no' },
      { name: 'Bank Financing Calculator', koli: 'yes', mobileBg: 'no', carsBg: 'no', autoBg: 'partial' },
      { name: 'Real-time Messaging', koli: 'yes', mobileBg: 'partial', carsBg: 'partial', autoBg: 'partial' },
      { name: 'Large Listing Database', koli: 'no', mobileBg: 'yes', carsBg: 'yes', autoBg: 'yes' },
      { name: 'Hidden Commissions', koli: 'no', mobileBg: 'yes', carsBg: 'yes', autoBg: 'yes' },
    ] as CompetitorFeature[],
    details: [
      {
        title: 'AI Technology Without Analogue',
        text: 'The only platform in Bulgaria with AI car valuation (Gemini + DeepSeek). Free, no registration, 85-95% accuracy. Mobile.bg and Cars.bg have no such functionality.'
      },
      {
        title: 'Transparency Without Hidden Fees',
        text: 'Koli One offers up to 10 free listings. On Mobile.bg every listing is paid (3-30 BGN). Cars.bg also charges promotion fees.'
      },
      {
        title: 'Modern Design vs. 2010 Interface',
        text: 'Mobile.bg and Cars.bg haven\'t significantly changed since 2010. Koli One is built with React and loads in under 2 seconds.'
      },
      {
        title: 'Verified Sellers',
        text: 'Every seller on Koli One passes EGN/EIK verification. Mobile.bg allows completely anonymous listings, facilitating scams.'
      }
    ],
    detailsTitle: 'What Makes Koli One Different',
    cta: {
      title: 'Try Koli One for Free',
      subtitle: 'Free AI valuation, up to 10 listings with no fees, modern platform.',
      button: 'Start Now'
    }
  }
};

// ==================== HELPERS ====================

const StatusIcon: React.FC<{ status: FeatureStatus; lang: string }> = ({ status, lang }) => {
  if (status === 'yes') return <><CheckCircle size={18} /> {lang === 'bg' ? 'Да' : 'Yes'}</>;
  if (status === 'partial') return <><Minus size={18} /> {lang === 'bg' ? 'Частично' : 'Partial'}</>;
  return <><XCircle size={18} /> {lang === 'bg' ? 'Не' : 'No'}</>;
};

const statusColor = (s: FeatureStatus) => s === 'yes' ? '#10b981' : s === 'partial' ? '#f59e0b' : '#ef4444';

// ==================== MAIN COMPONENT ====================

export const CompetitiveComparisonPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isBg = language === 'bg';

  const data = isBg ? comparisonData.bg : comparisonData.en;

  return (
    <PageContainer>
      <Helmet>
        <title>{isBg ? 'Koli One срещу Mobile.bg, Cars.bg, Auto.bg — Сравнение' : 'Koli One vs Mobile.bg, Cars.bg, Auto.bg — Comparison'}</title>
        <meta name="description" content={data.subtitle} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.subtitle} />
        <link rel="canonical" href="https://koli.one/competitive-comparison" />
      </Helmet>

      <Header>
        <Title>{data.title}</Title>
        <Subtitle>{data.subtitle}</Subtitle>
      </Header>

      {/* Comparison Table */}
      <ComparisonContainer>
        <Table>
          <thead>
            <tr>
              <HeaderCell>{isBg ? 'Функция' : 'Feature'}</HeaderCell>
              <GlobulCellHeader>Koli One</GlobulCellHeader>
              <HeaderCell>Mobile.bg</HeaderCell>
              <HeaderCell>Cars.bg</HeaderCell>
              <HeaderCell>Auto.bg</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {data.features.map((feature, idx) => (
              <tr key={idx}>
                <FeatureCell>{feature.name}</FeatureCell>
                <IconCell $hasFeature={feature.koli === 'yes'} style={{ color: statusColor(feature.koli) }}>
                  <StatusIcon status={feature.koli} lang={language} />
                </IconCell>
                <IconCell $hasFeature={feature.mobileBg === 'yes'} style={{ color: statusColor(feature.mobileBg) }}>
                  <StatusIcon status={feature.mobileBg} lang={language} />
                </IconCell>
                <IconCell $hasFeature={feature.carsBg === 'yes'} style={{ color: statusColor(feature.carsBg) }}>
                  <StatusIcon status={feature.carsBg} lang={language} />
                </IconCell>
                <IconCell $hasFeature={feature.autoBg === 'yes'} style={{ color: statusColor(feature.autoBg) }}>
                  <StatusIcon status={feature.autoBg} lang={language} />
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
        <CTAButton onClick={() => navigate('/valuation')}>
          {data.cta.button}
        </CTAButton>
      </CTAContainer>
    </PageContainer>
  );
};

export default CompetitiveComparisonPage;
