import React from 'react';
import styled from 'styled-components';
import { TrendingUp } from 'lucide-react';

const DemandIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  max-width: 600px;
  margin: 0 auto 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
`;

const DemandText = styled.div`
  font-size: 0.9375rem;
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DemandBar = styled.div<{ percentage: number }>`
  flex: 1;
  height: 12px;
  background: rgba(240, 147, 251, 0.2);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  min-width: 200px;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    border-radius: 10px;
    transition: width 1s ease-out;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const DemandPercentage = styled.div`
  font-size: 1.25rem;
  font-weight: 900;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

interface Props {
    categoryName: string;
    percentage: number;
}

const DemandStats: React.FC<Props> = ({ categoryName, percentage }) => {
    return (
        <DemandIndicator>
            <DemandText>
                <TrendingUp size={18} color="#f5576c" />
                Търсене за {categoryName} {/* Demand for ... */}
            </DemandText>
            <DemandBar percentage={percentage} />
            <DemandPercentage>{percentage}%</DemandPercentage>
        </DemandIndicator>
    );
};

export default DemandStats;
