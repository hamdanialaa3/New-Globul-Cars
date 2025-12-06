// Global Workflow Timer
// مؤقت عام يظهر في كل صفحات الـ workflow
// يعرض الوقت المتبقي قبل حذف البيانات تلقائياً

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Clock, AlertTriangle } from 'lucide-react';
import UnifiedWorkflowPersistenceService, {
  TimerState
} from '../services/unified-workflow-persistence.service';
import { useLanguage } from '../contexts/LanguageContext';

const TimerContainer = styled.button<{ $urgent: boolean; $show: boolean; $isPaused: boolean }>`
  position: fixed;
  right: 32px;
  bottom: 328px; /* RobotChat at 244px + 64px + 20px gap */
  z-index: 1000;
  
  display: ${props => props.$show ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  width: 64px;
  height: 64px;
  padding: 0;
  border: none;
  border-radius: 50%;
  
  background: ${props => {
    if (props.$isPaused) return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    if (props.$urgent) return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
    return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
  }};
  
  box-shadow: ${props => {
    if (props.$isPaused) return '0 8px 24px rgba(107, 114, 128, 0.4)';
    if (props.$urgent) return '0 8px 24px rgba(220, 38, 38, 0.5)';
    return '0 8px 24px rgba(220, 38, 38, 0.5)';
  }};
  
  color: white;
  cursor: pointer;
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  animation: ${props => props.$urgent && !props.$isPaused ? 'pulse 2s ease-in-out infinite' : 'none'};
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: ${props => {
      if (props.$isPaused) return '0 12px 32px rgba(107, 114, 128, 0.5)';
      return '0 12px 32px rgba(220, 38, 38, 0.6)';
    }};
  }
  
  &:active {
    transform: translateY(-2px) scale(0.98);
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
    }
    50% {
      box-shadow: 0 0 0 15px rgba(220, 38, 38, 0);
    }
  }
  
  @media (max-width: 768px) {
    right: 24px;
    bottom: 280px;
    width: 56px;
    height: 56px;
  }
`;

const IconWrapper = styled.div`
  display: none;
`;

const TimerText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const TimerLabel = styled.div`
  font-size: 9px;
  opacity: 0.9;
  font-weight: 600;
  text-align: center;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 8px;
  }
`;

const TimerValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-family: 'Courier New', monospace;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const GlobalWorkflowTimer: React.FC = () => {
  const { t } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    remainingSeconds: 0,
    totalSeconds: 1200
  });

  useEffect(() => {
    // تحميل حالة الإيقاف من localStorage
    const savedPaused = localStorage.getItem('globul_workflow_timer_paused');
    if (savedPaused === 'true') {
      setIsPaused(true);
    }
    
    // Subscribe to timer updates
    const unsubscribe = UnifiedWorkflowPersistenceService.subscribeToTimer(
      (state) => {
        setTimerState(state);
      }
    );

    return unsubscribe;
  }, []);

  // Don't show if timer is not active
  if (!timerState.isActive) {
    return null;
  }

  // Format time (MM:SS)
  const minutes = Math.floor(timerState.remainingSeconds / 60);
  const seconds = timerState.remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Check if urgent (< 5 minutes)
  const isUrgent = timerState.remainingSeconds < 300;
  
  const handlePauseToggle = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    localStorage.setItem('globul_workflow_timer_paused', newPausedState.toString());
    // لا نحذف البيانات - فقط نوقف/نستأنف العرض
  };

  return (
    <TimerContainer 
      $urgent={isUrgent} 
      $show={timerState.isActive}
      $isPaused={isPaused}
      onClick={handlePauseToggle}
      aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
    >
      {isPaused ? (
        <TimerText>
          <TimerLabel>PAUSED</TimerLabel>
          <TimerValue>⏸</TimerValue>
        </TimerText>
      ) : (
        <TimerText>
          <TimerLabel>
            {isUrgent ? 'URGENT' : 'TIMER'}
          </TimerLabel>
          <TimerValue>{formattedTime}</TimerValue>
        </TimerText>
      )}
    </TimerContainer>
  );
};

export default GlobalWorkflowTimer;
