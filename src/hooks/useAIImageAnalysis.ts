// Hook for AI Image Analysis
import { useState, useCallback } from 'react';
import { geminiVisionService } from '../services/ai';
import { CarAnalysisResult } from '../types/ai.types';
import { logger } from '../services/logger-service';

export const useAIImageAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CarAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (file: File) => {
    if (!geminiVisionService.isReady()) {
      setError('AI service not configured');
      return null;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await geminiVisionService.analyzeCarImage(file);
      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const errorMsg = 'Failed to analyze image';
      setError(errorMsg);
      logger.error('AI analysis failed', err as Error);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setAnalyzing(false);
  }, []);

  return {
    analyzing,
    result,
    error,
    analyzeImage,
    reset,
    isReady: geminiVisionService.isReady()
  };
};
