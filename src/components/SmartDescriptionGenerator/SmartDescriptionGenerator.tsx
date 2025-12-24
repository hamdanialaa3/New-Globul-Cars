/**
 * Smart Description Generator Component
 * AI-powered vehicle description generator with manual editing
 * 
 * Features:
 * - Generate button with loading state
 * - Textarea for manual editing
 * - Character counter
 * - Language toggle (BG/EN)
 * - Validation
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import styled from 'styled-components';

import { vehicleDescriptionGenerator } from '../../services/ai/vehicle-description-generator.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';

interface VehicleData {
  make: string;
  model: string;
  year: number;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  equipment?: string[];
  condition?: 'excellent' | 'good' | 'fair';
}

interface SmartDescriptionGeneratorProps {
  vehicleData: VehicleData;
  initialDescription?: string;
  onChange: (description: string) => void;
  maxLength?: number;
  minLength?: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GenerateButton = styled.button<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$loading ? 0.7 : 1};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  svg {
    animation: ${props => props.$loading ? 'spin 1s linear infinite' : 'none'};
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const TextareaWrapper = styled.div<{ $valid?: boolean; $error?: boolean }>`
  position: relative;
  border: 2px solid ${props => 
    props.$error ? '#ef4444' : 
    props.$valid ? '#22c55e' : 
    'var(--border)'};
  border-radius: 10px;
  background: var(--bg-card);
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: ${props => 
      props.$error ? '#ef4444' : 
      props.$valid ? '#22c55e' : 
      'var(--accent-primary)'};
    box-shadow: 0 0 0 3px ${props => 
      props.$error ? 'rgba(239, 68, 68, 0.1)' : 
      props.$valid ? 'rgba(34, 197, 94, 0.1)' : 
      'rgba(59, 130, 246, 0.1)'};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--text-tertiary);
    opacity: 0.5;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
`;

const CharCounter = styled.div<{ $warn?: boolean; $error?: boolean }>`
  font-size: 0.875rem;
  color: ${props => 
    props.$error ? '#ef4444' : 
    props.$warn ? '#f59e0b' : 
    'var(--text-secondary)'};
  font-weight: 500;
`;

const GenerationInfo = styled.div<{ $type: 'ai' | 'template' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.5rem 0.75rem;
  background: ${props => props.$type === 'ai' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(234, 179, 8, 0.1)'};
  border-radius: 6px;
`;

const ValidationMessage = styled.div<{ $type: 'success' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.$type === 'success' ? '#22c55e' : '#ef4444'};
  margin-top: 0.5rem;
`;

export const SmartDescriptionGenerator: React.FC<SmartDescriptionGeneratorProps> = ({
  vehicleData,
  initialDescription = '',
  onChange,
  maxLength = 800,
  minLength = 100
}) => {
  const { language } = useLanguage();
  const [description, setDescription] = useState(initialDescription);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<'ai' | 'template' | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // Sync with parent
  useEffect(() => {
    onChange(description);
    validateDescription(description);
  }, [description]);

  // Sync with initial value changes
  useEffect(() => {
    if (initialDescription && !description) {
      setDescription(initialDescription);
    }
  }, [initialDescription]);

  const validateDescription = (text: string) => {
    // Description is optional - if empty, it's valid
    if (!text || text.trim().length === 0) {
      setValidationError('');
      return true; // Empty description is valid (optional field)
    }

    // Only validate length if text is provided and minLength > 0
    if (minLength > 0 && text.length < minLength) {
      setValidationError(language === 'bg' 
        ? `Описанието е твърде кратко (минимум ${minLength} символа)`
        : `Description too short (minimum ${minLength} characters)`);
      return false;
    }

    if (text.length > maxLength) {
      setValidationError(language === 'bg'
        ? `Описанието е твърде дълго (максимум ${maxLength} символа)`
        : `Description too long (maximum ${maxLength} characters)`);
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setValidationError('');

    try {
      logger.info('Generating AI description', { vehicleData, language });

      const result = await vehicleDescriptionGenerator.generateDescription(
        vehicleData,
        { 
          language: language as 'bg' | 'en',
          maxLength 
        }
      );

      setDescription(result.description);
      setGenerationSource(result.generatedBy);

      logger.info('Description generated successfully', { 
        source: result.generatedBy,
        length: result.characterCount 
      });

    } catch (error) {
      logger.error('Description generation failed', error as Error);
      setValidationError(language === 'bg'
        ? 'Грешка при генерирането. Моля, опитайте отново.'
        : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setGenerationSource(null); // User is editing, remove generation badge
  };

  // Description is optional - valid if empty or within length limits
  const isValid = description.length === 0 || (description.length >= (minLength || 0) && description.length <= maxLength);
  const isWarning = description.length > maxLength * 0.8;

  return (
    <Container>
      <Header>
        <Label>
          {language === 'bg' ? 'Описание' : 'Description'}
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginLeft: '0.25rem' }}>
            ({language === 'bg' ? 'по избор' : 'optional'})
          </span>
        </Label>
        <GenerateButton
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          $loading={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} />
              {language === 'bg' ? 'Генериране...' : 'Generating...'}
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {language === 'bg' ? 'AI Генериране' : 'AI Generate'}
            </>
          )}
        </GenerateButton>
      </Header>

      <TextareaWrapper $valid={isValid && description.length > 0} $error={!!validationError}>
        <Textarea
          value={description}
          onChange={handleChange}
          placeholder={language === 'bg'
            ? 'Опишете автомобила (по избор)... Или натиснете "AI Генериране" за автоматично описание.'
            : 'Describe the vehicle (optional)... Or click "AI Generate" for automatic description.'}
          disabled={isGenerating}
        />
      </TextareaWrapper>

      <Footer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {generationSource && (
            <GenerationInfo $type={generationSource}>
              {generationSource === 'ai' ? <Sparkles size={14} /> : <CheckCircle size={14} />}
              {language === 'bg' 
                ? (generationSource === 'ai' ? 'Генерирано от AI' : 'Шаблонно описание')
                : (generationSource === 'ai' ? 'AI Generated' : 'Template Description')}
            </GenerationInfo>
          )}
          
          {validationError && (
            <ValidationMessage $type="error">
              <AlertCircle size={14} />
              {validationError}
            </ValidationMessage>
          )}

          {isValid && description.length > 0 && !validationError && (
            <ValidationMessage $type="success">
              <CheckCircle size={14} />
              {language === 'bg' ? 'Валидно описание' : 'Valid description'}
            </ValidationMessage>
          )}
        </div>

        <CharCounter $warn={isWarning} $error={!!validationError}>
          {description.length} / {maxLength}
        </CharCounter>
      </Footer>
    </Container>
  );
};

export default SmartDescriptionGenerator;
