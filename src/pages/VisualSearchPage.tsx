// Visual Search Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { VisualSearchUpload } from '../../components/visual-search/VisualSearchUpload';
import { VisualSearchResult } from '../../services/advanced/visual-search.service';
import { AIEvaluationWidget } from '../../components/ai/AIEvaluationWidget';
import * as S from './VisualSearchPage.styles';

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
        {/* NEW FUTURISTIC AI WIDGET */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
          <AIEvaluationWidget />
        </div>
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
