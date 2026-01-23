/**
 * AIReviewStep Component
 * Third step: Review and edit AI analysis results
 * 
 * Features:
 * - Display analysis results with confidence scores
 * - Visual confidence bars
 * - Edit capability for low-confidence fields
 * - Reasoning display
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Edit2 } from 'lucide-react';
import { useLanguage } from '@/contexts';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GeminiCarAnalysisResult } from '@/types/ai-analysis.types';
import { logger } from '@/services/logger-service';

interface AIReviewStepProps {
  result: GeminiCarAnalysisResult;
  onContinue: (editedResult: GeminiCarAnalysisResult) => void;
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

const FieldGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const FieldCard = styled(motion.div)<{ $lowConfidence: boolean }>`
  padding: 1rem;
  border-radius: 1rem;
  background: ${({ $lowConfidence, theme }) => 
    $lowConfidence 
      ? 'rgba(251, 191, 36, 0.05)' 
      : theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
  };
  border: 1px solid ${({ $lowConfidence, theme }) => 
    $lowConfidence 
      ? 'rgba(251, 191, 36, 0.3)' 
      : theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  };
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
  }
`;

const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const FieldLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const EditButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border: none;
  background: rgba(59, 130, 246, 0.1);
  color: rgba(59, 130, 246, 0.9);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
  }
  
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;

const FieldValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const ValueText = styled.p<{ $isEditing?: boolean }>`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
  margin: 0;
  flex: 1;
  
  ${({ $isEditing }) => $isEditing && `
    padding: 0.5rem;
    border: 2px solid rgba(59, 130, 246, 0.5);
    border-radius: 0.5rem;
    background: rgba(59, 130, 246, 0.05);
  `}
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 0.75rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.8);
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 1)'};
  }
`;

const ConfidenceBar = styled.div`
  position: relative;
  height: 0.5rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 0.25rem;
  overflow: hidden;
`;

const ConfidenceFill = styled(motion.div)<{ $confidence: number }>`
  height: 100%;
  border-radius: 0.25rem;
  background: ${({ $confidence }) => {
    if ($confidence >= 0.8) return 'linear-gradient(90deg, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 0.6))';
    if ($confidence >= 0.5) return 'linear-gradient(90deg, rgba(251, 191, 36, 0.8), rgba(251, 191, 36, 0.6))';
    return 'linear-gradient(90deg, rgba(239, 68, 68, 0.8), rgba(239, 68, 68, 0.6))';
  }};
`;

const ConfidenceText = styled.span<{ $confidence: number }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $confidence }) => {
    if ($confidence >= 0.8) return 'rgba(34, 197, 94, 0.9)';
    if ($confidence >= 0.5) return 'rgba(251, 191, 36, 0.9)';
    return 'rgba(239, 68, 68, 0.9)';
  }};
  margin-left: 0.5rem;
`;

const ConfidenceIcon = styled.span<{ $confidence: number }>`
  display: flex;
  align-items: center;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: ${({ $confidence }) => {
      if ($confidence >= 0.8) return 'rgba(34, 197, 94, 0.9)';
      if ($confidence >= 0.5) return 'rgba(251, 191, 36, 0.9)';
      return 'rgba(239, 68, 68, 0.9)';
    }};
  }
`;

const ReasoningCard = styled(motion.div)`
  padding: 1.25rem;
  border-radius: 1rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)'};
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin-top: 1rem;
`;

const ReasoningTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.9);
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ReasoningText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
  margin: 0;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

interface EditingState {
  [key: string]: boolean;
}

export const AIReviewStep: React.FC<AIReviewStepProps> = ({ result, onContinue, onBack }) => {
  const { currentLanguage } = useLanguage();
  const [editedResult, setEditedResult] = useState<GeminiCarAnalysisResult>(result);
  const [editing, setEditing] = useState<EditingState>({});

  const t = {
    title: {
      bg: 'Проверете резултатите',
      en: 'Review Results'
    },
    fields: {
      brand: { bg: 'Марка', en: 'Brand' },
      model: { bg: 'Модел', en: 'Model' },
      yearRange: { bg: 'Година', en: 'Year' },
      bodyType: { bg: 'Тип купе', en: 'Body Type' },
      color: { bg: 'Цвят', en: 'Color' },
      trim: { bg: 'Версия', en: 'Trim' },
      damage: { bg: 'Повреди', en: 'Damage' }
    },
    reasoning: {
      bg: 'AI обяснение',
      en: 'AI Reasoning'
    },
    edit: {
      bg: 'Редактирай',
      en: 'Edit'
    },
    save: {
      bg: 'Запази',
      en: 'Save'
    },
    confidence: {
      bg: 'Сигурност',
      en: 'Confidence'
    },
    continue: {
      bg: 'Продължи',
      en: 'Continue'
    },
    back: {
      bg: 'Назад',
      en: 'Back'
    }
  };

  const handleEdit = (field: keyof typeof t.fields) => {
    setEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleValueChange = (field: keyof typeof t.fields, value: string) => {
    setEditedResult(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        confidence: 1.0 // User-edited = 100% confidence
      }
    }));
    logger.info('Field edited', { field, value });
  };

  const handleContinue = () => {
    logger.info('Review completed', {
      brand: editedResult.brand.value,
      model: editedResult.model.value
    });
    onContinue(editedResult);
  };

  const renderField = (field: keyof typeof t.fields) => {
    const fieldData = editedResult[field];
    
    // Guard: Skip if field data is missing
    if (!fieldData) {
      return null;
    }
    
    const isEditing = editing[field];
    const lowConfidence = fieldData.confidence < 0.5;

    return (
      <FieldCard
        key={field}
        $lowConfidence={lowConfidence}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Object.keys(t.fields).indexOf(field) * 0.05 }}
      >
        <FieldHeader>
          <FieldLabel>{t.fields[field][currentLanguage]}</FieldLabel>
          <EditButton
            onClick={() => handleEdit(field)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 />
            {isEditing ? t.save[currentLanguage] : t.edit[currentLanguage]}
          </EditButton>
        </FieldHeader>

        <FieldValue>
          {isEditing ? (
            <Input
              type="text"
              value={fieldData.value}
              onChange={(e) => handleValueChange(field, e.target.value)}
              autoFocus
            />
          ) : (
            <>
              <ValueText>{fieldData.value}</ValueText>
              <ConfidenceIcon $confidence={fieldData.confidence}>
                {fieldData.confidence >= 0.8 ? <CheckCircle2 /> : <AlertTriangle />}
              </ConfidenceIcon>
            </>
          )}
        </FieldValue>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ConfidenceBar>
            <ConfidenceFill
              $confidence={fieldData.confidence}
              initial={{ width: 0 }}
              animate={{ width: `${fieldData.confidence * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </ConfidenceBar>
          <ConfidenceText $confidence={fieldData.confidence}>
            {Math.round(fieldData.confidence * 100)}%
          </ConfidenceText>
        </div>
      </FieldCard>
    );
  };

  return (
    <Container>
      <GlassCard padding="large">
        <Title>{t.title[currentLanguage]}</Title>

        <FieldGrid>
          {(Object.keys(t.fields) as Array<keyof typeof t.fields>).map(renderField)}
        </FieldGrid>

        <ReasoningCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ReasoningTitle>{t.reasoning[currentLanguage]}</ReasoningTitle>
          <ReasoningText>{result.reasoning}</ReasoningText>
        </ReasoningCard>

        <ButtonGroup>
          <GlassButton
            variant="secondary"
            onClick={onBack}
            title={t.back[currentLanguage]}
            aria-label={t.back[currentLanguage]}
          >
            {t.back[currentLanguage]}
          </GlassButton>
          <GlassButton
            variant="primary"
            fullWidth
            onClick={handleContinue}
            title={t.continue[currentLanguage]}
            aria-label={t.continue[currentLanguage]}
          >
            {t.continue[currentLanguage]}
          </GlassButton>
        </ButtonGroup>
      </GlassCard>
    </Container>
  );
};

export default AIReviewStep;
