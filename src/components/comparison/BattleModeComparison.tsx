// src/components/comparison/BattleModeComparison.tsx
// Battle Mode Comparison Component - مكون مقارنة السيارات
// الهدف: واجهة مقارنة متقدمة بين سيارتين
// الموقع: بلغاريا | اللغات: BG/EN

import React from 'react';
import styled from 'styled-components';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ComparisonResults, ComparisonCar, ComparisonWinners } from '../../types/comparison.types';
import { comparisonService } from '../../services/comparison/comparison.service';

// ==================== STYLED COMPONENTS ====================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border-radius: 16px;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text?.primary || theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border: none;
  color: ${({ theme }) => theme.text?.primary || theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
  }
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  padding: 2rem;
`;

const CarColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CarHeader = styled.div`
  text-align: center;
`;

const CarImage = styled.img`
  width: 100%;
  max-width: 400px;
  height: 250px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const CarTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text?.primary || theme.colors.text.primary};
  margin: 0;
`;

const CarSubtitle = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.text?.secondary || theme.colors.text.secondary};
  margin-top: 0.5rem;
`;

const ComparisonColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  min-width: 200px;
`;

const ComparisonRow = styled.div<{ $winner?: 'A' | 'B' | 'none' }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => {
    if (props.$winner === 'A') return 'rgba(34, 197, 94, 0.1)';
    if (props.$winner === 'B') return 'rgba(239, 68, 68, 0.1)';
    return 'transparent';
  }};
  border: 1px solid ${props => {
    if (props.$winner === 'A') return 'rgba(34, 197, 94, 0.3)';
    if (props.$winner === 'B') return 'rgba(239, 68, 68, 0.3)';
    return 'transparent';
  }};
`;

const ValueCell = styled.div<{ $highlight?: boolean }>`
  font-size: 1.125rem;
  font-weight: ${props => props.$highlight ? 700 : 500};
  color: ${props => props.$highlight 
    ? props.theme.colors.primary || '#FF8F10'
    : props.theme.text?.primary || props.theme.colors.text.primary};
  text-align: center;
`;

const LabelCell = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text?.secondary || theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const WinnerBadge = styled.div<{ $winner: 'A' | 'B' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$winner === 'A' 
    ? 'rgba(34, 197, 94, 0.2)'
    : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.$winner === 'A' 
    ? '#22c55e'
    : '#ef4444'};
`;

const RecommendationSection = styled.div`
  padding: 2rem;
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'};
`;

const RecommendationTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text?.primary || theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const RecommendationText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.text?.secondary || theme.colors.text.secondary};
  line-height: 1.6;
  white-space: pre-line;
`;

// ==================== COMPONENT ====================

interface BattleModeComparisonProps {
  carA: ComparisonCar;
  carB: ComparisonCar;
  onClose: () => void;
}

