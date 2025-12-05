// Visual Search Page - صفحة البحث المرئي الرئيسية
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { VisualSearchUpload } from '../../components/visual-search/VisualSearchUpload';
import { VisualSearchResult } from '../../services/advanced/visual-search.service';

export const VisualSearchPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleSearchComplete = (result: VisualSearchResult) => {
    navigate('/visual-search-results', { state: { result } });
  };

  return (
    <S.Container>
      {/* Hero Section */}
      <S.Hero>
        <S.HeroContent>
          <S.Badge>{t('visualSearch.badge')}</S.Badge>
          <S.HeroTitle>{t('visualSearch.title')}</S.HeroTitle>
          <S.HeroSubtitle>{t('visualSearch.subtitle')}</S.HeroSubtitle>
          
          <S.HeroFeatures>
            <S.HeroFeature>
              <S.FeatureIcon>📸</S.FeatureIcon>
              <S.FeatureText>{t('visualSearch.heroFeature1')}</S.FeatureText>
            </S.HeroFeature>
            <S.HeroFeature>
              <S.FeatureIcon>🤖</S.FeatureIcon>
              <S.FeatureText>{t('visualSearch.heroFeature2')}</S.FeatureText>
            </S.HeroFeature>
            <S.HeroFeature>
              <S.FeatureIcon>⚡</S.FeatureIcon>
              <S.FeatureText>{t('visualSearch.heroFeature3')}</S.FeatureText>
            </S.HeroFeature>
          </S.HeroFeatures>
        </S.HeroContent>
      </S.Hero>

      {/* Upload Section */}
      <S.UploadSection>
        <VisualSearchUpload onSearchComplete={handleSearchComplete} variant="full" />
      </S.UploadSection>

      {/* How It Works */}
      <S.HowItWorksSection>
        <S.SectionHeader onClick={() => setShowHowItWorks(!showHowItWorks)}>
          <S.SectionTitle>
            <S.Icon>💡</S.Icon>
            {t('visualSearch.howItWorks')}
          </S.SectionTitle>
          <S.ToggleIcon $expanded={showHowItWorks}>
            {showHowItWorks ? '−' : '+'}
          </S.ToggleIcon>
        </S.SectionHeader>

        {showHowItWorks && (
          <S.StepsGrid>
            <S.Step>
              <S.StepNumber>1</S.StepNumber>
              <S.StepIcon>📤</S.StepIcon>
              <S.StepTitle>{t('visualSearch.step1Title')}</S.StepTitle>
              <S.StepText>{t('visualSearch.step1Text')}</S.StepText>
            </S.Step>

            <S.Step>
              <S.StepNumber>2</S.StepNumber>
              <S.StepIcon>🔍</S.StepIcon>
              <S.StepTitle>{t('visualSearch.step2Title')}</S.StepTitle>
              <S.StepText>{t('visualSearch.step2Text')}</S.StepText>
            </S.Step>

            <S.Step>
              <S.StepNumber>3</S.StepNumber>
              <S.StepIcon>🎯</S.StepIcon>
              <S.StepTitle>{t('visualSearch.step3Title')}</S.StepTitle>
              <S.StepText>{t('visualSearch.step3Text')}</S.StepText>
            </S.Step>

            <S.Step>
              <S.StepNumber>4</S.StepNumber>
              <S.StepIcon>✨</S.StepIcon>
              <S.StepTitle>{t('visualSearch.step4Title')}</S.StepTitle>
              <S.StepText>{t('visualSearch.step4Text')}</S.StepText>
            </S.Step>
          </S.StepsGrid>
        )}
      </S.HowItWorksSection>

      {/* Benefits */}
      <S.BenefitsSection>
        <S.SectionTitle>
          <S.Icon>🌟</S.Icon>
          {t('visualSearch.benefits')}
        </S.SectionTitle>

        <S.BenefitsGrid>
          <S.BenefitCard>
            <S.BenefitIcon>⏱️</S.BenefitIcon>
            <S.BenefitTitle>{t('visualSearch.benefit1Title')}</S.BenefitTitle>
            <S.BenefitText>{t('visualSearch.benefit1Text')}</S.BenefitText>
          </S.BenefitCard>

          <S.BenefitCard>
            <S.BenefitIcon>🎯</S.BenefitIcon>
            <S.BenefitTitle>{t('visualSearch.benefit2Title')}</S.BenefitTitle>
            <S.BenefitText>{t('visualSearch.benefit2Text')}</S.BenefitText>
          </S.BenefitCard>

          <S.BenefitCard>
            <S.BenefitIcon>🔒</S.BenefitIcon>
            <S.BenefitTitle>{t('visualSearch.benefit3Title')}</S.BenefitTitle>
            <S.BenefitText>{t('visualSearch.benefit3Text')}</S.BenefitText>
          </S.BenefitCard>

          <S.BenefitCard>
            <S.BenefitIcon>🌍</S.BenefitIcon>
            <S.BenefitTitle>{t('visualSearch.benefit4Title')}</S.BenefitTitle>
            <S.BenefitText>{t('visualSearch.benefit4Text')}</S.BenefitText>
          </S.BenefitCard>
        </S.BenefitsGrid>
      </S.BenefitsSection>

      {/* FAQ */}
      <S.FAQSection>
        <S.SectionTitle>
          <S.Icon>❓</S.Icon>
          {t('visualSearch.faq')}
        </S.SectionTitle>

        <S.FAQList>
          <S.FAQItem>
            <S.Question>{t('visualSearch.faq1Q')}</S.Question>
            <S.Answer>{t('visualSearch.faq1A')}</S.Answer>
          </S.FAQItem>

          <S.FAQItem>
            <S.Question>{t('visualSearch.faq2Q')}</S.Question>
            <S.Answer>{t('visualSearch.faq2A')}</S.Answer>
          </S.FAQItem>

          <S.FAQItem>
            <S.Question>{t('visualSearch.faq3Q')}</S.Question>
            <S.Answer>{t('visualSearch.faq3A')}</S.Answer>
          </S.FAQItem>

          <S.FAQItem>
            <S.Question>{t('visualSearch.faq4Q')}</S.Question>
            <S.Answer>{t('visualSearch.faq4A')}</S.Answer>
          </S.FAQItem>
        </S.FAQList>
      </S.FAQSection>
    </S.Container>
  );
};

