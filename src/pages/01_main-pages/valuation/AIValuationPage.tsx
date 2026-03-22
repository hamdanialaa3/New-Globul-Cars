/**
 * AI Car Valuation Landing Page (Bulgarian-First)
 * 
 * Key differentiator for Koli One — free AI-powered car valuation.
 * No registration required. Uses Gemini + DeepSeek AI analysis.
 * 
 * Route: /valuation
 * SEO: Schema.org WebApplication + FAQPage markup
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, ArrowRight, CheckCircle, AlertCircle, Car, Shield, Zap, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { pricingAIEnhancedService, CarSpecs, PricingResponse } from '@/features/pricing/pricing-ai-enhanced.service';
import { brandsModelsDataService } from '@/services/brands-models-data.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import { logger } from '@/services/logger-service';
import { Link, useParams } from 'react-router-dom';
import { POPULAR_BRANDS } from '@/data/seo-locations';

// ---- Animations ----
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

// ---- Styled Components ----
const PageContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  padding-top: 80px;
  background: ${p => p.$isDark ? '#0a0f1e' : '#f0f4f8'};
  color: ${p => p.$isDark ? '#f8fafc' : '#1e293b'};
`;

const HeroSection = styled.section<{ $isDark: boolean }>`
  text-align: center;
  padding: 4rem 1.5rem 3rem;
  background: ${p => p.$isDark
    ? 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)'};
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #10b981 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 4s ease-in-out infinite;
`;

const HeroSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto 1.5rem;
  color: ${p => p.$isDark ? '#94a3b8' : '#64748b'};
  line-height: 1.6;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 999px;
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const ContentWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
`;

const FormCard = styled.div<{ $isDark: boolean }>`
  background: ${p => p.$isDark ? '#1e293b' : 'white'};
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: ${p => p.$isDark
    ? '0 10px 40px rgba(0,0,0,0.4)'
    : '0 10px 40px rgba(0,0,0,0.08)'};
  margin-bottom: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label<{ $isDark: boolean }>`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: ${p => p.$isDark ? '#cbd5e1' : '#475569'};
`;

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${p => p.$isDark ? '#334155' : '#e2e8f0'};
  background: ${p => p.$isDark ? '#0f172a' : 'white'};
  color: ${p => p.$isDark ? 'white' : '#1e293b'};
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
`;

const Select = styled.select<{ $isDark: boolean }>`
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${p => p.$isDark ? '#334155' : '#e2e8f0'};
  background: ${p => p.$isDark ? '#0f172a' : 'white'};
  color: ${p => p.$isDark ? 'white' : '#1e293b'};
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.125rem;
  margin-top: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultsSection = styled(motion.div)<{ $isDark: boolean }>`
  background: ${p => p.$isDark ? '#1e293b' : 'white'};
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: ${p => p.$isDark
    ? '0 10px 40px rgba(0,0,0,0.4)'
    : '0 10px 40px rgba(0,0,0,0.08)'};
  border: 2px solid #10b981;
`;

const PriceDisplay = styled.div`
  text-align: center;
  margin: 1.5rem 0;
`;

const EstimatedLabel = styled.div<{ $isDark: boolean }>`
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${p => p.$isDark ? '#94a3b8' : '#64748b'};
  margin-bottom: 0.5rem;
`;

const PriceValue = styled.div`
  font-size: clamp(2.5rem, 6vw, 3.5rem);
  font-weight: 800;
  color: #10b981;
`;

const ConfidenceBadge = styled.div<{ $confidence: number }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${p => p.$confidence >= 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)'};
  color: ${p => p.$confidence >= 70 ? '#10b981' : '#f59e0b'};
  border: 1px solid ${p => p.$confidence >= 70 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 191, 36, 0.3)'};
`;

const RangeBar = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: ${p => p.$isDark ? '#0f172a' : '#f8fafc'};
`;

const RangeLabel = styled.div<{ $isDark: boolean }>`
  text-align: center;
  & span { display: block; font-size: 0.75rem; color: ${p => p.$isDark ? '#64748b' : '#94a3b8'}; }
  & strong { font-size: 1.125rem; color: ${p => p.$isDark ? '#e2e8f0' : '#1e293b'}; }
`;

const FactorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0;
`;

const FactorItem = styled.div<{ $isDark: boolean; $positive: boolean }>`
  padding: 0.75rem;
  border-radius: 10px;
  background: ${p => p.$isDark ? '#0f172a' : '#f8fafc'};
  text-align: center;
  & .label { font-size: 0.75rem; color: ${p => p.$isDark ? '#64748b' : '#94a3b8'}; margin-bottom: 0.25rem; }
  & .value { font-weight: 700; color: ${p => p.$positive ? '#10b981' : '#ef4444'}; }
`;

const CTASection = styled.div<{ $isDark: boolean }>`
  text-align: center;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 16px;
  background: ${p => p.$isDark
    ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.1) 100%)'
    : 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%)'};
  border: 1px solid rgba(16, 185, 129, 0.2);
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.125rem;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  }
`;

const TrustBadges = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin: 2rem 0;
`;

const TrustItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${p => p.$isDark ? '#94a3b8' : '#64748b'};
  & svg { color: #10b981; }
`;

const FAQSection = styled.section<{ $isDark: boolean }>`
  max-width: 800px;
  margin: 3rem auto 0;
`;

const FAQItem = styled.details<{ $isDark: boolean }>`
  margin-bottom: 0.75rem;
  border-radius: 12px;
  background: ${p => p.$isDark ? '#1e293b' : 'white'};
  overflow: hidden;
  & summary {
    padding: 1rem 1.5rem;
    cursor: pointer;
    font-weight: 600;
    list-style: none;
    &::-webkit-details-marker { display: none; }
    &::before { content: '▸ '; color: #10b981; }
  }
  &[open] summary::before { content: '▾ '; }
  & p { padding: 0 1.5rem 1rem; color: ${p => p.$isDark ? '#94a3b8' : '#64748b'}; line-height: 1.6; }
`;

const LoadingShimmer = styled.div`
  height: 200px;
  border-radius: 20px;
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;

const ErrorBox = styled.div`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const BrandLinksSection = styled.section<{ $isDark: boolean }>`
  max-width: 800px;
  margin: 3rem auto 0;
  padding-top: 2rem;
  border-top: 1px solid ${p => p.$isDark ? '#1e293b' : '#e2e8f0'};
`;

const BrandLinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
`;

const BrandLink = styled(Link)<{ $isDark: boolean; $active: boolean }>`
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  background: ${p => p.$active
    ? 'rgba(16, 185, 129, 0.15)'
    : p.$isDark ? '#1e293b' : '#f1f5f9'};
  color: ${p => p.$active
    ? '#10b981'
    : p.$isDark ? '#94a3b8' : '#64748b'};
  border: 1px solid ${p => p.$active
    ? 'rgba(16, 185, 129, 0.3)'
    : 'transparent'};
  &:hover {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
`;

// ---- Year options ----
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 35 }, (_, i) => currentYear - i);

const CONDITIONS = [
  { value: 'new', bg: 'Ново', en: 'New' },
  { value: 'used', bg: 'Употребявано', en: 'Used' },
  { value: 'certified', bg: 'Сертифицирано', en: 'Certified' },
] as const;

const FUEL_OPTIONS = [
  { value: 'petrol', bg: 'Бензин', en: 'Petrol' },
  { value: 'diesel', bg: 'Дизел', en: 'Diesel' },
  { value: 'hybrid', bg: 'Хибрид', en: 'Hybrid' },
  { value: 'electric', bg: 'Електро', en: 'Electric' },
  { value: 'lpg', bg: 'Газ/LPG', en: 'LPG' },
] as const;

// ---- FAQ Data ----
const FAQ_DATA = [
  {
    q: { bg: 'Как работи AI оценката на Koli One?', en: 'How does Koli One AI valuation work?' },
    a: { bg: 'Нашата система използва изкуствен интелект (Gemini + DeepSeek) за анализ на пазарни данни от Mobile.bg, Cars.bg и AutoScout24. AI моделът отчита амортизация, състояние, пробег, търсене на пазара и регионални фактори специфични за България.', en: 'Our system uses AI (Gemini + DeepSeek) to analyze market data from Mobile.bg, Cars.bg, and AutoScout24. The AI model accounts for depreciation, condition, mileage, market demand, and Bulgaria-specific regional factors.' },
  },
  {
    q: { bg: 'Безплатна ли е оценката?', en: 'Is the valuation free?' },
    a: { bg: 'Да, напълно безплатна. Не е необходима регистрация. Можете да оцените неограничен брой автомобили.', en: 'Yes, completely free. No registration required. You can evaluate unlimited cars.' },
  },
  {
    q: { bg: 'Колко точна е AI оценката?', en: 'How accurate is the AI valuation?' },
    a: { bg: 'Нашата AI система постига средна точност от 85-95% спрямо реалните пазарни цени в България. Процентът на доверие се показва за всяка оценка.', en: 'Our AI system achieves 85-95% average accuracy compared to actual Bulgarian market prices. A confidence percentage is shown for each valuation.' },
  },
  {
    q: { bg: 'Мога ли да продам колата си на тази цена?', en: 'Can I sell my car at this price?' },
    a: { bg: 'Да! Публикувайте обява безплатно в Koli One с до 10 обяви без регистрация на бизнес акаунт. AI оценката ви помага да определите конкурентна цена.', en: 'Yes! List your car for free on Koli One with up to 10 listings. The AI valuation helps you set a competitive price.' },
  },
];

// ---- Component ----
const AIValuationPage: React.FC = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { brand: brandSlug } = useParams<{ brand?: string }>();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';

  // Resolve brand from URL slug
  const brandInfo = brandSlug
    ? POPULAR_BRANDS.find(b => b.id === brandSlug.toLowerCase())
    : null;
  const prefilledMake = brandInfo?.name || '';

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PricingResponse | null>(null);

  const [formData, setFormData] = useState<CarSpecs>({
    make: prefilledMake,
    model: '',
    year: currentYear,
    mileage: 0,
    condition: 'used',
    fuelType: 'diesel',
    transmission: 'manual',
    city: 'Sofia',
  });

  useEffect(() => {
    brandsModelsDataService.getAllBrands()
      .then(brands => {
        setMakes(brands);
        // Pre-load models if brand is pre-filled from URL
        if (prefilledMake) {
          brandsModelsDataService.getModelsForBrand(prefilledMake)
            .then(setModels)
            .catch(err => logger.error('Failed to load models for brand', err as Error));
        }
      })
      .catch(err => logger.error('Failed to load brands', err as Error));
  }, [prefilledMake]);

  const handleMakeChange = useCallback(async (make: string) => {
    setFormData(prev => ({ ...prev, make, model: '' }));
    setModels([]);
    if (make) {
      try {
        const brandModels = await brandsModelsDataService.getModelsForBrand(make);
        setModels(brandModels);
      } catch (err) {
        logger.error('Failed to load models', err as Error);
      }
    }
  }, []);

  const handleCalculate = async () => {
    if (!formData.make || !formData.model) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await pricingAIEnhancedService.calculatePrice(formData);
      setResult(response);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Valuation failed: ' + msg);
      setError(isBg ? 'Грешка при оценката. Моля, опитайте отново.' : 'Valuation error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---- Schema.org Structured Data ----
  const pageUrl = brandSlug ? `https://koli.one/valuation/${brandSlug}` : 'https://koli.one/valuation';

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": brandInfo
        ? `${brandInfo.name} Car Valuation — Koli One`
        : "Koli One AI Car Valuation",
      "url": pageUrl,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "description": brandInfo
        ? `Безплатна AI оценка на ${brandInfo.nameBg} автомобили за българския пазар.`
        : "Безплатна AI оценка на автомобили за българския пазар. Научете реалната стойност на колата си за секунди.",
      "publisher": {
        "@type": "Organization",
        "name": "Koli One",
        "url": "https://koli.one"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQ_DATA.map(faq => ({
        "@type": "Question",
        "name": faq.q.bg,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a.bg
        }
      }))
    }
  ];

  const t = {
    badge: isBg ? '🤖 Безплатно • Без регистрация' : '🤖 Free • No Registration',
    title: brandInfo
      ? (isBg ? `AI Оценка на ${brandInfo.nameBg}` : `${brandInfo.name} AI Valuation`)
      : (isBg ? 'AI Оценка на Автомобил' : 'AI Car Valuation'),
    subtitle: brandInfo
      ? (isBg
        ? `Разберете реалната пазарна цена на вашия ${brandInfo.nameBg} за секунди. AI анализира данни от Mobile.bg, Cars.bg и AutoScout24.`
        : `Get the real market value of your ${brandInfo.name} in seconds. AI analyzes data from Mobile.bg, Cars.bg, and AutoScout24.`)
      : (isBg
        ? 'Разберете реалната пазарна цена на вашия автомобил за секунди. Изкуствен интелект анализира данни от Mobile.bg, Cars.bg и AutoScout24.'
        : 'Get the real market value of your car in seconds. AI analyzes data from Mobile.bg, Cars.bg, and AutoScout24.'),
    make: isBg ? 'Марка' : 'Make',
    model: isBg ? 'Модел' : 'Model',
    year: isBg ? 'Година' : 'Year',
    mileage: isBg ? 'Пробег (км)' : 'Mileage (km)',
    condition: isBg ? 'Състояние' : 'Condition',
    fuel: isBg ? 'Гориво' : 'Fuel',
    btn: isBg ? 'Оцени Безплатно' : 'Get Free Valuation',
    estimatedValue: isBg ? 'Ориентировъчна стойност' : 'Estimated Value',
    confidence: isBg ? 'Доверие' : 'Confidence',
    min: isBg ? 'Минимум' : 'Min',
    max: isBg ? 'Максимум' : 'Max',
    avg: isBg ? 'Средна цена' : 'Average',
    factors: isBg ? 'Фактори на цената' : 'Pricing Factors',
    depreciation: isBg ? 'Амортизация' : 'Depreciation',
    conditionLabel: isBg ? 'Състояние' : 'Condition',
    mileageLabel: isBg ? 'Пробег' : 'Mileage',
    demand: isBg ? 'Търсене' : 'Demand',
    location: isBg ? 'Локация' : 'Location',
    recommendation: isBg ? 'AI Препоръка' : 'AI Recommendation',
    ctaTitle: isBg ? 'Продайте на тази цена!' : 'Sell at this price!',
    ctaDesc: isBg ? 'Публикувайте безплатна обява в Koli One — до 10 обяви без такси.' : 'List for free on Koli One — up to 10 listings with no fees.',
    ctaBtn: isBg ? 'Публикувай Безплатно' : 'List for Free',
    trustFree: isBg ? 'Безплатно завинаги' : 'Free forever',
    trustAI: isBg ? 'AI технология' : 'AI technology',
    trustBG: isBg ? 'Българска база данни' : 'Bulgarian database',
    trustSecure: isBg ? 'Сигурно' : 'Secure',
    faqTitle: isBg ? 'Често задавани въпроси' : 'Frequently Asked Questions',
    selectMake: isBg ? 'Изберете марка' : 'Select make',
    selectModel: isBg ? 'Изберете модел' : 'Select model',
    metaTitle: brandInfo
      ? (isBg ? `AI Оценка на ${brandInfo.nameBg} — Безплатно | Koli One` : `${brandInfo.name} AI Valuation — Free | Koli One`)
      : (isBg ? 'AI Оценка на Кола — Безплатно | Koli One' : 'AI Car Valuation — Free | Koli One'),
    metaDesc: brandInfo
      ? (isBg
        ? `Безплатна AI оценка на ${brandInfo.nameBg} автомобили за българския пазар. Разберете реалната стойност на вашия ${brandInfo.nameBg} за секунди.`
        : `Free AI ${brandInfo.name} valuation for the Bulgarian market. Get your ${brandInfo.name}'s real value in seconds.`)
      : (isBg
        ? 'Безплатна AI оценка на автомобили за българския пазар. Разберете реалната стойност на колата си за секунди без регистрация.'
        : 'Free AI car valuation for the Bulgarian market. Get your car\'s real value in seconds without registration.'),
  };

  const formatPrice = (price: number) => {
    const bgn = Math.round(price * 1.96);
    return isBg ? `${bgn.toLocaleString('bg-BG')} лв.` : `€${Math.round(price).toLocaleString()}`;
  };

  const formatFactor = (val: number) => {
    const pct = Math.round(val * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  return (
    <PageContainer $isDark={isDark}>
      <Helmet>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={pageUrl} />
        {structuredData.map((sd, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(sd)}</script>
        ))}
      </Helmet>

      {/* Hero */}
      <HeroSection $isDark={isDark}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge><Zap size={14} /> {t.badge}</Badge>
        </motion.div>
        <HeroTitle>{t.title}</HeroTitle>
        <HeroSubtitle $isDark={isDark}>{t.subtitle}</HeroSubtitle>
        <TrustBadges>
          <TrustItem $isDark={isDark}><CheckCircle size={16} /> {t.trustFree}</TrustItem>
          <TrustItem $isDark={isDark}><Zap size={16} /> {t.trustAI}</TrustItem>
          <TrustItem $isDark={isDark}><BarChart3 size={16} /> {t.trustBG}</TrustItem>
          <TrustItem $isDark={isDark}><Shield size={16} /> {t.trustSecure}</TrustItem>
        </TrustBadges>
      </HeroSection>

      <ContentWrapper>
        {/* Form */}
        <FormCard $isDark={isDark}>
          <FormGrid>
            <FormGroup>
              <Label $isDark={isDark}>{t.make}</Label>
              <Select
                $isDark={isDark}
                value={formData.make}
                onChange={e => handleMakeChange(e.target.value)}
              >
                <option value="">{t.selectMake}</option>
                {makes.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label $isDark={isDark}>{t.model}</Label>
              <Select
                $isDark={isDark}
                value={formData.model}
                onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                disabled={!formData.make}
              >
                <option value="">{t.selectModel}</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label $isDark={isDark}>{t.year}</Label>
              <Select
                $isDark={isDark}
                value={formData.year}
                onChange={e => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
              >
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label $isDark={isDark}>{t.mileage}</Label>
              <Input
                $isDark={isDark}
                type="number"
                placeholder="50000"
                min={0}
                max={999999}
                value={formData.mileage || ''}
                onChange={e => setFormData(prev => ({ ...prev, mileage: Math.max(0, Number(e.target.value)) }))}
              />
            </FormGroup>
            <FormGroup>
              <Label $isDark={isDark}>{t.condition}</Label>
              <Select
                $isDark={isDark}
                value={formData.condition}
                onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value as CarSpecs['condition'] }))}
              >
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{isBg ? c.bg : c.en}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label $isDark={isDark}>{t.fuel}</Label>
              <Select
                $isDark={isDark}
                value={formData.fuelType}
                onChange={e => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
              >
                {FUEL_OPTIONS.map(f => <option key={f.value} value={f.value}>{isBg ? f.bg : f.en}</option>)}
              </Select>
            </FormGroup>
          </FormGrid>
          <SubmitButton
            onClick={handleCalculate}
            disabled={!formData.make || !formData.model || loading}
          >
            {loading ? <LoadingSpinner size="small" /> : <><Calculator size={20} /> {t.btn}</>}
          </SubmitButton>
        </FormCard>

        {/* Error */}
        {error && (
          <ErrorBox>
            <AlertCircle size={20} />
            {error}
          </ErrorBox>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <ResultsSection
              $isDark={isDark}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Price */}
              <PriceDisplay>
                <EstimatedLabel $isDark={isDark}>{t.estimatedValue}</EstimatedLabel>
                <PriceValue>{formatPrice(result.estimatedPrice)}</PriceValue>
                <ConfidenceBadge $confidence={result.confidence}>
                  {result.confidence >= 70 ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {t.confidence}: {result.confidence}%
                </ConfidenceBadge>
              </PriceDisplay>

              {/* Range */}
              <RangeBar $isDark={isDark}>
                <RangeLabel $isDark={isDark}>
                  <span>{t.min}</span>
                  <strong>{formatPrice(result.priceRange.min)}</strong>
                </RangeLabel>
                <div style={{ flex: 1, height: 4, background: 'linear-gradient(90deg, #ef4444, #10b981, #3b82f6)', borderRadius: 2 }} />
                <RangeLabel $isDark={isDark}>
                  <span>{t.max}</span>
                  <strong>{formatPrice(result.priceRange.max)}</strong>
                </RangeLabel>
              </RangeBar>

              {/* Factors */}
              <h4 style={{ marginBottom: '0.5rem' }}>{t.factors}</h4>
              <FactorsGrid>
                <FactorItem $isDark={isDark} $positive={result.factors.depreciation >= 0}>
                  <div className="label">{t.depreciation}</div>
                  <div className="value">{formatFactor(result.factors.depreciation)}</div>
                </FactorItem>
                <FactorItem $isDark={isDark} $positive={result.factors.condition >= 0}>
                  <div className="label">{t.conditionLabel}</div>
                  <div className="value">{formatFactor(result.factors.condition)}</div>
                </FactorItem>
                <FactorItem $isDark={isDark} $positive={result.factors.mileage >= 0}>
                  <div className="label">{t.mileageLabel}</div>
                  <div className="value">{formatFactor(result.factors.mileage)}</div>
                </FactorItem>
                <FactorItem $isDark={isDark} $positive={result.factors.marketDemand >= 0}>
                  <div className="label">{t.demand}</div>
                  <div className="value">{formatFactor(result.factors.marketDemand)}</div>
                </FactorItem>
                <FactorItem $isDark={isDark} $positive={result.factors.location >= 0}>
                  <div className="label">{t.location}</div>
                  <div className="value">{formatFactor(result.factors.location)}</div>
                </FactorItem>
              </FactorsGrid>

              {/* AI Recommendation */}
              {result.recommendation && (
                <div style={{
                  padding: '1rem 1.5rem',
                  borderRadius: 12,
                  background: isDark ? '#0f172a' : '#f0fdf4',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  marginTop: '1rem'
                }}>
                  <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>
                    <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    {t.recommendation}
                  </h4>
                  <p style={{ color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.6, margin: 0 }}>
                    {result.recommendation}
                  </p>
                </div>
              )}

              {/* CTA */}
              <CTASection $isDark={isDark}>
                <h3 style={{ marginBottom: '0.5rem' }}>{t.ctaTitle}</h3>
                <p style={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: '1.25rem' }}>{t.ctaDesc}</p>
                <CTAButton to="/sell/auto">
                  <Car size={20} /> {t.ctaBtn} <ArrowRight size={18} />
                </CTAButton>
              </CTASection>
            </ResultsSection>
          )}
        </AnimatePresence>

        {/* FAQ */}
        <FAQSection $isDark={isDark}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{t.faqTitle}</h2>
          {FAQ_DATA.map((faq, i) => (
            <FAQItem key={i} $isDark={isDark}>
              <summary>{isBg ? faq.q.bg : faq.q.en}</summary>
              <p>{isBg ? faq.a.bg : faq.a.en}</p>
            </FAQItem>
          ))}
        </FAQSection>

        {/* Brand Internal Links — SEO */}
        <BrandLinksSection $isDark={isDark}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isBg ? 'Оценка по марка' : 'Valuation by Brand'}
          </h3>
          <BrandLinksGrid>
            {POPULAR_BRANDS.map(b => (
              <BrandLink
                key={b.id}
                to={`/valuation/${b.id}`}
                $isDark={isDark}
                $active={b.id === brandSlug}
              >
                {isBg ? b.nameBg : b.name}
              </BrandLink>
            ))}
          </BrandLinksGrid>
        </BrandLinksSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AIValuationPage;
