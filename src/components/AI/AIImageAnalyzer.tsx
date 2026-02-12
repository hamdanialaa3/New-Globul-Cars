// AI Image Analyzer Component - FREE
import React, { useState } from 'react';
import styled from 'styled-components';
import { geminiVisionService } from '../../services/ai';
import { CarAnalysisResult } from '../../types/ai.types';
import { logger } from '../../services/logger-service';

interface Props {
  onAnalysisComplete: (result: CarAnalysisResult) => void;
  onError?: (error: string) => void;
}

export const AIImageAnalyzer: React.FC<Props> = ({ onAnalysisComplete, onError }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CarAnalysisResult | null>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    if (!geminiVisionService.isReady()) {
      onError?.('AI service not configured. Add REACT_APP_GEMINI_KEY to .env');
      return;
    }
    
    setAnalyzing(true);
    setProgress(0);
    setResult(null);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const analysisResult = await geminiVisionService.analyzeCarImage(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(analysisResult);
      
      setTimeout(() => {
        onAnalysisComplete(analysisResult);
      }, 500);
      
    } catch (error) {
      logger.error('Image analysis failed', error as Error);
      onError?.('Analysis failed. Please try again.');
    } finally {
      setTimeout(() => {
        setAnalyzing(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <Container>
      <UploadArea>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
          disabled={analyzing}
          style={{ display: 'none' }}
          id="ai-image-upload"
        />
        <label htmlFor="ai-image-upload">
          <UploadButton disabled={analyzing}>
            {analyzing ? '🔄 Analyzing...' : '📸 Upload image for AI analysis'}
          </UploadButton>
        </label>
        
        {analyzing && (
          <AnalyzingState>
            <Spinner />
            <ProgressText>Identifying vehicle...</ProgressText>
            <ProgressBar>
              <Progress style={{ width: `${progress}%` }} />
            </ProgressBar>
          </AnalyzingState>
        )}
        
        {result && !analyzing && (
          <ResultPreview>
            <ResultTitle>✅ Identified successfully!</ResultTitle>
            <ResultInfo>
              <strong>{result.make} {result.model}</strong>
              <span>{result.year} • {result.color}</span>
              <Confidence>Accuracy: {result.confidence}%</Confidence>
            </ResultInfo>
          </ResultPreview>
        )}
      </UploadArea>
      
      <AIBadge>
        🤖 Powered by Google Gemini (Free)
      </AIBadge>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin: 20px 0;
`;

const UploadArea = styled.div`
  border: 2px dashed #1a73e8;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  background: rgba(26, 115, 232, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(26, 115, 232, 0.1);
    border-color: #1557b0;
  }
`;

const UploadButton = styled.button<{ disabled?: boolean }>`
  background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26, 115, 232, 0.3);
  }
`;

const AnalyzingState = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(26, 115, 232, 0.2);
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ProgressText = styled.p`
  color: #1a73e8;
  font-weight: 600;
  margin: 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 300px;
  height: 8px;
  background: rgba(26, 115, 232, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #1a73e8 0%, #1557b0 100%);
  transition: width 0.3s ease;
`;

const ResultPreview = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 2px solid #4caf50;
  border-radius: 8px;
`;

const ResultTitle = styled.div`
  color: #4caf50;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #333;
  
  strong {
    font-size: 20px;
    color: #1a73e8;
  }
`;

const Confidence = styled.span`
  color: #666;
  font-size: 14px;
`;

const AIBadge = styled.div`
  margin-top: 12px;
  text-align: center;
  color: #666;
  font-size: 13px;
  font-weight: 500;
`;

export default AIImageAnalyzer;