// Styled Components
namespace S {
  export const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  `;

  export const Hero = styled.div`
    text-align: center;
    margin-bottom: 60px;
  `;

  export const HeroContent = styled.div`
    max-width: 800px;
    margin: 0 auto;
  `;

  export const Badge = styled.div`
    display: inline-block;
    padding: 8px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;

  export const HeroTitle = styled.h1`
    font-size: 48px;
    color: #333;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 36px;
    }
  `;

  export const HeroSubtitle = styled.p`
    font-size: 20px;
    color: #666;
    margin-bottom: 40px;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 18px;
    }
  `;

  export const HeroFeatures = styled.div`
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
  `;

  export const HeroFeature = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  export const FeatureIcon = styled.span`
    font-size: 24px;
  `;

  export const FeatureText = styled.span`
    font-size: 16px;
    color: #555;
    font-weight: 500;
  `;

  export const UploadSection = styled.div`
    margin-bottom: 80px;
  `;

  export const HowItWorksSection = styled.div`
    margin-bottom: 80px;
    padding: 40px;
    background: linear-gradient(135deg, #667eea08 0%, #764ba208 100%);
    border-radius: 20px;
  `;

  export const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;

    &:hover {
      opacity: 0.8;
    }
  `;

  export const SectionTitle = styled.h2`
    font-size: 28px;
    color: #333;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  export const ToggleIcon = styled.div<{ $expanded: boolean }>`
    font-size: 32px;
    color: #667eea;
    font-weight: 300;
    transition: transform 0.3s ease;
    transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0)'};
  `;

  export const StepsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-top: 40px;
  `;

  export const Step = styled.div`
    position: relative;
    padding: 30px 25px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
    }
  `;

  export const StepNumber = styled.div`
    position: absolute;
    top: -15px;
    left: 25px;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  `;

  export const StepIcon = styled.div`
    font-size: 48px;
    margin-bottom: 15px;
    text-align: center;
  `;

  export const StepTitle = styled.h3`
    font-size: 20px;
    color: #333;
    margin-bottom: 12px;
    font-weight: 600;
  `;

  export const StepText = styled.p`
    font-size: 15px;
    color: #666;
    line-height: 1.6;
  `;

  export const BenefitsSection = styled.div`
    margin-bottom: 80px;
  `;

  export const BenefitsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 25px;
    margin-top: 30px;
  `;

  export const BenefitCard = styled.div`
    padding: 30px;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 16px;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
  `;

  export const BenefitIcon = styled.div`
    font-size: 48px;
    margin-bottom: 20px;
  `;

  export const BenefitTitle = styled.h3`
    font-size: 20px;
    color: #333;
    margin-bottom: 12px;
    font-weight: 600;
  `;

  export const BenefitText = styled.p`
    font-size: 15px;
    color: #666;
    line-height: 1.6;
  `;

  export const FAQSection = styled.div`
    margin-bottom: 60px;
  `;

  export const FAQList = styled.div`
    margin-top: 30px;
  `;

  export const FAQItem = styled.div`
    padding: 25px 30px;
    background: white;
    border-radius: 12px;
    margin-bottom: 15px;
    border-left: 4px solid #667eea;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  `;

  export const Question = styled.h4`
    font-size: 18px;
    color: #333;
    margin-bottom: 12px;
    font-weight: 600;
  `;

  export const Answer = styled.p`
    font-size: 15px;
    color: #666;
    line-height: 1.6;
  `;

  export const Icon = styled.span`
    font-size: inherit;
  `;
}
