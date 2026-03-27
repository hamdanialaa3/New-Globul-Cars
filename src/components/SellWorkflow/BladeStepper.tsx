import React, { useEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Car, Info, Layers, Camera, Tag, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BladeStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (stepIndex: number) => void;
  stepsData: Array<{ id: string; labelEn: string; labelBg: string; subLabelEn: string; subLabelBg: string }>;
}

// ============================================================================
// 🎨 MODERN ANIMATIONS
// ============================================================================

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
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

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

// ============================================================================
// 💎 STYLED COMPONENTS - Modern Glassmorphism Design
// ============================================================================

const BladeWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  padding: 0 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    padding: 0 0.75rem;
  }
`;

const MetaBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1.25rem;
  background: ${({ theme }) =>
    theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(255, 255, 255, 0.6)'
  };
  backdrop-filter: blur(10px);
  border-radius: 14px;
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.05)'
  };
  
  @media (max-width: 768px) {
    padding: 0.625rem 1rem;
    margin-bottom: 1rem;
    border-radius: 12px;
  }
`;

const StepIndicatorText = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#6B7280'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    
    span {
      font-size: 0.875rem;
    }
  }
`;

const ProgressPercent = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366F1 0%, #004E89 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: #6366F1;
    animation: ${float} 3s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const StepperBlade = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) =>
    theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.8)'
  };
  backdrop-filter: blur(20px) saturate(180%);
  border: 1.5px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.06)'
  };
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    border-radius: 14px;
  }
`;

const Glider = styled.div<{ $width: number; $left: number }>`
  position: absolute;
  top: 1rem;
  height: calc(100% - 2rem);
  width: ${props => props.$width}px;
  left: ${props => props.$left}px;
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.15) 0%,
    rgba(139, 92, 246, 0.15) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 14px;
  border: 1.5px solid rgba(99, 102, 241, 0.3);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 4px 16px rgba(99, 102, 241, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    top: 0.75rem;
    height: calc(100% - 1.5rem);
    border-radius: 12px;
  }
`;

const ProgressLine = styled.div<{ $width: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%);
  width: ${props => props.$width}%;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
  z-index: 10;
  border-radius: 0 0 16px 16px;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: ${shimmer} 2s infinite;
  }
  
  @media (max-width: 768px) {
    height: 3px;
  }
`;

const StepItem = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 14px;
  user-select: none;
  min-width: 0;
  max-width: 100%;
  
  /* Hover effect */
  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) =>
      theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(99, 102, 241, 0.05)'
    };
  }
  
  /* Active/Completed Animation */
  ${props => (props.$isActive || props.$isCompleted) && css`
    animation: ${scaleIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `}
  
  color: ${props => {
    if (props.$isActive) return '#6366F1';
    if (props.$isCompleted) return '#10B981';
    return ({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : '#9CA3AF';
  }};
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    gap: 0.5rem;
  }
`;

const StepIcon = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  position: relative;
  
  /* Completed State - Green */
  ${props => props.$isCompleted && css`
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    
    svg {
      transform: scale(1.1);
    }
  `}
  
  /* Active State - Orange */
  ${props => props.$isActive && !props.$isCompleted && css`
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
    animation: ${pulse} 2s ease-in-out infinite;
    
    svg {
      transform: scale(1.15);
    }
  `}
  
  /* Inactive State - Gray */
  ${props => !props.$isActive && !props.$isCompleted && css`
    background: ${({ theme }) =>
      theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.05)'
    };
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9CA3AF'};
  `}
  
  svg {
    width: 22px;
    height: 22px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const StepInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  gap: 0.25rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const StepLabel = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  font-weight: ${props => (props.$isActive || props.$isCompleted) ? 700 : 500};
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.01em;
  line-height: 1.4;
  
  /* Gradient text for active state */
  ${props => props.$isActive && css`
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
  `}
  
  /* Success color for completed */
  ${props => props.$isCompleted && css`
    color: #10B981;
  `}

  @media (max-width: 768px) {
    display: none;
  }
`;

const StepSubLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.65;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.3s ease;
  line-height: 1.2;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#6B7280'};
  font-weight: 400;

  @media (max-width: 768px) {
    display: none;
  }
`;

const BladeStepper: React.FC<BladeStepperProps> = ({ currentStep, totalSteps, onStepClick, stepsData }) => {
  const { language } = useLanguage();
  const [gliderStyle, setGliderStyle] = useState({ width: 0, left: 0 });
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update Glider position
  useEffect(() => {
    const activeStepEl = stepRefs.current[currentStep];
    if (activeStepEl) {
      setGliderStyle({
        width: activeStepEl.offsetWidth,
        left: activeStepEl.offsetLeft
      });
    }
  }, [currentStep, totalSteps]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const activeStepEl = stepRefs.current[currentStep];
      if (activeStepEl) {
        setGliderStyle({
          width: activeStepEl.offsetWidth,
          left: activeStepEl.offsetLeft
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep]);

  const progressPercent = Math.round((currentStep / (totalSteps - 1)) * 100);

  const getStepIcon = (index: number) => {
    // 0: Car, 1: Data(Info), 2: Equipment(Layers), 3: Images(Camera), 4: Pricing(Tag), 5: Contact(Shield)
    const icons = [Car, Info, Layers, Camera, Tag, ShieldCheck];
    const IconComponent = icons[index % icons.length];

    if (index < currentStep) {
      return <Check size={20} />;
    }
    return <IconComponent size={20} />;
  };

  return (
    <BladeWrapper>
      <MetaBar>
        <StepIndicatorText>
          STEP <span>{(currentStep + 1).toString().padStart(2, '0')}</span> / {totalSteps.toString().padStart(2, '0')}
        </StepIndicatorText>
        <ProgressPercent>{progressPercent}%</ProgressPercent>
      </MetaBar>

      <StepperBlade>
        <Glider $width={gliderStyle.width} $left={gliderStyle.left} />
        <ProgressLine $width={progressPercent} />

        {stepsData.map((step, index) => (
          <StepItem
            key={step.id}
            ref={el => stepRefs.current[index] = el}
            $isActive={index === currentStep}
            $isCompleted={index < currentStep}
            onClick={() => onStepClick(index)}
          >
            <StepIcon $isActive={index === currentStep} $isCompleted={index < currentStep}>
              {getStepIcon(index)}
            </StepIcon>
            <StepInfo>
              <StepLabel>{language === 'bg' ? step.labelBg : step.labelEn}</StepLabel>
              <StepSubLabel>{language === 'bg' ? step.subLabelBg : step.subLabelEn}</StepSubLabel>
            </StepInfo>
          </StepItem>
        ))}
      </StepperBlade>
    </BladeWrapper>
  );
};

export default BladeStepper;

