/**
 * عرض نتائج التسعير
 * Pricing Results Component
 */

import React from 'react';
import styled from 'styled-components';
import { PricingResponse } from '../types/pricing.types';
import { formatPrice, formatPriceRange, formatMileage } from '../utils/price-formatters';
import { getPriceColor } from '../utils/price-formatters';

interface PricingResultProps {
  result: PricingResponse;
}

const ResultContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
`;

const PriceRangeSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  color: white;
  text-align: center;
  margin-bottom: 24px;
`;

const PriceLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const PriceValue = styled.div`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const PriceRange = styled.div`
  font-size: 18px;
  opacity: 0.9;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const InfoCard = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
`;

const Reasoning = styled.div`
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  padding: 16px;
  border-radius: 4px;
  color: #1e40af;
  line-height: 1.6;
`;

const FactorsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FactorItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
  
  &::before {
    content: '•';
    color: #3b82f6;
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-right: 8px;
  }
`;

const ConfidenceBadge = styled.div<{ confidence: number }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => {
    if (props.confidence >= 80) return '#d1fae5';
    if (props.confidence >= 60) return '#fef3c7';
    return '#fee2e2';
  }};
  color: ${props => {
    if (props.confidence >= 80) return '#065f46';
    if (props.confidence >= 60) return '#92400e';
    return '#991b1b';
  }};
`;

const TrendBadge = styled.div<{ trend: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => {
    if (props.trend === 'increasing') return '#fee2e2';
    if (props.trend === 'decreasing') return '#d1fae5';
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.trend === 'increasing') return '#991b1b';
    if (props.trend === 'decreasing') return '#065f46';
    return '#374151';
  }};
`;

export const PricingResult: React.FC<PricingResultProps> = ({ result }) => {
  const { specs, aiAnalysis, priceRange, marketData } = result;

  return (
    <ResultContainer>
      <Title>نتائج التسعير</Title>

      <PriceRangeSection>
        <PriceLabel>السعر المقدر</PriceLabel>
        <PriceValue>{formatPrice(priceRange.average, priceRange.currency)}</PriceValue>
        <PriceRange>
          {formatPriceRange(priceRange.low, priceRange.high, priceRange.currency)}
        </PriceRange>
      </PriceRangeSection>

      <InfoGrid>
        <InfoCard>
          <InfoLabel>البراند</InfoLabel>
          <InfoValue>{specs.brand}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>الموديل</InfoLabel>
          <InfoValue>{specs.model}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>السنة</InfoLabel>
          <InfoValue>{specs.year}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>المسافة</InfoLabel>
          <InfoValue>{formatMileage(specs.mileage)}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>الثقة</InfoLabel>
          <InfoValue>
            <ConfidenceBadge confidence={aiAnalysis.confidence}>
              {aiAnalysis.confidence}%
            </ConfidenceBadge>
          </InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>اتجاه السوق</InfoLabel>
          <InfoValue>
            <TrendBadge trend={aiAnalysis.marketTrend}>
              {aiAnalysis.marketTrend === 'increasing' ? 'متزايد' :
               aiAnalysis.marketTrend === 'decreasing' ? 'متناقص' : 'مستقر'}
            </TrendBadge>
          </InfoValue>
        </InfoCard>
      </InfoGrid>

      <Section>
        <SectionTitle>التحليل والاستنتاج</SectionTitle>
        <Reasoning>{aiAnalysis.reasoning}</Reasoning>
      </Section>

      {aiAnalysis.factors.length > 0 && (
        <Section>
          <SectionTitle>العوامل المؤثرة</SectionTitle>
          <FactorsList>
            {aiAnalysis.factors.map((factor, index) => (
              <FactorItem key={index}>{factor}</FactorItem>
            ))}
          </FactorsList>
        </Section>
      )}

      {marketData.length > 0 && (
        <Section>
          <SectionTitle>بيانات السوق ({marketData.length} نتيجة)</SectionTitle>
          <InfoCard>
            <InfoLabel>عدد النتائج من المواقع البلغارية</InfoLabel>
            <InfoValue>{marketData.length} إعلان</InfoValue>
          </InfoCard>
        </Section>
      )}
    </ResultContainer>
  );
};
