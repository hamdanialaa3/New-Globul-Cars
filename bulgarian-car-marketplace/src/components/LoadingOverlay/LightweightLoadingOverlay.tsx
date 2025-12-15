/**
 * Lightweight Loading Overlay Component
 * Pure CSS animations - NO Three.js overhead
 * Fast, smooth, and responsive
 */

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { logger } from '../../services/logger-service';

interface LightweightLoadingOverlayProps {
  isVisible: boolean;
  apiKey?: string;
}

// ============================================
// Animations
// ============================================

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// ============================================
// Styled Components
// ============================================

const LoaderContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${props => (props.isVisible ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  background: rgba(5, 5, 10, 0.95);
  backdrop-filter: blur(8px);
  z-index: 1000;
  transition: opacity 0.3s ease;
  opacity: ${props => (props.isVisible ? 1 : 0)};
`;

const LoaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

// Simple Car Emoji (No 3D overhead)
const CarEmoji = styled.div`
  font-size: 80px;
  animation: ${pulse} 2s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(0, 204, 255, 0.6));
  user-select: none;
`;

// Spinner Ring (CSS only)
const SpinnerRing = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
  }
  
  &::before {
    width: 100%;
    height: 100%;
    border: 4px solid rgba(0, 204, 255, 0.1);
  }
  
  &::after {
    width: 100%;
    height: 100%;
    border: 4px solid transparent;
    border-top-color: #00ccff;
    border-right-color: #00ccff;
    animation: ${spin} 1.2s linear infinite;
  }
`;

const CarContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ProgressText = styled.div`
  text-align: center;
  color: #ffffff;
`;

const Percentage = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(90deg, #00ccff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  animation: ${shimmer} 2s linear infinite;
`;

const Label = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 3px;
  color: #00ccff;
  text-transform: uppercase;
  margin-top: 0.5rem;
  opacity: 0.8;
`;

const AIFactContainer = styled.div<{ isVisible: boolean }>`
  max-width: 500px;
  text-align: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, rgba(0, 204, 255, 0.05), rgba(0, 204, 255, 0.1));
  border-radius: 12px;
  border: 1px solid rgba(0, 204, 255, 0.2);
  opacity: ${props => (props.isVisible ? 1 : 0)};
  transform: ${props => (props.isVisible ? 'translateY(0)' : 'translateY(20px)')};
  transition: opacity 0.5s ease, transform 0.5s ease;
  animation: ${props => props.isVisible ? fadeInUp : 'none'} 0.5s ease;
`;

const AIFactLabel = styled.div`
  font-size: 0.75rem;
  color: #00ccff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const AIFactText = styled.div`
  font-size: 1rem;
  font-weight: 300;
  color: #e0e0e0;
  line-height: 1.6;
`;

// ============================================
// Component
// ============================================

const LightweightLoadingOverlay: React.FC<LightweightLoadingOverlayProps> = ({ 
  isVisible, 
  apiKey 
}) => {
  const [percent, setPercent] = useState(0);
  const [showAIFact, setShowAIFact] = useState(false);
  const [aiFact, setAIFact] = useState('Preparing your journey...');

  // Simulate loading progress
  useEffect(() => {
    if (!isVisible) {
      setPercent(0);
      setShowAIFact(false);
      return;
    }

    let currentPercent = 0;
    const loadInterval = setInterval(() => {
      currentPercent = Math.min(currentPercent + Math.random() * 25, 99);
      setPercent(Math.floor(currentPercent));

      if (currentPercent > 40 && !showAIFact) {
        setShowAIFact(true);
      }
    }, 300);

    return () => clearInterval(loadInterval);
  }, [isVisible, showAIFact]);

  // Fetch AI fact (only if apiKey provided)
  useEffect(() => {
    const fetchAIFact = async () => {
      if (!apiKey || !isVisible) return;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: 'Give one fascinating car fact in 15 words or less.',
                    },
                  ],
                },
              ],
              systemInstruction: { parts: [{ text: 'You are a car expert.' }] },
            }),
          }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          setAIFact(data.candidates[0].content.parts[0].text);
        }
      } catch (error) {
        logger.error('AI Fact fetch failed:', error as Error, {
          context: 'LightweightLoadingOverlay',
          action: 'fetchAIFact'
        });
      }
    };

    // Delay AI call to reduce initial load time
    const timer = setTimeout(fetchAIFact, 500);
    return () => clearTimeout(timer);
  }, [isVisible, apiKey]);

  return (
    <LoaderContainer isVisible={isVisible}>
      <LoaderContent>
        <SpinnerRing>
          <CarContainer>
            <CarEmoji>🚗</CarEmoji>
          </CarContainer>
        </SpinnerRing>

        <ProgressText>
          <Percentage>{percent}%</Percentage>
          <Label>Loading</Label>
        </ProgressText>

        <AIFactContainer isVisible={showAIFact}>
          <AIFactLabel>✨ Did You Know?</AIFactLabel>
          <AIFactText>{aiFact}</AIFactText>
        </AIFactContainer>
      </LoaderContent>
    </LoaderContainer>
  );
};

export default LightweightLoadingOverlay;
