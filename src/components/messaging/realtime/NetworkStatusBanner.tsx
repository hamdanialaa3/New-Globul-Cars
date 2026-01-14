/**
 * Network Status Banner
 * ====================
 * Shows connection status for messaging system
 * 
 * @author Phase 4.6 - Network Status
 * @date January 14, 2026
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { logger } from '@/services/logger-service';

/**
 * Connection states
 */
export type ConnectionStatus = 'online' | 'offline' | 'reconnecting' | 'unstable';

interface NetworkStatusBannerProps {
  /** Custom className for styling */
  className?: string;
  /** Show connection quality (ping time) */
  showQuality?: boolean;
  /** Auto-hide when online */
  autoHide?: boolean;
}

/**
 * Network Status Banner Component
 * 
 * @description Shows real-time network status for messaging
 * @example
 * <NetworkStatusBanner showQuality autoHide />
 */
export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  className,
  showQuality = false,
  autoHide = true
}) => {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [lastOnline, setLastOnline] = useState<number>(Date.now());
  const [ping, setPing] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  
  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setStatus('online');
      setLastOnline(Date.now());
      
      if (autoHide) {
        setTimeout(() => setVisible(false), 3000);
      }
      
      logger.info('[NetworkStatus] Connection restored');
    };
    
    const handleOffline = () => {
      setStatus('offline');
      setVisible(true);
      logger.warn('[NetworkStatus] Connection lost');
    };
    
    // Listen to browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check current status
    if (!navigator.onLine) {
      setStatus('offline');
      setVisible(true);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoHide]);
  
  // Monitor connection quality (ping test)
  useEffect(() => {
    if (!showQuality || status === 'offline') {
      setPing(null);
      return;
    }
    
    const measurePing = async () => {
      const start = Date.now();
      
      try {
        // Ping Firebase RTDB endpoint
        const response = await fetch(
          'https://fire-new-globul-default-rtdb.europe-west1.firebasedatabase.app/.json?shallow=true',
          { method: 'HEAD', cache: 'no-cache' }
        );
        
        if (response.ok) {
          const pingTime = Date.now() - start;
          setPing(pingTime);
          
          // Determine quality
          if (pingTime > 1000) {
            setStatus('unstable');
            setVisible(true);
          } else if (status !== 'reconnecting') {
            setStatus('online');
            if (autoHide) {
              setVisible(false);
            }
          }
        }
      } catch (error) {
        setStatus('offline');
        setVisible(true);
      }
    };
    
    // Measure ping every 10 seconds
    const interval = setInterval(measurePing, 10000);
    measurePing(); // Initial measurement
    
    return () => clearInterval(interval);
  }, [showQuality, status, autoHide]);
  
  // Handle reconnection attempts
  const handleReconnect = () => {
    setStatus('reconnecting');
    setVisible(true);
    
    // Simulate reconnection attempt
    setTimeout(() => {
      if (navigator.onLine) {
        setStatus('online');
        setLastOnline(Date.now());
        
        if (autoHide) {
          setTimeout(() => setVisible(false), 3000);
        }
      } else {
        setStatus('offline');
      }
    }, 2000);
  };
  
  // Don't render if online and autoHide is true
  if (!visible && autoHide && status === 'online') {
    return null;
  }
  
  // Status config
  const statusConfig = {
    online: {
      icon: <Wifi size={16} />,
      text: 'Connected',
      textBg: 'You are online',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    offline: {
      icon: <WifiOff size={16} />,
      text: 'No connection',
      textBg: 'Check your internet connection',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)'
    },
    reconnecting: {
      icon: <RefreshCw size={16} />,
      text: 'Reconnecting...',
      textBg: 'Attempting to restore connection',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    unstable: {
      icon: <WifiOff size={16} />,
      text: 'Slow connection',
      textBg: 'Your connection is unstable',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)'
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <StyledBanner className={className} $status={status} $color={config.color} $bg={config.bg}>
      <IconWrapper $status={status}>
        {config.icon}
      </IconWrapper>
      
      <Content>
        <StatusText>{config.text}</StatusText>
        <SubText>{config.textBg}</SubText>
        
        {showQuality && ping !== null && status === 'online' && (
          <QualityIndicator $quality={ping < 300 ? 'good' : ping < 600 ? 'medium' : 'poor'}>
            {ping}ms
          </QualityIndicator>
        )}
      </Content>
      
      {status === 'offline' && (
        <ReconnectButton onClick={handleReconnect}>
          Retry
        </ReconnectButton>
      )}
    </StyledBanner>
  );
};

// ==================== STYLED COMPONENTS ====================

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledBanner = styled.div<{ $status: ConnectionStatus; $color: string; $bg: string }>`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  
  background: ${props => props.$bg};
  border: 1px solid ${props => props.$color};
  border-radius: 12px;
  
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    top: 8px;
    left: 8px;
    right: 8px;
    transform: none;
    padding: 10px 14px;
  }
`;

const IconWrapper = styled.div<{ $status: ConnectionStatus }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => 
    props.$status === 'online' ? '#10b981' :
    props.$status === 'offline' ? '#ef4444' :
    '#f59e0b'
  };
  
  ${props => props.$status === 'reconnecting' && `
    animation: ${spin} 1s linear infinite;
  `}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const StatusText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const SubText = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const QualityIndicator = styled.span<{ $quality: 'good' | 'medium' | 'poor' }>`
  display: inline-block;
  margin-top: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  
  background: ${props =>
    props.$quality === 'good' ? 'rgba(16, 185, 129, 0.2)' :
    props.$quality === 'medium' ? 'rgba(245, 158, 11, 0.2)' :
    'rgba(239, 68, 68, 0.2)'
  };
  
  color: ${props =>
    props.$quality === 'good' ? '#10b981' :
    props.$quality === 'medium' ? '#f59e0b' :
    '#ef4444'
  };
`;

const ReconnectButton = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default NetworkStatusBanner;
