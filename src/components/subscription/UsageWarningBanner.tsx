// src/components/subscription/UsageWarningBanner.tsx
// Usage Warning Banner Component
// Displays warnings when user approaches plan limits

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { usageTrackingService, UsageWarning } from '../../services/subscription/UsageTrackingService';
import styled from 'styled-components';

// ==================== STYLED COMPONENTS ====================

const BannerContainer = styled.div<{ severity: 'info' | 'warning' | 'error' }>`
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 600px;
  width: calc(100% - 2rem);
  background: ${props => 
    props.severity === 'error' ? 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)' :
    props.severity === 'warning' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from {
      transform: translate(-50%, -100%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    top: 60px;
    width: calc(100% - 1rem);
  }
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const BannerMessage = styled.div`
  font-size: 0.875rem;
  opacity: 0.95;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin-top: 0.75rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: white;
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const UpgradeButton = styled.button`
  background: white;
  color: #667eea;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const DismissButton = styled.button`
  background: transparent;
  color: white;
  font-size: 1.5rem;
  padding: 0;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

// ==================== COMPONENT ====================

export const UsageWarningBanner: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  
  const [warnings, setWarnings] = useState<UsageWarning[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [currentWarningIndex, setCurrentWarningIndex] = useState(0);

  useEffect(() => {
    const checkUsage = async () => {
      if (!currentUser) return;

      const usage = await usageTrackingService.getCurrentUsage(currentUser.uid);
      if (!usage) return;

      const usageWarnings = usageTrackingService.getUsageWarnings(usage);
      setWarnings(usageWarnings);
    };

    checkUsage();

    // Check usage every 5 minutes
    const interval = setInterval(checkUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Rotate warnings every 10 seconds if multiple
  useEffect(() => {
    if (warnings.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentWarningIndex((prev) => (prev + 1) % warnings.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [warnings.length]);

  const handleUpgrade = () => {
    navigate('/pricing');
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (warnings.length === 0 || dismissed) {
    return null;
  }

  const currentWarning = warnings[currentWarningIndex];
  const message = language === 'bg' ? currentWarning.message.bg : currentWarning.message.en;

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⏰';
      default:
        return 'ℹ️';
    }
  };

  const getTitle = (severity: string) => {
    switch (severity) {
      case 'error':
        return language === 'bg' ? 'Достигнат лимит!' : 'Limit Reached!';
      case 'warning':
        return language === 'bg' ? 'Близо до лимита' : 'Approaching Limit';
      default:
        return language === 'bg' ? 'Информация' : 'Information';
    }
  };

  return (
    <BannerContainer severity={currentWarning.severity}>
      <BannerContent>
        <IconWrapper>{getIcon(currentWarning.severity)}</IconWrapper>
        
        <TextContent>
          <BannerTitle>{getTitle(currentWarning.severity)}</BannerTitle>
          <BannerMessage>{message}</BannerMessage>
          
          <ProgressBar>
            <ProgressFill percentage={currentWarning.percentage} />
          </ProgressBar>
        </TextContent>

        <ActionButtons>
          {currentWarning.severity === 'error' && (
            <UpgradeButton onClick={handleUpgrade}>
              {language === 'bg' ? 'Надстрой' : 'Upgrade'}
            </UpgradeButton>
          )}
          <DismissButton onClick={handleDismiss}>×</DismissButton>
        </ActionButtons>
      </BannerContent>

      {warnings.length > 1 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '0.5rem', 
          fontSize: '0.75rem', 
          opacity: 0.8 
        }}>
          {currentWarningIndex + 1} / {warnings.length}
        </div>
      )}
    </BannerContainer>
  );
};

export default UsageWarningBanner;
