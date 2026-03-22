/**
 * AIAnalysisModal Component
 * Main orchestrator for AI car analysis wizard
 * 
 * Features:
 * - 4-step wizard: Upload → Analyzing → Review → Pricing
 * - Modal overlay with glassmorphism design
 * - Progress indicator
 * - State management for all steps
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts';
import { AIAnalysisStep, GeminiCarAnalysisResult, PriceEstimate, EquipmentSuggestions } from '@/types/ai-analysis.types';
import { logger } from '@/services/logger-service';

// Step components
import { AIUploadStep } from './steps/AIUploadStep';
import { AIAnalyzingStep } from './steps/AIAnalyzingStep';
import { AIReviewStep } from './steps/AIReviewStep';
import { AIPricingStep } from './steps/AIPricingStep';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: AIAnalysisCompleteData) => void;
  mode?: 'modal' | 'page';
}

export interface AIAnalysisCompleteData {
  analysisResult: GeminiCarAnalysisResult;
  priceEstimates: PriceEstimate[];
  equipmentSuggestions: EquipmentSuggestions;
  uploadedImages: File[];
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
  width: 100vw;
  height: 100vh;
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1rem;
  background: linear-gradient(180deg, rgba(12, 15, 25, 0.85), rgba(18, 22, 35, 0.9));

  @media (max-width: 1024px) {
    padding: 2.5rem 1.25rem;
  }

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    align-items: stretch;
  }
`;

const ModalContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  align-self: center;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 2rem;
  background: ${({ theme }) => 
    theme.mode === 'dark' 
      ? 'rgba(20, 20, 30, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(40px);
  border: 1px solid ${({ theme }) => 
    theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'
  };
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 ${({ theme }) => 
      theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.8)'
    };
  
  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 1.5rem;
  }
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: ${({ theme }) => 
    theme.mode === 'dark' 
      ? 'rgba(20, 20, 30, 0.98)' 
      : 'rgba(255, 255, 255, 0.98)'
  };
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => 
    theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'
  };
  border-radius: 2rem 2rem 0 0;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1.25rem 1.5rem;
    border-radius: 1.5rem 1.5rem 0 0;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const CloseButton = styled(motion.button)`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'};
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0 2rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const ProgressStep = styled.div<{ $active: boolean; $completed: boolean }>`
  flex: 1;
  height: 0.375rem;
  border-radius: 0.25rem;
  background: ${({ $active, $completed, theme }) => {
    if ($completed) return 'linear-gradient(90deg, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 0.6))';
    if ($active) return 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8))';
    return theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  }};
  transition: all 0.3s ease;
`;

const Content = styled.div`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const STEPS: AIAnalysisStep[] = ['upload', 'analyzing', 'review', 'pricing'];

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  mode = 'modal'
}) => {
  const { language } = useLanguage();
  const lang = language === 'bg' ? 'bg' : 'en';
  const [currentStep, setCurrentStep] = useState<AIAnalysisStep>('upload');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<GeminiCarAnalysisResult | null>(null);
  const [priceEstimates, setPriceEstimates] = useState<PriceEstimate[]>([]);
  const [equipmentSuggestions, setEquipmentSuggestions] = useState<EquipmentSuggestions | null>(null);

  const t = {
    title: {
      bg: 'AI Анализ на Автомобил',
      en: 'AI Car Analysis'
    }
  };

  const handleUploadComplete = (images: File[]) => {
    setUploadedImages(images);
    setCurrentStep('analyzing');
    logger.info('Upload step completed', { imageCount: images.length });
  };

  const handleAnalysisComplete = (result: GeminiCarAnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep('review');
    logger.info('Analysis step completed', {
      brand: result.brand.value,
      model: result.model.value
    });
  };

  const handleAnalysisError = (error: string) => {
    logger.error('Analysis failed', new Error(error));
    // Go back to upload step
    setCurrentStep('upload');
  };

  const handleReviewComplete = (editedResult: GeminiCarAnalysisResult) => {
    setAnalysisResult(editedResult);
    setCurrentStep('pricing');
    logger.info('Review step completed');
  };

  const handlePricingComplete = (data: {
    priceEstimates: PriceEstimate[];
    equipmentSuggestions: EquipmentSuggestions;
  }) => {
    setPriceEstimates(data.priceEstimates);
    setEquipmentSuggestions(data.equipmentSuggestions);
    
    logger.info('Pricing step completed', {
      priceCount: data.priceEstimates.length
    });

    // Complete the entire wizard
    if (onComplete && analysisResult) {
      onComplete({
        analysisResult,
        priceEstimates: data.priceEstimates,
        equipmentSuggestions: data.equipmentSuggestions,
        uploadedImages
      });
      // In page mode, onComplete handles navigation — don't also call handleClose
      // which would trigger navigate(-1) and undo the navigation
      if (mode !== 'page') {
        setTimeout(() => { handleClose(); }, 500);
      }
    } else {
      // No onComplete handler — just close
      setTimeout(() => { handleClose(); }, 500);
    }
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep('upload');
    setUploadedImages([]);
    setAnalysisResult(null);
    setPriceEstimates([]);
    setEquipmentSuggestions(null);
    
    onClose();
    logger.info('AI Analysis modal closed');
  };

  const getCurrentStepIndex = () => STEPS.indexOf(currentStep);

  const content = (
    <ModalContainer
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Header>
        <HeaderTitle>{t.title[lang]}</HeaderTitle>
        <CloseButton
          onClick={handleClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={lang === 'bg' ? 'Затвори' : 'Close'}
        >
          <X />
        </CloseButton>
      </Header>

      <ProgressBar>
        {STEPS.map((step, index) => (
          <ProgressStep
            key={step}
            $active={index === getCurrentStepIndex()}
            $completed={index < getCurrentStepIndex()}
          />
        ))}
      </ProgressBar>

      <Content>
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AIUploadStep
                onContinue={handleUploadComplete}
                initialImages={uploadedImages}
              />
            </motion.div>
          )}

          {currentStep === 'analyzing' && uploadedImages.length > 0 && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AIAnalyzingStep
                image={uploadedImages[0]}
                onComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </motion.div>
          )}

          {currentStep === 'review' && analysisResult && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AIReviewStep
                result={analysisResult}
                onContinue={handleReviewComplete}
                onBack={() => setCurrentStep('upload')}
              />
            </motion.div>
          )}

          {currentStep === 'pricing' && analysisResult && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AIPricingStep
                analysisResult={analysisResult}
                onComplete={handlePricingComplete}
                onBack={() => setCurrentStep('review')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Content>
    </ModalContainer>
  );

  if (mode === 'page') {
    return <PageWrapper>{content}</PageWrapper>;
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        {content}
      </Overlay>
    </AnimatePresence>
  );
};

export default AIAnalysisModal;
