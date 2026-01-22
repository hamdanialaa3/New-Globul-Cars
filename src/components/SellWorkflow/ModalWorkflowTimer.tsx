// Modal Workflow Timer
// عداد المسودة داخل الـ Modal - يظهر في أعلى اليمين
// Timer component for the sell vehicle modal

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { Clock, Pause, Play } from 'lucide-react';
import { toast } from 'react-toastify';
import UnifiedWorkflowPersistenceService, {
  TimerState
} from '../../services/unified-workflow-persistence.service';
import { useLanguage } from '../../contexts/LanguageContext';

const TimerContainer = styled.div<{ $urgent: boolean; $show: boolean; $isPaused: boolean }>`
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10002; /* Above modal content but below close button */
  
  display: ${props => props.$show ? 'flex' : 'none'};
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  
  padding: 0.5rem 1rem;
  border-radius: 12px;
  
  background: ${props => {
    if (props.$isPaused) return 'rgba(107, 114, 128, 0.9)';
    if (props.$urgent) return 'rgba(220, 38, 38, 0.95)';
    return 'rgba(220, 38, 38, 0.9)';
  }};
  
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  box-shadow: ${props => {
    if (props.$isPaused) return '0 4px 12px rgba(107, 114, 128, 0.3)';
    if (props.$urgent) return '0 4px 16px rgba(220, 38, 38, 0.5)';
    return '0 4px 12px rgba(220, 38, 38, 0.4)';
  }};
  
  color: white;
  cursor: pointer;
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  animation: ${props => props.$urgent && !props.$isPaused ? 'pulse 2s ease-in-out infinite' : 'none'};
  
  &:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: ${props => {
      if (props.$isPaused) return '0 6px 16px rgba(107, 114, 128, 0.4)';
      return '0 6px 20px rgba(220, 38, 38, 0.6)';
    }};
  }
  
  &:active {
    transform: translateX(-50%) translateY(0);
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5);
    }
    50% {
      box-shadow: 0 4px 24px rgba(220, 38, 38, 0.7);
    }
  }
  
  @media (max-width: 640px) {
    top: 1rem;
    padding: 0.4rem 0.75rem;
    gap: 0.5rem;
  }
`;

const TimerIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 640px) {
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const TimerContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

const TimerLabel = styled.div`
  font-size: 9px;
  opacity: 0.9;
  font-weight: 600;
  text-align: left;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 640px) {
    font-size: 8px;
  }
`;

const TimerValue = styled.div`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-family: 'Courier New', monospace;
  line-height: 1;
  
  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

export const ModalWorkflowTimer: React.FC = () => {
  const { language } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    remainingSeconds: 0,
    totalSeconds: 1200
  });
  
  // Track warnings to prevent duplicates
  const hasShown5MinWarning = useRef(false);
  const hasShown1MinWarning = useRef(false);

  useEffect(() => {
    // Load paused state from localStorage
    const savedPaused = localStorage.getItem('globul_workflow_timer_paused');
    if (savedPaused === 'true') {
      setIsPaused(true);
    }
    
    // Subscribe to timer updates
    const unsubscribe = UnifiedWorkflowPersistenceService.subscribeToTimer(
      (state) => {
        setTimerState(state);
        
        // Show warnings at specific thresholds
        if (state.isActive && !isPaused) {
          // 5 minutes warning (300 seconds)
          if (state.remainingSeconds === 300 && !hasShown5MinWarning.current) {
            hasShown5MinWarning.current = true;
            toast.warning(
              language === 'bg' 
                ? '⏰ Остават 5 минути! Моля завършете формата или ще загубите прогреса.' 
                : '⏰ 5 minutes remaining! Please complete the form or you will lose progress.',
              { autoClose: 10000, position: 'top-center' }
            );
          }
          
          // 1 minute warning (60 seconds)
          if (state.remainingSeconds === 60 && !hasShown1MinWarning.current) {
            hasShown1MinWarning.current = true;
            toast.error(
              language === 'bg'
                ? '🚨 СПЕШНО: Остава 1 минута! Прогресът ще бъде изтрит!'
                : '🚨 URGENT: 1 minute left! Progress will be deleted!',
              { autoClose: false, position: 'top-center' }
            );
          }
          
          // Time expired
          if (state.remainingSeconds === 0) {
            toast.error(
              language === 'bg'
                ? '❌ Времето изтече! Прогресът беше изтрит.'
                : '❌ Time expired! Progress has been deleted.',
              { autoClose: 5000, position: 'top-center' }
            );
          }
        }
      }
    );

    return () => {
      unsubscribe();
      // Reset warning flags on unmount
      hasShown5MinWarning.current = false;
      hasShown1MinWarning.current = false;
    };
  }, [language, isPaused]);

  // Don't show if timer is not active
  if (!timerState.isActive) {
    return null;
  }

  // Double-check that we have active workflow data
  const persistenceService = UnifiedWorkflowPersistenceService.getInstance();
  const workflowData = persistenceService.loadData();
  if (!workflowData || workflowData.isPublished) {
    return null;
  }

  // Format time (MM:SS)
  const minutes = Math.floor(timerState.remainingSeconds / 60);
  const seconds = timerState.remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Check if urgent (< 5 minutes)
  const isUrgent = timerState.remainingSeconds < 300;
  
  const handlePauseToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal close
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    localStorage.setItem('globul_workflow_timer_paused', newPausedState.toString());
  };

  return (
    <TimerContainer 
      $urgent={isUrgent} 
      $show={timerState.isActive}
      $isPaused={isPaused}
      onClick={handlePauseToggle}
      aria-label={isPaused 
        ? (language === 'bg' ? 'Възобнови таймера' : 'Resume timer')
        : (language === 'bg' ? 'Спри таймера' : 'Pause timer')
      }
      title={isPaused 
        ? (language === 'bg' ? 'Възобнови таймера' : 'Resume timer')
        : (language === 'bg' ? 'Спри таймера' : 'Pause timer')
      }
    >
      <TimerIcon>
        {isPaused ? <Pause size={16} /> : <Clock size={16} />}
      </TimerIcon>
      <TimerContent>
        <TimerLabel>
          {isPaused 
            ? (language === 'bg' ? 'ПАУЗА' : 'PAUSED')
            : (isUrgent 
              ? (language === 'bg' ? 'СПЕШНО' : 'URGENT')
              : (language === 'bg' ? 'ТАЙМЕР' : 'TIMER')
            )
          }
        </TimerLabel>
        <TimerValue>
          {isPaused ? '⏸' : formattedTime}
        </TimerValue>
      </TimerContent>
    </TimerContainer>
  );
};

export default ModalWorkflowTimer;

