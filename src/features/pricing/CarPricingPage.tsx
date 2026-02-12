/**
 * Car Pricing Page - AI-Powered with Sci-Fi Design
 * Страница за ценообразуване на автомобили с изкуствен интелект
 * 
 * Features:
 * - AI-powered pricing (Gemini)
 * - Bulgarian market comparison
 * - Sci-fi glassmorphism design (blue/black gradient)
 * - Dark/Light mode support
 * - Professional SVG icons from svgrepo.com
 * - Full integration with dropdown-options.ts
 * 
 * Route: /pricing
 * Updated: January 18, 2026
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowRight, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { pricingAIEnhancedService, CarSpecs, PricingResponse } from '@/features/pricing/pricing-ai-enhanced.service';
import { brandsModelsDataService } from '@/services/brands-models-data.service';
import { logger } from '@/services/logger-service';
import { FUEL_TYPES, TRANSMISSION_TYPES, CAR_YEARS } from '@/data/dropdown-options';

// Bulgarian cities
const BG_CITIES = ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven', 'Dobrich', 'Shumen'];

const CarPricingPage: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [specs, setSpecs] = useState<CarSpecs>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    condition: 'used',
    fuelType: 'petrol',
    transmission: 'manual',
    city: 'Sofia',
  });
  const [result, setResult] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMakes = async () => {
      try {
        const allMakes = await brandsModelsDataService.getAllBrands();
        setMakes(allMakes);
      } catch (err) {
        logger.error('Failed to load makes', err as Error);
      }
    };
    loadMakes();
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      if (!specs.make) {
        setModels([]);
        return;
      }
      try {
        const modelsForMake = await brandsModelsDataService.getModelsForBrand(specs.make);
        setModels(modelsForMake);
        if (specs.model && !modelsForMake.includes(specs.model)) {
          setSpecs(prev => ({ ...prev, model: '' }));
        }
      } catch (err) {
        logger.error('Failed to load models', err as Error, { make: specs.make });
        setModels([]);
      }
    };
    loadModels();
  }, [specs.make, specs.model]);

  const handleCalculate = async () => {
    if (!specs.make || !specs.model || !specs.year || !specs.mileage) {
      setError(language === 'bg' ? 'Моля, попълнете всички задължителни полета' : 'Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await pricingAIEnhancedService.calculatePrice(specs);
      setResult(response);
      logger.info('Price calculated successfully', { specs, price: response.estimatedPrice });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (language === 'bg' ? 'Грешка при изчисляване на цената' : 'Failed to calculate price');
      setError(errorMessage);
      logger.error('Price calculation failed', err as Error, { specs });
    } finally {
      setLoading(false);
    }
  };

  const updateSpecs = (field: keyof CarSpecs, value: any) => {
    setSpecs(prev => ({ ...prev, [field]: value }));
  };

  const t = language === 'bg' ? {
    title: 'Изчислете Цената на Вашата Кола с AI',
    subtitle: 'Автоматично сравняване със сходни обяви в Mobile.bg, Cars.bg и AutoScout24.bg',
    make: 'Марка', model: 'Модел', year: 'Година', mileage: 'Пробег (км)', condition: 'Състояние',
    fuelType: 'Гориво', transmission: 'Скоростна кутия', city: 'Град', calculate: 'Изчисли Цената',
    calculating: 'Изчисляване...', estimatedPrice: 'Прогнозна цена', confidence: 'Точност',
    priceRange: 'Ценови диапазон', min: 'Мин', avg: 'Средна', max: 'Макс',
    marketComparison: 'Сравнение с пазара', factors: 'Ценообразуващи фактори',
    recommendation: 'AI Препоръка', depreciation: 'Амортизация', conditionFactor: 'Състояние',
    mileageFactor: 'Пробег', demand: 'Търсене', location: 'Локация',
    new: 'Нова', used: 'Употребявана', certified: 'Сертифицирана',
    selectMake: 'Изберете марка', selectModel: 'Изберете модел', selectCity: 'Изберете град',
  } : {
    title: 'Calculate Your Car Price with AI', subtitle: 'Automatic comparison with similar listings on Mobile.bg, Cars.bg and AutoScout24.bg',
    make: 'Make', model: 'Model', year: 'Year', mileage: 'Mileage (km)', condition: 'Condition',
    fuelType: 'Fuel Type', transmission: 'Transmission', city: 'City', calculate: 'Calculate Price',
    calculating: 'Calculating...', estimatedPrice: 'Estimated Price', confidence: 'Confidence',
    priceRange: 'Price Range', min: 'Min', avg: 'Avg', max: 'Max',
    marketComparison: 'Market Comparison', factors: 'Pricing Factors',
    recommendation: 'AI Recommendation', depreciation: 'Depreciation', conditionFactor: 'Condition',
    mileageFactor: 'Mileage', demand: 'Demand', location: 'Location',
    new: 'New', used: 'Used', certified: 'Certified',
    selectMake: 'Select make', selectModel: 'Select model', selectCity: 'Select city',
  };

  return (
    <PageContainer $theme={theme}>
      <HeroSection>
        <HeroContent>
          <HeroIcon>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17.25V21h6v-3.75M12 2v6m-8 4h16M4 12v4a2 2 0 002 2h12a2 2 0 002-2v-4" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient1" x1="4" y1="2" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </HeroIcon>
          <Title>{t.title}</Title>
          <Subtitle>{t.subtitle}</Subtitle>
        </HeroContent>
      </HeroSection>

      <ContentWrapper>
        <FormCard $theme={theme}>
          <FormGrid>
            <FormGroup>
              <Label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {t.make} *
              </Label>
              <Select value={specs.make} onChange={(e) => updateSpecs('make', e.target.value)} $theme={theme}>
                <option value="">{t.selectMake}</option>
                {makes.map(make => <option key={make} value={make}>{make}</option>)}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                {t.model} *
              </Label>
              <Select value={specs.model} onChange={(e) => updateSpecs('model', e.target.value)} disabled={!specs.make} $theme={theme}>
                <option value="">{t.selectModel}</option>
                {models.map(model => <option key={model} value={model}>{model}</option>)}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {t.year} *
              </Label>
              <Select value={specs.year} onChange={(e) => updateSpecs('year', parseInt(e.target.value))} $theme={theme}>
                {CAR_YEARS.map(year => <option key={year.value} value={year.value}>{year.label}</option>)}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {t.mileage} *
              </Label>
              <Input type="number" value={specs.mileage || ''} onChange={(e) => updateSpecs('mileage', parseInt(e.target.value) || 0)} placeholder="85000" min="0" step="1000" $theme={theme} />
            </FormGroup>

            <FormGroup>
              <Label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                {t.condition}
              </Label>
              <Select value={specs.condition} onChange={(e) => updateSpecs('condition', e.target.value)} $theme={theme}>
                <option value="new">{t.new}</option>
                <option value="used">{t.used}</option>
                <option value="certified">{t.certified}</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {t.fuelType}
              </Label>
              <Select value={specs.fuelType} onChange={(e) => updateSpecs('fuelType', e.target.value)} $theme={theme}>
                {FUEL_TYPES.filter(f => f.value !== 'other').map(fuel => (
                  <option key={fuel.value} value={fuel.value}>{language === 'bg' ? fuel.label : fuel.labelEn}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                {t.transmission}
              </Label>
              <Select value={specs.transmission} onChange={(e) => updateSpecs('transmission', e.target.value)} $theme={theme}>
                {TRANSMISSION_TYPES.filter(tr => tr.value !== 'other').map(trans => (
                  <option key={trans.value} value={trans.value}>{language === 'bg' ? trans.label : trans.labelEn}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {t.city}
              </Label>
              <Select value={specs.city} onChange={(e) => updateSpecs('city', e.target.value)} $theme={theme}>
                <option value="">{t.selectCity}</option>
                {BG_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </Select>
            </FormGroup>
          </FormGrid>

          <CalculateButton onClick={handleCalculate} disabled={loading || !specs.make || !specs.model} $theme={theme}>
            {loading ? <><Loader size={20} className="spinner" />{t.calculating}</> : <>{t.calculate}<ArrowRight size={20} /></>}
          </CalculateButton>

          {error && <ErrorMessage><AlertCircle size={20} />{error}</ErrorMessage>}
        </FormCard>

        {result && (
          <ResultsCard $theme={theme}>
            <PriceDisplay $theme={theme}>
              <PriceLabel>{t.estimatedPrice}</PriceLabel>
              <PriceValue>€{result.estimatedPrice?.toLocaleString() || '0'}</PriceValue>
              <ConfidenceBadge $confidence={result.confidence || 0}>
                <CheckCircle size={16} />
                {t.confidence}: {Math.round((result.confidence || 0) * 100)}%
              </ConfidenceBadge>
            </PriceDisplay>

            {result.priceRange && (
              <Section>
                <SectionTitle>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="20" x2="12" y2="10"/>
                    <line x1="18" y1="20" x2="18" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="16"/>
                  </svg>
                  {t.priceRange}
                </SectionTitle>
                <RangeGrid>
                  <RangeItem><RangeLabel>{t.min}</RangeLabel><RangeValue>€{result.priceRange.min?.toLocaleString() || '0'}</RangeValue></RangeItem>
                  <RangeItem><RangeLabel>{t.avg}</RangeLabel><RangeValue>€{result.priceRange.average?.toLocaleString() || '0'}</RangeValue></RangeItem>
                  <RangeItem><RangeLabel>{t.max}</RangeLabel><RangeValue>€{result.priceRange.max?.toLocaleString() || '0'}</RangeValue></RangeItem>
                </RangeGrid>
              </Section>
            )}

            {result.marketComparison && (
              <Section>
                <SectionTitle>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  {t.marketComparison}
                </SectionTitle>
                <ComparisonGrid>
                  <ComparisonItem><ComparisonLabel>Mobile.bg</ComparisonLabel><ComparisonValue>{result.marketComparison.mobileBg ? `€${result.marketComparison.mobileBg.toLocaleString()}` : '-'}</ComparisonValue></ComparisonItem>
                  <ComparisonItem><ComparisonLabel>Cars.bg</ComparisonLabel><ComparisonValue>{result.marketComparison.carsBg ? `€${result.marketComparison.carsBg.toLocaleString()}` : '-'}</ComparisonValue></ComparisonItem>
                  <ComparisonItem><ComparisonLabel>AutoScout24</ComparisonLabel><ComparisonValue>{result.marketComparison.autoScout24 ? `€${result.marketComparison.autoScout24.toLocaleString()}` : '-'}</ComparisonValue></ComparisonItem>
                </ComparisonGrid>
              </Section>
            )}

            {result.factors && (
              <Section>
                <SectionTitle>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  {t.factors}
                </SectionTitle>
                <FactorsGrid>
                  <FactorItem><FactorLabel>{t.depreciation}</FactorLabel><FactorBar $value={result.factors.depreciation || 0} $type="negative"><FactorValue>{result.factors.depreciation || 0}%</FactorValue></FactorBar></FactorItem>
                  <FactorItem><FactorLabel>{t.conditionFactor}</FactorLabel><FactorBar $value={result.factors.condition || 0} $type="positive"><FactorValue>+{result.factors.condition || 0}%</FactorValue></FactorBar></FactorItem>
                  <FactorItem><FactorLabel>{t.mileageFactor}</FactorLabel><FactorBar $value={Math.abs(result.factors.mileage || 0)} $type="negative"><FactorValue>{result.factors.mileage || 0}%</FactorValue></FactorBar></FactorItem>
                  <FactorItem><FactorLabel>{t.demand}</FactorLabel><FactorBar $value={result.factors.marketDemand || 0} $type="positive"><FactorValue>+{result.factors.marketDemand || 0}%</FactorValue></FactorBar></FactorItem>
                  <FactorItem><FactorLabel>{t.location}</FactorLabel><FactorBar $value={result.factors.location || 0} $type="positive"><FactorValue>+{result.factors.location || 0}%</FactorValue></FactorBar></FactorItem>
                </FactorsGrid>
              </Section>
            )}

            {result.recommendation && (
              <RecommendationSection>
                <SectionTitle>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  {t.recommendation}
                </SectionTitle>
                <RecommendationText>{result.recommendation}</RecommendationText>
              </RecommendationSection>
            )}
          </ResultsCard>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div<{ $theme: 'dark' | 'light' }>`
  min-height: 100vh;
  background: ${p => p.$theme === 'dark' ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)' : 'linear-gradient(135deg, #e8eef7 0%, #f5f8fc 50%, #dce4f0 100%)'};
  padding: 60px 20px 40px;
  position: relative;
  overflow: hidden;
  &::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.1) 0%, transparent 50%); animation: drift 20s ease-in-out infinite; pointer-events: none; }
  @keyframes drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
`;

const HeroSection = styled.div`text-align: center; margin-bottom: 60px; position: relative; z-index: 1;`;
const HeroContent = styled.div`max-width: 800px; margin: 0 auto;`;
const HeroIcon = styled.div`margin: 0 auto 24px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 20px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(59, 130, 246, 0.2);`;
const Title = styled.h1`font-size: clamp(28px, 5vw, 48px); font-weight: 700; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);`;
const Subtitle = styled.p`font-size: clamp(14px, 2vw, 18px); color: var(--text-secondary); line-height: 1.6; opacity: 0.9;`;
const ContentWrapper = styled.div`max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 32px; position: relative; z-index: 1; @media (min-width: 1024px) { grid-template-columns: 500px 1fr; }`;
const FormCard = styled.div<{ $theme: 'dark' | 'light' }>`background: ${p => p.$theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)'}; backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid ${p => p.$theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}; padding: 32px; box-shadow: ${p => p.$theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 80px rgba(59, 130, 246, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 60px rgba(59, 130, 246, 0.05)'}; height: fit-content;`;
const FormGrid = styled.div`display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 32px; @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }`;
const FormGroup = styled.div`display: flex; flex-direction: column; gap: 8px;`;
const Label = styled.label`font-size: 14px; font-weight: 500; color: var(--text-primary); opacity: 0.9; display: flex; align-items: center; gap: 8px; svg { opacity: 0.6; }`;
const Select = styled.select<{ $theme: 'dark' | 'light' }>`width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid ${p => p.$theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}; background: ${p => p.$theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'}; color: var(--text-primary); font-size: 15px; transition: all 0.3s ease; cursor: pointer; &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } &:disabled { opacity: 0.5; cursor: not-allowed; }`;
const Input = styled.input<{ $theme: 'dark' | 'light' }>`width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid ${p => p.$theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}; background: ${p => p.$theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'}; color: var(--text-primary); font-size: 15px; transition: all 0.3s ease; &:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } &::placeholder { color: var(--text-tertiary); }`;
const CalculateButton = styled.button<{ $theme: 'dark' | 'light' }>`width: 100%; padding: 16px 32px; border-radius: 12px; border: none; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4); &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5); } &:active:not(:disabled) { transform: translateY(0); } &:disabled { opacity: 0.6; cursor: not-allowed; } .spinner { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
const ErrorMessage = styled.div`margin-top: 16px; padding: 12px 16px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; font-size: 14px; display: flex; align-items: center; gap: 8px;`;
const ResultsCard = styled.div<{ $theme: 'dark' | 'light' }>`background: ${p => p.$theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)'}; backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid ${p => p.$theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}; padding: 32px; box-shadow: ${p => p.$theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 80px rgba(139, 92, 246, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 60px rgba(139, 92, 246, 0.05)'}; animation: fadeIn 0.5s ease; @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
const PriceDisplay = styled.div<{ $theme: 'dark' | 'light' }>`text-align: center; padding: 40px 32px; border-radius: 16px; background: linear-gradient(135deg, ${p => p.$theme === 'dark' ? '#1e3a8a' : '#3b82f6'} 0%, ${p => p.$theme === 'dark' ? '#581c87' : '#8b5cf6'} 100%); margin-bottom: 32px; position: relative; overflow: hidden; &::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite; } @keyframes pulse { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(10px, -10px) scale(1.05); } }`;
const PriceLabel = styled.div`font-size: 14px; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; position: relative; z-index: 1;`;
const PriceValue = styled.div`font-size: clamp(36px, 6vw, 56px); font-weight: 700; color: white; margin-bottom: 16px; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); position: relative; z-index: 1;`;
const ConfidenceBadge = styled.div<{ $confidence: number }>`display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 24px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); color: white; font-size: 14px; font-weight: 500; position: relative; z-index: 1;`;
const Section = styled.div`margin-bottom: 32px; &:last-child { margin-bottom: 0; }`;
const SectionTitle = styled.h3`font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 12px; svg { color: #3b82f6; }`;
const RangeGrid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;`;
const RangeItem = styled.div`text-align: center; padding: 16px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-light);`;
const RangeLabel = styled.div`font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;`;
const RangeValue = styled.div`font-size: 20px; font-weight: 600; color: var(--text-primary);`;
const ComparisonGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;`;
const ComparisonItem = styled.div`padding: 16px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-light); text-align: center;`;
const ComparisonLabel = styled.div`font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;`;
const ComparisonValue = styled.div`font-size: 18px; font-weight: 600; color: #3b82f6;`;
const FactorsGrid = styled.div`display: flex; flex-direction: column; gap: 16px;`;
const FactorItem = styled.div`display: flex; flex-direction: column; gap: 8px;`;
const FactorLabel = styled.div`font-size: 14px; color: var(--text-secondary); font-weight: 500;`;
const FactorBar = styled.div<{ $value: number; $type: 'positive' | 'negative' }>`position: relative; height: 32px; border-radius: 8px; background: var(--bg-secondary); overflow: hidden; &::before { content: ''; position: absolute; top: 0; left: 0; height: 100%; width: ${p => Math.min(Math.abs(p.$value), 100)}%; background: ${p => p.$type === 'positive' ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'}; transition: width 0.5s ease; }`;
const FactorValue = styled.div`position: relative; z-index: 1; padding: 0 12px; height: 100%; display: flex; align-items: center; font-size: 14px; font-weight: 600; color: white;`;
const RecommendationSection = styled.div`padding: 24px; border-radius: 16px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(59, 130, 246, 0.2);`;
const RecommendationText = styled.p`font-size: 15px; line-height: 1.7; color: var(--text-primary);`;

export default CarPricingPage;
