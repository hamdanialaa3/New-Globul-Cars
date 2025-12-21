// Workflow Node Component - N8N Style
// مكون عقدة الأتمتة - نمط احترافي

import React from 'react';
import styled from 'styled-components';
import { Check, Circle } from 'lucide-react';

interface WorkflowNodeProps {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const NodeContainer = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: ${props => props.$isActive ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  opacity: ${props => props.$isActive ? 1 : 0.5};

  &:hover {
    transform: ${props => props.$isActive ? 'scale(1.05)' : 'none'};
  }
`;

const NodeCircle = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  
  background: ${props => {
    if (props.$isCompleted) return 'linear-gradient(135deg, #27ae60, #229954)';
    if (props.$isActive) return 'linear-gradient(135deg, #ff8f10, #005ca9)';
    return '#e9ecef';
  }};
  
  box-shadow: ${props => {
    if (props.$isCompleted) return '0 4px 15px rgba(39, 174, 96, 0.4)';
    if (props.$isActive) return '0 4px 20px rgba(255, 143, 16, 0.5), 0 0 0 4px rgba(255, 143, 16, 0.2)';
    return '0 2px 8px rgba(0, 0, 0, 0.1)';
  }};

  color: ${props => (props.$isCompleted || props.$isActive) ? 'white' : '#94a3b8'};
  
  svg {
    width: 28px;
    height: 28px;
  }

  ${props => props.$isActive && `
    animation: pulse 2s ease-in-out infinite;
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 4px 20px rgba(255, 143, 16, 0.5), 0 0 0 4px rgba(255, 143, 16, 0.2);
      }
      50% {
        box-shadow: 0 4px 25px rgba(255, 143, 16, 0.7), 0 0 0 8px rgba(255, 143, 16, 0.1);
      }
    }
  `}
`;

const NodeLabel = styled.div<{ $isActive: boolean }>`
  font-size: 0.75rem;
  font-weight: ${props => props.$isActive ? '600' : '500'};
  color: ${props => props.$isActive ? '#2c3e50' : '#7f8c8d'};
  text-align: center;
  max-width: 80px;
  line-height: 1.3;
`;

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  label,
  isActive,
  isCompleted,
  icon,
  onClick
}) => {
  return (
    <NodeContainer
      $isActive={isActive}
      $isCompleted={isCompleted}
      onClick={isActive ? onClick : undefined}
    >
      <NodeCircle $isActive={isActive} $isCompleted={isCompleted}>
        {isCompleted ? <Check /> : icon || <Circle />}
      </NodeCircle>
      <NodeLabel $isActive={isActive}>{label}</NodeLabel>
    </NodeContainer>
  );
};

export default WorkflowNode;

