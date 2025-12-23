/**
 * Sell Vehicle Step 6.5: AI-Powered Description
 * الخطوة 6.5: وصف ذكي بالذكاء الاصطناعي
 * 
 * Inserted between Contact/Location (Step 6) and Final Review
 * Uses SmartDescriptionGenerator component
 */

import React, { useMemo } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import styled from 'styled-components';

import { SmartDescriptionGenerator } from '../../SmartDescriptionGenerator';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SellVehicleStep6_5Props {
  workflowData: Partial<UnifiedWorkflowData>;
  onUpdate: (updates: Partial<UnifiedWorkflowData>) => void;
}

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border);
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoText = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
`;

const DescriptionWrapper = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const SellVehicleStep6_5: React.FC<SellVehicleStep6_5Props> = ({
  workflowData,
  onUpdate
}) => {
  const { language } = useLanguage();

  // Prepare vehicle data for AI generation
  const vehicleData = useMemo(() => ({
    make: workflowData.make || '',
    model: workflowData.model || '',
    year: workflowData.year || new Date().getFullYear(),
    fuelType: workflowData.fuelType,
    transmission: workflowData.transmission,
    mileage: workflowData.mileage,
    engineSize: workflowData.engineSize,
    power: workflowData.power,
    equipment: workflowData.equipment || [],
    condition: workflowData.condition as 'excellent' | 'good' | 'fair' | undefined,
    color: workflowData.color
  }), [workflowData]);

  return (
    <Container>
      <Header>
        <Title>
          <IconWrapper>
            <FileText size={24} />
          </IconWrapper>
          {language === 'bg' ? 'Описание на автомобила' : 'Vehicle Description'}
        </Title>
        <Subtitle>
          {language === 'bg'
            ? 'Добавете професионално описание или използвайте AI за автоматично генериране'
            : 'Add a professional description or use AI to generate one automatically'}
        </Subtitle>
      </Header>

      <InfoBox>
        <Sparkles size={24} style={{ color: '#667eea', flexShrink: 0 }} />
        <InfoContent>
          <InfoTitle>
            {language === 'bg' ? 'AI Помощник' : 'AI Assistant'}
          </InfoTitle>
          <InfoText>
            {language === 'bg'
              ? 'Нашият AI асистент анализира характеристиките на автомобила и генерира професионално, убедително описание на български език. Можете да редактирате генерираното описание по ваше желание.'
              : 'Our AI assistant analyzes the vehicle specifications and generates a professional, persuasive description in Bulgarian. You can edit the generated description as you wish.'}
          </InfoText>
        </InfoContent>
      </InfoBox>

      <DescriptionWrapper>
        <SmartDescriptionGenerator
          vehicleData={vehicleData}
          initialDescription={workflowData.description}
          onChange={(description) => onUpdate({ description })}
          maxLength={800}
          minLength={100}
        />
      </DescriptionWrapper>
    </Container>
  );
};

export default SellVehicleStep6_5;