const BattleModeComparison: React.FC<BattleModeComparisonProps> = ({
  carA,
  carB,
  onClose
}) => {
  const { language } = useLanguage();
  
  const results = comparisonService.compareCars(carA, carB);
  const { differences, winners, overallWinner, recommendation } = results;

  const getWinnerForRow = (category: keyof ComparisonWinners): 'A' | 'B' | 'none' => {
    const winner = winners[category];
    if (winner === 'A' || winner === 'B') return winner;
    return 'none';
  };

  const getLabel = (key: string): string => {
    const labels: Record<string, { bg: string; en: string }> = {
      price: { bg: 'Цена', en: 'Price' },
      year: { bg: 'Година', en: 'Year' },
      mileage: { bg: 'Километри', en: 'Mileage' },
      power: { bg: 'Мощност', en: 'Power' },
      features: { bg: 'Особености', en: 'Features' }
    };
    return labels[key]?.[language] || key;
  };

  const formatValue = (key: string, value: any): string => {
    if (key === 'price') return `${value.toLocaleString()} лв.`;
    if (key === 'mileage') return `${value.toLocaleString()} км`;
    if (key === 'power') return `${value} к.с.`;
    if (key === 'features') return `${value.length} ${language === 'bg' ? 'особености' : 'features'}`;
    return String(value);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            {language === 'bg' ? 'Сравнение на Коли' : 'Car Comparison'}
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <ComparisonGrid>
          <CarColumn>
            <CarHeader>
              <CarImage 
                src={carA.imageUrl || '/images/placeholder.png'} 
                alt={`${carA.make} ${carA.model}`}
              />
              <CarTitle>{carA.make} {carA.model}</CarTitle>
              <CarSubtitle>{carA.year}</CarSubtitle>
            </CarHeader>
            
            <ValueCell $highlight>{formatValue('price', carA.price)}</ValueCell>
            <ValueCell>{formatValue('year', carA.year)}</ValueCell>
            <ValueCell>{formatValue('mileage', carA.mileage)}</ValueCell>
            {carA.power && <ValueCell>{formatValue('power', carA.power)}</ValueCell>}
            {carA.features && <ValueCell>{formatValue('features', carA.features)}</ValueCell>}
          </CarColumn>

          <ComparisonColumn>
            <LabelCell>
              {language === 'bg' ? 'Параметър' : 'Parameter'}
            </LabelCell>
            
            <ComparisonRow $winner={getWinnerForRow('price')}>
              <ValueCell>{formatValue('price', carA.price)}</ValueCell>
              <LabelCell>{getLabel('price')}</LabelCell>
              <ValueCell>{formatValue('price', carB.price)}</ValueCell>
            </ComparisonRow>

            <ComparisonRow $winner={getWinnerForRow('year')}>
              <ValueCell>{formatValue('year', carA.year)}</ValueCell>
              <LabelCell>{getLabel('year')}</LabelCell>
              <ValueCell>{formatValue('year', carB.year)}</ValueCell>
            </ComparisonRow>

            <ComparisonRow $winner={getWinnerForRow('mileage')}>
              <ValueCell>{formatValue('mileage', carA.mileage)}</ValueCell>
              <LabelCell>{getLabel('mileage')}</LabelCell>
              <ValueCell>{formatValue('mileage', carB.mileage)}</ValueCell>
            </ComparisonRow>

            {carA.power && carB.power && winners.power && (
              <ComparisonRow $winner={getWinnerForRow('power')}>
                <ValueCell>{formatValue('power', carA.power)}</ValueCell>
                <LabelCell>{getLabel('power')}</LabelCell>
                <ValueCell>{formatValue('power', carB.power)}</ValueCell>
              </ComparisonRow>
            )}

            {carA.features && carB.features && (
              <ComparisonRow $winner={winners.features === 'tie' ? 'none' : getWinnerForRow('features')}>
                <ValueCell>{formatValue('features', carA.features)}</ValueCell>
                <LabelCell>{getLabel('features')}</LabelCell>
                <ValueCell>{formatValue('features', carB.features)}</ValueCell>
              </ComparisonRow>
            )}
          </ComparisonColumn>

          <CarColumn>
            <CarHeader>
              <CarImage 
                src={carB.imageUrl || '/images/placeholder.png'} 
                alt={`${carB.make} ${carB.model}`}
              />
              <CarTitle>{carB.make} {carB.model}</CarTitle>
              <CarSubtitle>{carB.year}</CarSubtitle>
            </CarHeader>
            
            <ValueCell $highlight>{formatValue('price', carB.price)}</ValueCell>
            <ValueCell>{formatValue('year', carB.year)}</ValueCell>
            <ValueCell>{formatValue('mileage', carB.mileage)}</ValueCell>
            {carB.power && <ValueCell>{formatValue('power', carB.power)}</ValueCell>}
            {carB.features && <ValueCell>{formatValue('features', carB.features)}</ValueCell>}
          </CarColumn>
        </ComparisonGrid>

        {recommendation && (
          <RecommendationSection>
            <RecommendationTitle>
              {language === 'bg' ? 'Препоръка' : 'Recommendation'}
            </RecommendationTitle>
            <RecommendationText>
              {recommendation.split('\n').filter(line => {
                // Filter by language
                if (language === 'bg') {
                  return /[а-яА-Я]/.test(line);
                } else {
                  return /[a-zA-Z]/.test(line) && !/[а-яА-Я]/.test(line);
                }
              }).join('\n')}
            </RecommendationText>
          </RecommendationSection>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default BattleModeComparison;

