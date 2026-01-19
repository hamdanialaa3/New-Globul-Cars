import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AIAnalysisModal } from '@/components/AICarAnalysis';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';
import type { AIAnalysisCompleteData } from '@/components/AICarAnalysis/AIAnalysisModal';
import type { GeminiCarAnalysisResult, PriceEstimate, EquipmentSuggestions } from '@/types/ai-analysis.types';

const PageShell = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08), transparent 35%),
    radial-gradient(circle at 80% 10%, rgba(147, 51, 234, 0.08), transparent 35%),
    linear-gradient(180deg, rgba(12, 15, 25, 0.95), rgba(18, 22, 35, 0.98));
  padding: 3rem 1rem 3.5rem;

  @media (max-width: 1024px) {
    padding: 2.5rem 1.25rem 3rem;
  }

  @media (max-width: 768px) {
    padding: 2rem 1rem 2.5rem;
  }
`;

const Header = styled.div`
  max-width: 1080px;
  margin: 0 auto 1.75rem auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 0.25rem;

  @media (max-width: 768px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 12, 26, 0.95)')};

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 18, 32, 0.72)')};
  max-width: 720px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const BackLink = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  padding: 0.65rem 1rem;
  border-radius: 0.9rem;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s ease;
  backdrop-filter: blur(12px);

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 768px) {
    width: fit-content;
  }
`;

const Frame = styled.div`
  max-width: 1080px;
  margin: 0 auto;
`;

const AIAnalysisPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const lang = language === 'bg' ? 'bg' : 'en';

  const copy = {
    title: {
      bg: 'AI анализ на автомобил',
      en: 'AI Car Analysis'
    },
    subtitle: {
      bg: 'Качете снимки, оставете AI да разпознае марка, модел и състояние, след което получите ценови предложения.',
      en: 'Upload photos, let AI recognize brand, model, and condition, then get pricing guidance.'
    },
    back: {
      bg: 'Назад',
      en: 'Back'
    }
  };

  const handleComplete = (data: AIAnalysisCompleteData) => {
    logger.info('AI Analysis completed from page view', {
      brand: data.analysisResult.brand.value,
      model: data.analysisResult.model.value
    });

    navigate('/sell/auto?mode=ai', {
      state: {
        aiData: {
          analysisResult: data.analysisResult as GeminiCarAnalysisResult,
          priceEstimates: data.priceEstimates as PriceEstimate[],
          equipmentSuggestions: data.equipmentSuggestions as EquipmentSuggestions,
          uploadedImages: data.uploadedImages
        }
      }
    });
  };

  return (
    <PageShell>
      <Header>
        <div>
          <Title>{copy.title[lang]}</Title>
          <Subtitle>{copy.subtitle[lang]}</Subtitle>
        </div>
        <BackLink onClick={() => navigate(-1)} aria-label={copy.back[lang]}>
          {copy.back[lang]}
        </BackLink>
      </Header>

      <Frame>
        <AIAnalysisModal
          mode="page"
          isOpen
          onClose={() => navigate(-1)}
          onComplete={handleComplete}
        />
      </Frame>
    </PageShell>
  );
};

export default AIAnalysisPage;
