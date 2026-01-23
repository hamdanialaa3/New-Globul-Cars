/**
 * AIPricingStep Component
 * Fourth step: Price estimation and equipment suggestions
 * 
 * Features:
 * - Display price estimates from different sources
 * - Show equipment suggestions by category
 * - Complete button to finish wizard
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Shield, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { geminiAnalysisService } from '@/services/ai/gemini-analysis.service';
import { PriceEstimate, EquipmentSuggestions, GeminiCarAnalysisResult } from '@/types/ai-analysis.types';
import { logger } from '@/services/logger-service';

interface AIPricingStepProps {
  analysisResult: GeminiCarAnalysisResult;
  onComplete: (data: {
    priceEstimates: PriceEstimate[];
    equipmentSuggestions: EquipmentSuggestions;
  }) => void;
  onBack: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Section = styled(motion.div)`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const PriceGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
`;

const PriceCard = styled(motion.div)`
  padding: 1.25rem;
  border-radius: 1rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)'};
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }
`;

const PriceSource = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.9);
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PriceRange = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const PriceValue = styled.p`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
  
  span {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
  }
`;

const PriceRangeText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  margin: 0;
`;

const PriceReasoning = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
  margin: 0;
  line-height: 1.5;
`;

const EquipmentGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const CategoryCard = styled(motion.div)`
  padding: 1.25rem;
  border-radius: 1rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
`;

const CategoryTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const EquipmentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EquipmentItem = styled(motion.li)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
  
  svg {
    width: 1rem;
    height: 1rem;
    color: rgba(34, 197, 94, 0.8);
    flex-shrink: 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  
  svg {
    width: 3rem;
    height: 3rem;
    color: rgba(59, 130, 246, 0.8);
  }
`;

const LoadingText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: rgba(239, 68, 68, 0.9);
    flex-shrink: 0;
  }
  
  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 100, 100, 0.95)' : 'rgba(220, 38, 38, 0.95)'};
    margin: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const AIPricingStep: React.FC<AIPricingStepProps> = ({
  analysisResult,
  onComplete,
  onBack
}) => {
  const { currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [priceEstimates, setPriceEstimates] = useState<PriceEstimate[]>([]);
  const [equipmentSuggestions, setEquipmentSuggestions] = useState<EquipmentSuggestions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = {
    title: {
      bg: 'Цени и оборудване',
      en: 'Pricing & Equipment'
    },
    priceSection: {
      bg: 'Прогнозни цени',
      en: 'Price Estimates'
    },
    equipmentSection: {
      bg: 'Препоръчано оборудване',
      en: 'Suggested Equipment'
    },
    categories: {
      safety: { bg: 'Безопасност', en: 'Safety' },
      comfort: { bg: 'Комфорт', en: 'Comfort' },
      infotainment: { bg: 'Развлечения', en: 'Infotainment' }
    },
    range: {
      bg: 'Диапазон',
      en: 'Range'
    },
    loading: {
      bg: 'Зареждане на ценови данни...',
      en: 'Loading pricing data...'
    },
    complete: {
      bg: 'Завърши',
      en: 'Complete'
    },
    back: {
      bg: 'Назад',
      en: 'Back'
    },
    error: {
      bg: 'Не успяхме да заредим ценови данни. Можете да зададете цената ръчно по-късно.',
      en: 'Failed to load pricing data. You can set the price manually later.'
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        logger.info('Fetching pricing data', {
          brand: analysisResult.brand.value,
          model: analysisResult.model.value
        });

        // Fetch price estimates and equipment suggestions in parallel
        const [prices, equipment] = await Promise.all([
          geminiAnalysisService.estimatePrice({
            brand: analysisResult.brand.value,
            model: analysisResult.model.value,
            year: analysisResult.yearRange.value
          }),
          geminiAnalysisService.suggestOptions({
            brand: analysisResult.brand.value,
            model: analysisResult.model.value,
            year: analysisResult.yearRange.value
          })
        ]);

        setPriceEstimates(prices);
        setEquipmentSuggestions(equipment);
        
        logger.info('Pricing data loaded', {
          priceCount: prices.length,
          equipmentCategories: Object.keys(equipment).length
        });

      } catch (err) {
        logger.error('Failed to fetch pricing data', err as Error);
        setError(t.error[currentLanguage]);
        
        // Set default fallback data
        setEquipmentSuggestions({
          safety: ['ABS', 'Airbags', 'ESP'],
          comfort: ['Air Conditioning', 'Power Windows'],
          infotainment: ['Radio', 'Bluetooth']
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [analysisResult, currentLanguage]);

  const handleComplete = () => {
    logger.info('Pricing step completed');
    onComplete({
      priceEstimates,
      equipmentSuggestions: equipmentSuggestions || {
        safety: [],
        comfort: [],
        infotainment: []
      }
    });
  };

  return (
    <Container>
      <GlassCard padding="large">
        <Title>{t.title[currentLanguage]}</Title>

        {isLoading ? (
          <LoadingContainer>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 />
            </motion.div>
            <LoadingText>{t.loading[currentLanguage]}</LoadingText>
          </LoadingContainer>
        ) : (
          <>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ErrorContainer>
                    <AlertTriangle />
                    <p>{error}</p>
                  </ErrorContainer>
                </motion.div>
              )}
            </AnimatePresence>

            {priceEstimates.length > 0 && (
              <Section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionTitle>
                  <TrendingUp />
                  {t.priceSection[currentLanguage]}
                </SectionTitle>
                <PriceGrid>
                  {priceEstimates.map((estimate, index) => (
                    <PriceCard
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PriceSource>{estimate.source}</PriceSource>
                      <PriceRange>
                        <PriceValue>
                          {estimate.avgPrice.toLocaleString()} <span>{estimate.currency}</span>
                        </PriceValue>
                        <PriceRangeText>
                          {t.range[currentLanguage]}: {estimate.minPrice.toLocaleString()} - {estimate.maxPrice.toLocaleString()} {estimate.currency}
                        </PriceRangeText>
                      </PriceRange>
                      <PriceReasoning>{estimate.reasoning}</PriceReasoning>
                    </PriceCard>
                  ))}
                </PriceGrid>
              </Section>
            )}

            {equipmentSuggestions && (
              <Section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionTitle>
                  <Shield />
                  {t.equipmentSection[currentLanguage]}
                </SectionTitle>
                <EquipmentGrid>
                  {Object.entries(t.categories).map(([key, label], categoryIndex) => {
                    const items = equipmentSuggestions[key as keyof EquipmentSuggestions];
                    return (
                      <CategoryCard
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + categoryIndex * 0.1 }}
                      >
                        <CategoryTitle>
                          <Shield />
                          {label[currentLanguage]}
                        </CategoryTitle>
                        <EquipmentList>
                          {items.map((item, itemIndex) => (
                            <EquipmentItem
                              key={itemIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + categoryIndex * 0.1 + itemIndex * 0.05 }}
                            >
                              <CheckCircle2 />
                              {item}
                            </EquipmentItem>
                          ))}
                        </EquipmentList>
                      </CategoryCard>
                    );
                  })}
                </EquipmentGrid>
              </Section>
            )}
          </>
        )}

        <ButtonGroup>
          <GlassButton
            variant="secondary"
            onClick={onBack}
            disabled={isLoading}
            title={t.back[currentLanguage]}
            aria-label={t.back[currentLanguage]}
          >
            {t.back[currentLanguage]}
          </GlassButton>
          <GlassButton
            variant="primary"
            fullWidth
            onClick={handleComplete}
            disabled={isLoading}
            title={t.complete[currentLanguage]}
            aria-label={t.complete[currentLanguage]}
          >
            {t.complete[currentLanguage]}
          </GlassButton>
        </ButtonGroup>
      </GlassCard>
    </Container>
  );
};

export default AIPricingStep;
