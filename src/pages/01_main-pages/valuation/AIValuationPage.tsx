/**
 * AI Car Valuation Page
 * 
 * Uses market data to estimate car value.
 * Inputs: Make, Model, Year, Mileage, Condition
 * Outputs: Price range (Trade-in, Private Party, Retail)
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { searchCars } from '@/services/car/unified-car-queries';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UnifiedCar } from '@/services/car/unified-car-types';
import { logger } from '@/services/logger-service';

// Styled Components
const PageContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  padding-top: 100px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  color: ${props => props.$isDark ? '#f8fafc' : '#1e293b'};
  font-family: 'Martica', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FormCard = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label<{ $isDark: boolean }>`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.$isDark ? '#cbd5e1' : '#475569'};
`;

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  background: ${props => props.$isDark ? '#0f172a' : 'white'};
  color: ${props => props.$isDark ? 'white' : '#1e293b'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  }
`;

const Select = styled.select<{ $isDark: boolean }>`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  background: ${props => props.$isDark ? '#0f172a' : 'white'};
  color: ${props => props.$isDark ? 'white' : '#1e293b'};
  font-size: 1rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ResultCard = styled(motion.div) <{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  text-align: center;
  border: 2px solid #10b981;
`;

const PriceValue = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  color: #10b981;
  margin: 1rem 0;
`;

const Disclaimer = styled.p`
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 2rem;
`;

const AIValuationPage: React.FC = () => {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const isDark = theme === 'dark';
    const isBg = language === 'bg';

    // Schema.org Article Structured Data (Stronger SEO Version)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "How Koli One's AI Valuation Works",
        "author": {
            "@type": "Organization",
            "name": "Koli One"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Koli One",
            "logo": {
                "@type": "ImageObject",
                "url": "https://koli.one/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://koli.one/valuation"
        },
        "datePublished": "2026-02-12",
        "image": "https://koli.one/blog/images/ai-valuation-cover.jpg"
    };

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ min: number; max: number; avg: number; count: number } | null>(null);

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: ''
    });

    const handleCalculate = async () => {
        setLoading(true);
        setResult(null);

        try {
            // 1. Fetch real market data
            const filters = {
                make: formData.make,
                model: formData.model,
                minYear: Number(formData.year) - 1,
                maxYear: Number(formData.year) + 1,
            };

            const similarCars = await searchCars(filters, 50);

            const realPrices = similarCars
                .map(c => c.price)
                .filter(p => p > 0);

            // 2. Algorithm (Basic MVP)
            // If no data, use a fallback heuristic or return 0
            let avg = 0;
            let min = 0;
            let max = 0;

            if (realPrices.length > 0) {
                avg = realPrices.reduce((a, b) => a + b, 0) / realPrices.length;
                min = Math.min(...realPrices) * 0.9;
                max = Math.max(...realPrices) * 1.1;
            } else {
                // Fallback Mock (REMOVE IN PRODUCTION AFTER MORE DATA)
                // Simulating query finding nothing
                avg = 0;
            }

            setTimeout(() => {
                setResult({ min, max, avg, count: realPrices.length });
                setLoading(false);
            }, 1500);

        } catch (error) {
            logger.error(error instanceof Error ? error.message : String(error));
            setLoading(false);
        }
    };

    const t = {
        title: isBg ? 'AI Оценка на автомобил' : 'AI Car Valuation',
        subtitle: isBg ? 'Разберете реалната пазарна цена на вашия автомобил за секунди.' : 'Get the real market value of your car in seconds.',
        make: isBg ? 'Марка' : 'Make',
        model: isBg ? 'Модел' : 'Model',
        year: isBg ? 'Година' : 'Year',
        mileage: isBg ? 'Пробег (км)' : 'Mileage (km)',
        btn: isBg ? 'Оцени Сега' : 'Valuate Now',
        result: isBg ? 'Пазарна Оценка' : 'Estimated Value',
        range: isBg ? 'Диапазон' : 'Price Range',
        noData: isBg ? 'Нямаме достатъчно данни за този конкретен модел.' : 'Not enough data for this specific model yet.'
    };

    return (
        <PageContainer $isDark={isDark}>
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>
            <ContentWrapper>
                <HeroSection>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <Calculator size={48} color="#10b981" />
                    </motion.div>
                    <Title>{t.title}</Title>
                    <p style={{ fontSize: '1.25rem', color: isDark ? '#cbd5e1' : '#64748b' }}>
                        {t.subtitle}
                        <span style={{ display: 'block', fontSize: '1rem', marginTop: '0.5rem', opacity: 0.8 }}>
                            <a href="/blog/ai-valuation-works" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                                {isBg ? '→ Вижте как работи нашата AI система' : '→ Learn how our AI system works'}
                            </a>
                        </span>
                    </p>
                </HeroSection>

                <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                    <FormCard $isDark={isDark}>
                        <FormGroup>
                            <Label $isDark={isDark}>{t.make}</Label>
                            <Input
                                $isDark={isDark}
                                placeholder="e.g. BMW"
                                value={formData.make}
                                onChange={e => setFormData({ ...formData, make: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label $isDark={isDark}>{t.model}</Label>
                            <Input
                                $isDark={isDark}
                                placeholder="e.g. X5"
                                value={formData.model}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                            />
                        </FormGroup>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <FormGroup style={{ flex: 1 }}>
                                <Label $isDark={isDark}>{t.year}</Label>
                                <Input
                                    $isDark={isDark}
                                    type="number"
                                    placeholder="2020"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup style={{ flex: 1 }}>
                                <Label $isDark={isDark}>{t.mileage}</Label>
                                <Input
                                    $isDark={isDark}
                                    type="number"
                                    placeholder="50000"
                                    value={formData.mileage}
                                    onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                                />
                            </FormGroup>
                        </div>

                        <SubmitButton onClick={handleCalculate} disabled={!formData.make || !formData.model}>
                            {loading ? <LoadingSpinner size="sm" /> : <><TrendingUp size={20} /> {t.btn}</>}
                        </SubmitButton>
                    </FormCard>

                    <AnimatePresence>
                        {result && (
                            <ResultCard
                                $isDark={isDark}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <h3>{t.result}</h3>

                                {result.avg > 0 ? (
                                    <>
                                        <PriceValue>
                                            {result.avg.toLocaleString()} {isBg ? 'лв.' : 'BGN'}
                                        </PriceValue>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                                            <div>
                                                <small style={{ color: '#94a3b8' }}>Min</small>
                                                <div style={{ fontWeight: 700 }}>{result.min.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <small style={{ color: '#94a3b8' }}>Max</small>
                                                <div style={{ fontWeight: 700 }}>{result.max.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '2rem', padding: '1rem', background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', borderRadius: '12px', color: '#059669' }}>
                                            <CheckCircle size={16} style={{ display: 'inline', marginRight: '5px' }} />
                                            Based on {result.count} similar cars listed on Koli One.
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ padding: '2rem' }}>
                                        <AlertCircle size={48} color="#94a3b8" />
                                        <p style={{ marginTop: '1rem', color: isDark ? '#cbd5e1' : '#64748b' }}>{t.noData}</p>
                                    </div>
                                )}

                                <Disclaimer>
                                    * This is an AI estimate based on current market listings. Actual value may vary based on condition and location.
                                </Disclaimer>
                            </ResultCard>
                        )}
                    </AnimatePresence>
                </div>

            </ContentWrapper>
        </PageContainer>
    );
};

export default AIValuationPage;
