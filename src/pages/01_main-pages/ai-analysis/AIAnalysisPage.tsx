import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AIAnalysisModal } from '@/components/AICarAnalysis';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';
import type { AIAnalysisCompleteData } from '@/components/AICarAnalysis/AIAnalysisModal';
import type { GeminiCarAnalysisResult, PriceEstimate, EquipmentSuggestions } from '@/types/ai-analysis.types';

const PageShell = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08), transparent 35%),
    radial-gradient(circle at 80% 10%, rgba(147, 51, 234, 0.08), transparent 35%),
    linear-gradient(180deg, rgba(12, 15, 25, 0.95), rgba(18, 22, 35, 0.98));

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  padding: 1.5rem 2rem;
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08), transparent 35%),
    radial-gradient(circle at 80% 10%, rgba(147, 51, 234, 0.08), transparent 35%),
    linear-gradient(180deg, rgba(12, 15, 25, 0.95), rgba(18, 22, 35, 0.98));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.95);
  flex: 1;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  display: none;

  @media (max-width: 768px) {
    display: block;
    font-size: 0.85rem;
  }
`;

const BackLink = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 0.8rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all 0.2s ease;
  backdrop-filter: blur(12px);
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
`;

const Frame = styled.div`
  width: 100%;
  max-width: 900px;
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
    <>
      <Header>
        <Title>{copy.title[lang]}</Title>
        <BackLink onClick={() => navigate(-1)} aria-label={copy.back[lang]}>
          {copy.back[lang]}
        </BackLink>
      </Header>

      <PageShell>
        <Frame>
          <AIAnalysisModal
            mode="page"
            isOpen
            onClose={() => navigate(-1)}
            onComplete={handleComplete}
          />
        </Frame>
      </PageShell>
    </>
  );
};

export default AIAnalysisPage;