/**
 * AIAnalyzingStep Component
 * Second step: Analyze car images with AI
 * 
 * Features:
 * - Loading animation with pulse effect
 * - Real-time progress text
 * - Auto-advances on completion
 * - Error handling with retry
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { geminiAnalysisService } from '@/services/ai/gemini-analysis.service';
import { GeminiCarAnalysisResult } from '@/types/ai-analysis.types';
import { logger } from '@/services/logger-service';

interface AIAnalyzingStepProps {
  image: File;
  onComplete: (result: GeminiCarAnalysisResult) => void;
  onError: (error: string) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const AnimationContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    gap: 1.5rem;
  }
`;

const SpinnerWrapper = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpinnerCircle = styled(motion.div)`
  position: absolute;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: rgba(59, 130, 246, 0.6);
  border-right-color: rgba(147, 51, 234, 0.6);
  
  @media (max-width: 768px) {
    width: 6rem;
    height: 6rem;
  }
`;

const SpinnerIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 4rem;
    height: 4rem;
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
  }
  
  @media (max-width: 768px) {
    svg {
      width: 3rem;
      height: 3rem;
    }
  }
`;

const ProgressText = styled(motion.p)`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
  margin: 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SubText = styled(motion.p)`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
  margin: 0;
  text-align: center;
  max-width: 400px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
`;

const ErrorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  
  svg {
    width: 2rem;
    height: 2rem;
    color: rgba(239, 68, 68, 0.9);
  }
`;

const ErrorText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 100, 100, 0.95)' : 'rgba(220, 38, 38, 0.95)'};
  margin: 0;
  text-align: center;
  max-width: 400px;
  line-height: 1.6;
`;

export const AIAnalyzingStep: React.FC<AIAnalyzingStepProps> = ({
  image,
  onComplete,
  onError
}) => {
  const { currentLanguage } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState(0);

  const stages = {
    bg: [
      'Подготовка на изображението...',
      'Анализиране на автомобила...',
      'Разпознаване на марка и модел...',
      'Оценка на състоянието...',
      'Финализиране на резултатите...'
    ],
    en: [
      'Preparing image...',
      'Analyzing car...',
      'Recognizing brand and model...',
      'Assessing condition...',
      'Finalizing results...'
    ]
  };

  const t = {
    stages,
    description: {
      bg: 'AI алгоритъмът анализира снимката и извлича информация за автомобила',
      en: 'AI algorithm is analyzing the image and extracting car information'
    },
    errorTitle: {
      bg: 'Анализът не успя',
      en: 'Analysis Failed'
    },
    retry: {
      bg: 'Опитай отново',
      en: 'Try Again'
    },
    manualEntry: {
      bg: 'Въведи ръчно',
      en: 'Enter Manually'
    }
  };

  useEffect(() => {
    if (!geminiAnalysisService.isReady()) {
      const errorMsg = currentLanguage === 'bg' 
        ? 'AI услугата не е налична. Моля, въведете данните ръчно.'
        : 'AI service is not available. Please enter data manually.';
      setError(errorMsg);
      setIsAnalyzing(false);
      onError(errorMsg);
      logger.error('Gemini service not initialized');
      return;
    }

    const analyze = async () => {
      try {
        setIsAnalyzing(true);
        setError(null);
        logger.info('Starting AI analysis', { fileName: image.name });

        // Progress simulation
        const progressInterval = setInterval(() => {
          setProgressStage(prev => {
            const stagesArray = stages[currentLanguage as 'bg' | 'en'] || stages.en;
            const next = prev + 1;
            return next >= stagesArray.length ? prev : next;
          });
        }, 1500);

        // Convert image to base64
        const base64 = await geminiAnalysisService.fileToBase64(image);
        
        // Analyze with Gemini
        const result = await geminiAnalysisService.analyzeCarImage(base64);
        
        clearInterval(progressInterval);
        
        logger.info('AI analysis completed', {
          brand: result.brand.value,
          model: result.model.value,
          confidence: result.brand.confidence
        });

        // Small delay before advancing
        setTimeout(() => {
          onComplete(result);
        }, 500);

      } catch (err) {
        logger.error('AI analysis failed', err as Error);
        
        const errorMsg = currentLanguage === 'bg'
          ? 'Не успяхме да анализираме снимката. Моля, опитайте отново или въведете данните ръчно.'
          : 'Failed to analyze the image. Please try again or enter data manually.';
        
        setError(errorMsg);
        setIsAnalyzing(false);
        onError(errorMsg);
      }
    };

    analyze();
  }, [image, currentLanguage, onComplete, onError]);

  const handleRetry = () => {
    setProgressStage(0);
    setError(null);
    setIsAnalyzing(true);
    // Re-run analysis by resetting component
    window.location.reload();
  };

  if (error) {
    return (
      <Container>
        <GlassCard padding="large">
          <ErrorContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ErrorIcon>
              <AlertTriangle />
            </ErrorIcon>
            <div>
              <ProgressText style={{ marginBottom: '0.5rem' }}>
                {t.errorTitle[currentLanguage]}
              </ProgressText>
              <ErrorText>{error}</ErrorText>
            </div>
            <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
              <GlassButton
                variant="secondary"
                fullWidth
                onClick={handleRetry}
              >
                {t.retry[currentLanguage]}
              </GlassButton>
              <GlassButton
                variant="primary"
                fullWidth
                onClick={() => onError(error)}
              >
                {t.manualEntry[currentLanguage]}
              </GlassButton>
            </div>
          </ErrorContainer>
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container>
      <GlassCard padding="large">
        <AnimationContainer>
          <SpinnerWrapper>
            <SpinnerCircle
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <SpinnerIcon
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Sparkles />
            </SpinnerIcon>
          </SpinnerWrapper>

          <motion.div
            key={progressStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressText>
              {stages[currentLanguage as 'bg' | 'en']?.[progressStage] || stages[currentLanguage as 'bg' | 'en']?.[0] || stages.en[0]}
            </ProgressText>
          </motion.div>

          <SubText
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {t.description[currentLanguage]}
          </SubText>
        </AnimationContainer>
      </GlassCard>
    </Container>
  );
};

export default AIAnalyzingStep;
