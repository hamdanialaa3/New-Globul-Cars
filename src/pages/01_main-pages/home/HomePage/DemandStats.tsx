import React from 'react';
import styled from 'styled-components';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const DemandIndicator = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: ${props => props.$isDark ? 'var(--bg-card)' : 'var(--bg-secondary)'};
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  box-shadow: ${props => props.$isDark ? 'var(--shadow-card)' : 'var(--shadow-md)'};
  max-width: 600px;
  margin: 0 auto 40px;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
`;

const DemandText = styled.div`
  font-size: 0.9375rem;
  color: var(--text-secondary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
`;

const DemandBar = styled.div<{ $percentage: number; $isDark: boolean }>`
  flex: 1;
  height: 12px;
  background: ${props => props.$isDark 
    ? 'rgba(255, 140, 97, 0.15)' 
    : 'rgba(255, 107, 53, 0.15)'};
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  min-width: 200px;
  transition: background-color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$percentage}%;
    background: var(--btn-primary-bg);
    border-radius: 10px;
    transition: width 1s ease-out, background 0.3s ease;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const DemandPercentage = styled.div`
  font-size: 1.25rem;
  font-weight: 900;
  background: var(--btn-primary-bg);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: background 0.3s ease;
`;

interface Props {
    categoryName: string;
    percentage: number;
}

const DemandStats: React.FC<Props> = ({ categoryName, percentage }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    // Get accent color based on theme
    const accentColor = isDark ? '#FF8C61' : '#FF6B35';
    
    return (
        <DemandIndicator $isDark={isDark}>
            <DemandText>
                <TrendingUp 
                    size={18} 
                    color={accentColor} 
                />
                Търсене за {categoryName} {/* Demand for ... */}
            </DemandText>
            <DemandBar $percentage={percentage} $isDark={isDark} />
            <DemandPercentage>{percentage}%</DemandPercentage>
        </DemandIndicator>
    );
};

export default DemandStats;
