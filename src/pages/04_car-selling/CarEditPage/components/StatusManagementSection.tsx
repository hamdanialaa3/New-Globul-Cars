import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { UnifiedCar } from '../../../../services/car';
import { Card } from '../styles';
import { Eye, EyeOff, Tag, Lock, CheckCircle } from 'lucide-react';

const pulseGreen = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

const pulseRed = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const SectionWrapper = styled(Card)`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatusButton = styled.button<{ $isActive: boolean; $color: 'green' | 'red'; $isDark: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: ${p => p.$isDark
    ? (p.$isActive ? (p.$color === 'green' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)') : '#0f172a')
    : (p.$isActive ? (p.$color === 'green' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)') : '#ffffff')};
  
  border: 2px solid ${p => p.$isActive
    ? (p.$color === 'green' ? '#22c55e' : '#ef4444')
    : (p.$isDark ? '#334155' : '#e2e8f0')};
  
  color: ${p => p.$isActive
    ? (p.$color === 'green' ? '#16a34a' : '#dc2626')
    : (p.$isDark ? '#94a3b8' : '#64748b')};
    
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  max-width: 400px;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    border-color: ${p => p.$color === 'green' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
    box-shadow: 0 10px 20px -10px ${p => p.$color === 'green' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: ${p => p.$color === 'green'
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent)'
    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)'};
    opacity: ${p => p.$isActive ? 1 : 0};
    transition: opacity 0.3s;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  z-index: 1;
`;

const Title = styled.span`
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
`;

const Description = styled.span`
  font-size: 12px;
  opacity: 0.8;
  text-align: left;
`;

const LED = styled.div<{ $state: 'on' | 'off' | 'standby'; $color: 'green' | 'red' }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${p => {
    if (p.$state === 'off') return '#cbd5e1';
    return p.$color === 'green' ? '#22c55e' : '#ef4444';
  }};
  box-shadow: ${p => {
    if (p.$state === 'off') return 'inset 0 1px 2px rgba(0,0,0,0.1)';
    const color = p.$color === 'green' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
    return `0 0 10px ${color}, 0 0 20px ${color}`;
  }};
  animation: ${p => p.$state === 'on' ? css`${p.$color === 'green' ? pulseGreen : pulseRed} 2s infinite` : 'none'};
  flex-shrink: 0;
  margin-left: auto;
`;

const Stamp = styled.div<{ $visible: boolean }>`
  position: absolute;
  right: -20px;
  bottom: -20px;
  transform: rotate(-15deg);
  border: 4px solid #ef4444;
  color: #ef4444;
  font-weight: 900;
  font-size: 24px;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  opacity: ${p => p.$visible ? 0.2 : 0};
  transition: all 0.3s;
  pointer-events: none;
`;

interface StatusManagementSectionProps {
  formData: Partial<UnifiedCar>;
  handleInputChange: (field: string, value: any) => void;
  t: any;
  isDark: boolean;
}

export const StatusManagementSection: React.FC<StatusManagementSectionProps> = ({
  formData,
  handleInputChange,
  t,
  isDark
}) => {
  const isVisible = formData.status === 'active' || formData.status === 'sold';
  const isSold = formData.isSold || formData.status === 'sold';
  const isHidden = formData.status === 'draft';

  const toggleVisibility = () => {
    // Toggle bewteen Visible (active/sold) and Hidden (draft)
    if (isVisible) {
      handleInputChange('status', 'draft');
      handleInputChange('isActive', false);
    } else {
      // Restore to the correct visible state based on isSold flag
      handleInputChange('status', isSold ? 'sold' : 'active');
      handleInputChange('isActive', true);
    }
  };

  const toggleSold = () => {
    const newIsSold = !isSold;
    // Update the boolean flag (crucial for independent tracking)
    handleInputChange('isSold', newIsSold);

    // If currently visible, update the status string to match visual expectation
    if (isVisible) {
      handleInputChange('status', newIsSold ? 'sold' : 'active');
    }
    // If hidden, status remains 'draft', but isSold flag is updated.
  };

  return (
    <SectionWrapper $isDark={isDark}>
      {/* Visibility Toggle Button */}
      <StatusButton
        $isActive={isVisible}
        $color="green"
        $isDark={isDark}
        onClick={toggleVisibility}
        title={t.tooltips?.visibility || "Toggles whether the ad is publicly visible to everyone or hidden (private)."}
      >
        <Eye size={24} />
        <Content>
          <Title>{t.statusControl?.visibilityTitle || "Ad Visibility"}</Title>
          <Description>
            {isVisible
              ? (t.statusControl?.visibleDesc || "Publicly Visible")
              : (t.statusControl?.hiddenDesc || "Hidden (Private Only)")}
          </Description>
        </Content>
        <LED
          $state={isVisible ? 'on' : 'standby'}
          $color={isVisible ? 'green' : 'red'}
        />
      </StatusButton>

      {/* Sold Toggle Button */}
      <StatusButton
        $isActive={isSold}
        $color="red"
        $isDark={isDark}
        onClick={toggleSold}
        title={t.tooltips?.sold || "Marks the car as sold and displays a SOLD stamp on the listing."}
      >
        {isSold ? <CheckCircle size={24} /> : <Tag size={24} />}
        <Content>
          <Title>{t.statusControl?.soldTitle || "Mark as Sold"}</Title>
          <Description>
            {isSold
              ? (t.statusControl?.soldDesc || "Item is marked SOLD")
              : (t.statusControl?.availableDesc || "Mark item as SOLD")}
          </Description>
        </Content>
        <LED
          $state={'on'}
          $color={isSold ? 'red' : 'green'}
        />
        {/* Visual Stamp Effect inside button for preview */}
        <Stamp $visible={true}>SOLD</Stamp>
      </StatusButton>
    </SectionWrapper>
  );
};
