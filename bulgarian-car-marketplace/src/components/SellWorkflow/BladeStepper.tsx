import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { Car, Info, Layers, Camera, Tag, ShieldCheck, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BladeStepperProps {
  currentStep: number; // 0-based index
  totalSteps: number;
  onStepClick: (stepIndex: number) => void;
  stepsData: Array<{ id: string; labelEn: string; labelBg: string; subLabelEn: string; subLabelBg: string }>;
}

const BladeWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 10px;
  font-family: 'Inter', sans-serif;
  
  /* Theme Variables Mapping */
  --blade-bg: var(--bg-card);
  --blade-border: var(--border-primary);
  --accent-color: var(--accent-primary);
  --accent-glow: rgba(255, 107, 53, 0.4); /* Based on accent-primary */
  --text-active: var(--text-primary);
  --text-inactive: var(--text-tertiary);
  --success: var(--success);
`;

const MetaBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 15px;
  padding: 0 10px;
`;

const StepIndicatorText = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--text-inactive);
  text-transform: uppercase;
  letter-spacing: 1px;

  span {
    color: var(--accent-color);
    font-weight: 700;
  }
`;

const ProgressPercent = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  /* ✅ FIX: Move percentage to the left by 4 characters */
  margin-right: calc(1ch * 4);
`;

const StepperBlade = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--blade-bg);
  border: 1px solid var(--blade-border);
  border-radius: 16px;
  padding: 8px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
`;

const Glider = styled.div<{ $width: number; $left: number }>`
  position: absolute;
  top: 8px;
  height: calc(100% - 16px);
  background: var(--bg-hover); /* Dynamic hover/active background */
  border-radius: 12px;
  border: 1px solid var(--border-secondary);
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 0;
  box-shadow: var(--shadow-sm);
  
  /* Dynamic props */
  left: ${props => props.$left}px;
  width: ${props => props.$width}px;
`;

const ProgressLine = styled.div<{ $width: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--accent-color);
  width: ${props => props.$width}%;
  transition: width 0.5s ease;
  box-shadow: 0 -2px 10px var(--accent-glow);
  z-index: 10;
`;

const StepItem = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 10px;
  cursor: pointer;
  transition: color 0.3s ease;
  border-radius: 12px;
  user-select: none;
  
  color: ${props => {
    if (props.$isActive || props.$isCompleted) return 'var(--text-active)';
    return 'var(--text-inactive)';
  }};

  @media (max-width: 768px) {
    justify-content: center;
    padding: 12px 5px;
  }
`;

const StepIcon = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, color 0.3s ease;
  
  color: ${props => {
    if (props.$isCompleted) return 'var(--success)';
    if (props.$isActive) return 'var(--accent-color)';
    return 'inherit';
  }};
  
  transform: ${props => props.$isActive ? 'scale(1.1)' : 'scale(1)'};

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const StepInfo = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StepLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const StepSubLabel = styled.span`
  display: block;
  font-size: 0.7rem;
  font-weight: 300;
  opacity: 0.6;
  margin-top: 2px;
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
