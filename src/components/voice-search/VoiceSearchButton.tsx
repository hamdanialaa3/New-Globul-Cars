// Voice Search Component - مكون البحث الصوتي
// واجهة مستخدم للبحث الصوتي مع دعم 3 لغات

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { voiceSearchService, VoiceRecognitionEvent } from '../../services/advanced/voice-search.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';

interface VoiceSearchButtonProps {
  onSearchComplete?: (transcript: string) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'fab' | 'button';
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onSearchComplete,
  size = 'medium',
  variant = 'button'
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if voice search is supported
    setIsSupported(voiceSearchService.isSupported());

    // Configure language
    const voiceLang = language === 'bg' ? 'bg-BG' : language === 'ar' ? 'ar-SA' : 'en-US';
    voiceSearchService.configure({ language: voiceLang });

  }, [language]);

  const handleStart = async () => {
    if (!isSupported) {
      setError(t('voiceSearch.notSupported', 'Voice search is not supported in your browser'));
      return;
    }

    try {
      // Request permission
      const hasPermission = await voiceSearchService.requestPermission();
      if (!hasPermission) {
        setError(t('voiceSearch.permissionDenied', 'Microphone permission denied'));
        return;
      }

      setError(null);
      setTranscript('');

      // Start listening
      await voiceSearchService.startListening(
        (event: VoiceRecognitionEvent) => {
          setTranscript(event.transcript);
          
          if (event.isFinal && event.transcript.trim()) {
            handleSearchComplete(event.transcript);
          }
        },
        (error: Error) => {
          setError(error.message);
          setIsListening(false);
        }
      );

      setIsListening(true);

    } catch (error) {
      logger.error('Failed to start voice search', error as Error);
      setError(t('voiceSearch.error', 'Failed to start voice search'));
      setIsListening(false);
    }
  };

  const handleStop = () => {
    voiceSearchService.stopListening();
    setIsListening(false);
  };

  const handleSearchComplete = async (finalTranscript: string) => {
    try {
      handleStop();

      if (onSearchComplete) {
        onSearchComplete(finalTranscript);
      } else {
        // Perform search and navigate to results
        const result = await voiceSearchService.search(finalTranscript, user?.uid);
        
        // Navigate to search results page with query
        navigate(`/voice-search-results?q=${encodeURIComponent(finalTranscript)}`);
      }

    } catch (error) {
      logger.error('Voice search failed', error as Error);
      setError(t('voiceSearch.searchFailed', 'Search failed'));
    }
  };

  if (!isSupported) {
    return null;
  }

  if (variant === 'fab') {
    return (
      <>
        <FAB
          onClick={isListening ? handleStop : handleStart}
          $isListening={isListening}
          $size={size}
          title={isListening ? t('voiceSearch.stopListening') : t('voiceSearch.startListening')}
        >
          {isListening ? '⏸️' : '🎤'}
        </FAB>
        {isListening && (
          <ListeningIndicator>
            <Pulse />
            <TranscriptPreview>{transcript || t('voiceSearch.listening', 'Listening...')}</TranscriptPreview>
          </ListeningIndicator>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </>
    );
  }

  return (
    <>
      <VoiceButton
        onClick={isListening ? handleStop : handleStart}
        $isListening={isListening}
        $size={size}
      >
        <MicIcon>{isListening ? '⏸️' : '🎤'}</MicIcon>
        <ButtonText>
          {isListening 
            ? t('voiceSearch.stopListening', 'Stop')
            : t('voiceSearch.startVoiceSearch', 'Voice Search')
          }
        </ButtonText>
      </VoiceButton>

      {isListening && (
        <TranscriptBox>
          <AnimatedWave />
          <Transcript>{transcript || t('voiceSearch.listening', 'Listening...')}</Transcript>
          <Hint>{t('voiceSearch.speakNow', 'Speak now...')}</Hint>
        </TranscriptBox>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
};

// Styled Components

const FAB = styled.button<{ $isListening: boolean; $size: string }>`
  position: fixed;
  bottom: ${props => props.$size === 'large' ? '100px' : '80px'};
  right: ${props => props.$size === 'large' ? '40px' : '30px'};
  width: ${props => {
    if (props.$size === 'large') return '80px';
    if (props.$size === 'small') return '50px';
    return '65px';
  }};
  height: ${props => {
    if (props.$size === 'large') return '80px';
    if (props.$size === 'small') return '50px';
    return '65px';
  }};
  border-radius: 50%;
  background: ${props => props.$isListening 
    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  font-size: ${props => {
    if (props.$size === 'large') return '32px';
    if (props.$size === 'small') return '20px';
    return '26px';
  }};
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }

  animation: ${props => props.$isListening ? 'pulse 1.5s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const VoiceButton = styled.button<{ $isListening: boolean; $size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: ${props => {
    if (props.$size === 'large') return '15px 30px';
    if (props.$size === 'small') return '8px 16px';
    return '12px 24px';
  }};
  font-size: ${props => {
    if (props.$size === 'large') return '18px';
    if (props.$size === 'small') return '14px';
    return '16px';
  }};
  background: ${props => props.$isListening 
    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  animation: ${props => props.$isListening ? 'pulse 1.5s infinite' : 'none'};
`;

const MicIcon = styled.span`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled.span`
  font-family: 'Martica', 'Arial', sans-serif;
`;

const ListeningIndicator = styled.div`
  position: fixed;
  bottom: 180px;
  right: 30px;
  background: white;
  padding: 15px 20px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 200px;
`;

const Pulse = styled.div`
  width: 20px;
  height: 20px;
  background: #f5576c;
  border-radius: 50%;
  animation: pulse-dot 1s infinite;

  @keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
  }
`;

const TranscriptPreview = styled.p`
  margin: 0;
  color: #333;
  font-size: 14px;
  text-align: center;
  font-family: 'Martica', 'Arial', sans-serif;
`;

const TranscriptBox = styled.div`
  margin-top: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%);
  border-radius: 12px;
  border: 2px solid #667eea;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const AnimatedWave = styled.div`
  width: 100%;
  height: 30px;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  background-size: 200% 100%;
  animation: wave 2s infinite;
  border-radius: 5px;

  @keyframes wave {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Transcript = styled.p`
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  font-family: 'Martica', 'Arial', sans-serif;
  min-height: 24px;
`;

const Hint = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  font-style: italic;
  text-align: center;
  font-family: 'Martica', 'Arial', sans-serif;
`;

const ErrorMessage = styled.div`
  margin-top: 10px;
  padding: 12px 16px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  text-align: center;
  font-family: 'Martica', 'Arial', sans-serif;
`;

export default VoiceSearchButton;
